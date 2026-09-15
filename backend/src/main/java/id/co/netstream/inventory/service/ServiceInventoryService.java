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

        UUID aEndId = req.aEndLocationId() != null
                ? req.aEndLocationId()
                : UUID.fromString("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"); // Jakarta Mega Pop Hub
        UUID zEndId = req.zEndLocationId() != null
                ? req.zEndLocationId()
                : UUID.fromString("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11"); // Bandung Transit Hub

        locationRepository.findByIdOptional(aEndId)
                .orElseThrow(() -> new ResourceNotFoundException("A-End Location not found with ID: " + aEndId));
        locationRepository.findByIdOptional(zEndId)
                .orElseThrow(() -> new ResourceNotFoundException("Z-End Location not found with ID: " + zEndId));

        NetworkServiceEntity service = new NetworkServiceEntity();
        service.serviceCode = req.serviceCode().trim().toUpperCase();
        service.customerName = req.customerName().trim();
        service.serviceType = req.serviceType();
        service.bandwidthMbps = req.bandwidthMbps();
        service.slaTier = req.slaTier() != null ? req.slaTier() : "STANDARD";
        service.slaAvailabilityPct = req.slaAvailabilityPct() != null ? req.slaAvailabilityPct() : new BigDecimal("99.90");
        service.monthlyRecurringCost = req.monthlyRecurringCost() != null ? req.monthlyRecurringCost() : BigDecimal.ZERO;
        service.status = ServiceStatus.ACTIVE;
        service.aEndLocationId = aEndId;
        service.zEndLocationId = zEndId;
        service.activationDate = OffsetDateTime.now();
        service.createdBy = username;
        service.updatedBy = username;

        serviceRepository.persist(service);

        if (req.mappings() != null && !req.mappings().isEmpty()) {
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
        } else {
            generateDefaultHops(service);
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

    private void generateDefaultHops(NetworkServiceEntity service) {
        var aDevice = deviceRepository.find("locationId", service.aEndLocationId).firstResultOptional()
                .or(() -> deviceRepository.find("deviceType in ('ROUTER', 'SWITCH', 'METRO')").firstResultOptional());
        var zDevice = deviceRepository.find("locationId", service.zEndLocationId).firstResultOptional()
                .or(() -> deviceRepository.find("deviceType in ('ROUTER', 'SWITCH', 'METRO')").firstResultOptional());

        int order = 1;
        if (aDevice.isPresent()) {
            ServiceResourceMappingEntity m1 = new ServiceResourceMappingEntity();
            m1.service = service;
            m1.deviceId = aDevice.get().id;
            m1.device = aDevice.get();
            if (aDevice.get().ports != null && !aDevice.get().ports.isEmpty()) {
                m1.portId = aDevice.get().ports.get(0).id;
                m1.port = aDevice.get().ports.get(0);
            }
            m1.resourceRole = "ORIGIN_ACCESS_NODE";
            m1.hopOrder = order++;
            m1.allocatedBandwidthMbps = service.bandwidthMbps;
            mappingRepository.persist(m1);
        }

        var transportDevice = deviceRepository.find("deviceType in ('DWDM_CHASSIS', 'ROUTER', 'CORE')").firstResultOptional();
        if (transportDevice.isPresent() && (aDevice.isEmpty() || !transportDevice.get().id.equals(aDevice.get().id))) {
            ServiceResourceMappingEntity m2 = new ServiceResourceMappingEntity();
            m2.service = service;
            m2.deviceId = transportDevice.get().id;
            m2.device = transportDevice.get();
            if (transportDevice.get().ports != null && !transportDevice.get().ports.isEmpty()) {
                m2.portId = transportDevice.get().ports.get(0).id;
                m2.port = transportDevice.get().ports.get(0);
            }
            m2.resourceRole = "CORE_OPTICAL_TRANSPORT";
            m2.hopOrder = order++;
            m2.allocatedBandwidthMbps = service.bandwidthMbps;
            mappingRepository.persist(m2);
        }

        if (zDevice.isPresent()) {
            ServiceResourceMappingEntity m3 = new ServiceResourceMappingEntity();
            m3.service = service;
            m3.deviceId = zDevice.get().id;
            m3.device = zDevice.get();
            if (zDevice.get().ports != null && !zDevice.get().ports.isEmpty()) {
                int lastIdx = zDevice.get().ports.size() - 1;
                m3.portId = zDevice.get().ports.get(lastIdx).id;
                m3.port = zDevice.get().ports.get(lastIdx);
            }
            m3.resourceRole = "TERMINATION_ACCESS_NODE";
            m3.hopOrder = order++;
            m3.allocatedBandwidthMbps = service.bandwidthMbps;
            mappingRepository.persist(m3);
        }
    }

    private String getUsername() {
        if (securityIdentity != null && securityIdentity.getPrincipal() != null && securityIdentity.getPrincipal().getName() != null) {
            return securityIdentity.getPrincipal().getName();
        }
        return "system";
    }
}
