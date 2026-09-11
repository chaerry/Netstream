package id.co.netstream.inventory.service;

import id.co.netstream.inventory.domain.entity.NetworkServiceEntity;
import id.co.netstream.inventory.domain.entity.ServiceResourceMappingEntity;
import id.co.netstream.inventory.domain.enums.ServiceStatus;
import id.co.netstream.inventory.domain.enums.ServiceType;
import id.co.netstream.inventory.dto.ServiceDTOs.*;
import id.co.netstream.inventory.exception.DuplicateEntityException;
import id.co.netstream.inventory.exception.ResourceNotFoundException;
import id.co.netstream.inventory.repository.DevicePortRepository;
import id.co.netstream.inventory.repository.LocationRepository;
import id.co.netstream.inventory.repository.NetworkDeviceRepository;
import id.co.netstream.inventory.repository.NetworkServiceRepository;
import id.co.netstream.inventory.repository.ServiceResourceMappingRepository;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ServiceInventoryService {

    private static final Logger LOG = Logger.getLogger(ServiceInventoryService.class);

    @Inject
    NetworkServiceRepository serviceRepository;

    @Inject
    ServiceResourceMappingRepository mappingRepository;

    @Inject
    LocationRepository locationRepository;

    @Inject
    NetworkDeviceRepository deviceRepository;

    @Inject
    DevicePortRepository portRepository;

    @Inject
    SecurityIdentity securityIdentity;

    public List<ServiceDetailResponse> listServices(String search, ServiceType type, ServiceStatus status) {
        return serviceRepository.searchServices(search, type, status).stream()
                .map(this::mapToDto)
                .toList();
    }

    public ServiceDetailResponse getServiceById(UUID id) {
        NetworkServiceEntity entity = serviceRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + id));
        return mapToDto(entity);
    }

    @Transactional
    public ServiceDetailResponse createService(CreateServiceRequest req) {
        String username = getUsername();
        if (serviceRepository.findByServiceCode(req.serviceCode()).isPresent()) {
            throw new DuplicateEntityException("Service with code '" + req.serviceCode() + "' already exists.");
        }

        locationRepository.findByIdOptional(req.aEndLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("A-End Location not found with ID: " + req.aEndLocationId()));
        locationRepository.findByIdOptional(req.zEndLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Z-End Location not found with ID: " + req.zEndLocationId()));

        NetworkServiceEntity service = new NetworkServiceEntity();
        service.serviceCode = req.serviceCode().trim().toUpperCase();
        service.customerName = req.customerName().trim();
        service.serviceType = req.serviceType();
        service.bandwidthMbps = req.bandwidthMbps();
        service.slaTier = req.slaTier() != null ? req.slaTier() : "STANDARD";
        service.slaAvailabilityPct = req.slaAvailabilityPct() != null ? req.slaAvailabilityPct() : new BigDecimal("99.90");
        service.monthlyRecurringCost = req.monthlyRecurringCost() != null ? req.monthlyRecurringCost() : BigDecimal.ZERO;
        service.status = ServiceStatus.PROVISIONING;
        service.aEndLocationId = req.aEndLocationId();
        service.zEndLocationId = req.zEndLocationId();
        service.activationDate = OffsetDateTime.now();
        service.createdBy = username;
        service.updatedBy = username;

        serviceRepository.persist(service);

        if (req.mappings() != null) {
            for (CreateResourceMappingRequest m : req.mappings()) {
                ServiceResourceMappingEntity mapping = new ServiceResourceMappingEntity();
                mapping.service = service;
                mapping.deviceId = m.deviceId();
                mapping.portId = m.portId();
                mapping.vneId = m.vneId();
                mapping.resourceRole = m.resourceRole();
                mapping.hopOrder = m.hopOrder();
                mapping.allocatedBandwidthMbps = m.allocatedBandwidthMbps();
                mappingRepository.persist(mapping);
            }
        }

        return mapToDto(service);
    }

    @Transactional
    public ServiceDetailResponse updateServiceStatus(UUID id, ServiceStatus newStatus) {
        String username = getUsername();
        NetworkServiceEntity service = serviceRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + id));

        LOG.infof("Updating status for service %s to %s by %s", service.serviceCode, newStatus, username);
        service.status = newStatus;
        if (newStatus == ServiceStatus.TERMINATED) {
            service.terminationDate = OffsetDateTime.now();
        }
        service.updatedBy = username;

        return mapToDto(service);
    }

    @Transactional
    public void deleteService(UUID id) {
        NetworkServiceEntity service = serviceRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + id));
        serviceRepository.delete(service);
    }

    private ServiceDetailResponse mapToDto(NetworkServiceEntity s) {
        String aName = s.aEndLocation != null ? s.aEndLocation.name : null;
        String zName = s.zEndLocation != null ? s.zEndLocation.name : null;

        List<ResourceMappingResponse> mappingDtos = s.resourceMappings != null ? s.resourceMappings.stream()
                .sorted(java.util.Comparator.comparingInt(m -> m.hopOrder != null ? m.hopOrder : 0))
                .map(m -> {
            String devName = m.device != null ? m.device.hostname : null;
            String pName = m.port != null ? m.port.portName : null;
            String vName = m.vne != null ? m.vne.vneName : null;
            return new ResourceMappingResponse(
                    m.id,
                    m.deviceId,
                    devName,
                    m.portId,
                    pName,
                    m.vneId,
                    vName,
                    m.resourceRole,
                    m.hopOrder,
                    m.allocatedBandwidthMbps
            );
        }).toList() : List.of();

        return new ServiceDetailResponse(
                s.id,
                s.serviceCode,
                s.customerName,
                s.serviceType,
                s.bandwidthMbps,
                s.slaTier,
                s.slaAvailabilityPct,
                s.monthlyRecurringCost,
                s.status,
                s.aEndLocationId,
                aName,
                s.zEndLocationId,
                zName,
                s.activationDate,
                s.terminationDate,
                mappingDtos,
                s.createdAt,
                s.updatedAt,
                s.createdBy,
                s.updatedBy
        );
    }

    private String getUsername() {
        if (securityIdentity != null && securityIdentity.getPrincipal() != null && securityIdentity.getPrincipal().getName() != null) {
            return securityIdentity.getPrincipal().getName();
        }
        return "system";
    }
}
