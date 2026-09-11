package id.co.netstream.inventory.service;

import id.co.netstream.inventory.domain.entity.VirtualNetworkElementEntity;
import id.co.netstream.inventory.domain.enums.OperationalStatus;
import id.co.netstream.inventory.dto.VirtualInventoryDTOs.*;
import id.co.netstream.inventory.exception.DuplicateEntityException;
import id.co.netstream.inventory.exception.ResourceNotFoundException;
import id.co.netstream.inventory.repository.NetworkDeviceRepository;
import id.co.netstream.inventory.repository.VirtualNetworkElementRepository;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class LogicalInventoryService {

    private static final Logger LOG = Logger.getLogger(LogicalInventoryService.class);

    @Inject
    VirtualNetworkElementRepository vneRepository;

    @Inject
    NetworkDeviceRepository deviceRepository;

    @Inject
    SecurityIdentity securityIdentity;

    public List<VneResponse> listAllVnes() {
        return vneRepository.listAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    public VneResponse getVneById(UUID id) {
        VirtualNetworkElementEntity entity = vneRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Virtual Network Element not found with ID: " + id));
        return mapToDto(entity);
    }

    @Transactional
    public VneResponse createVne(CreateVneRequest req) {
        String username = getUsername();
        if (vneRepository.findByName(req.vneName()).isPresent()) {
            throw new DuplicateEntityException("VNE with name '" + req.vneName() + "' already exists.");
        }

        if (req.hypervisorDeviceId() != null) {
            deviceRepository.findByIdOptional(req.hypervisorDeviceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hypervisor device not found with ID: " + req.hypervisorDeviceId()));
        }

        VirtualNetworkElementEntity entity = new VirtualNetworkElementEntity();
        entity.hypervisorDeviceId = req.hypervisorDeviceId();
        entity.vneName = req.vneName().trim();
        entity.vnfType = req.vnfType().trim();
        entity.vlanId = req.vlanId();
        entity.vrfName = req.vrfName();
        entity.allocatedVcpu = req.allocatedVcpu();
        entity.allocatedRamGb = req.allocatedRamGb();
        entity.allocatedDiskGb = req.allocatedDiskGb();
        entity.status = OperationalStatus.ACTIVE;
        entity.createdBy = username;
        entity.updatedBy = username;

        vneRepository.persist(entity);
        return mapToDto(entity);
    }

    @Transactional
    public void deleteVne(UUID id) {
        VirtualNetworkElementEntity entity = vneRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("VNE not found with ID: " + id));
        vneRepository.delete(entity);
    }

    private VneResponse mapToDto(VirtualNetworkElementEntity entity) {
        String hypervisorName = entity.hypervisorDevice != null ? entity.hypervisorDevice.hostname : null;
        return new VneResponse(
                entity.id,
                entity.hypervisorDeviceId,
                hypervisorName,
                entity.vneName,
                entity.vnfType,
                entity.vlanId,
                entity.vrfName,
                entity.allocatedVcpu,
                entity.allocatedRamGb,
                entity.allocatedDiskGb,
                entity.status,
                entity.createdAt,
                entity.updatedAt
        );
    }

    private String getUsername() {
        if (securityIdentity != null && securityIdentity.getPrincipal() != null && securityIdentity.getPrincipal().getName() != null) {
            return securityIdentity.getPrincipal().getName();
        }
        return "system";
    }
}
