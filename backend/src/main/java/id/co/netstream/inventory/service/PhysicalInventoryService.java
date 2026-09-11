package id.co.netstream.inventory.service;

import id.co.netstream.inventory.domain.entity.DevicePortEntity;
import id.co.netstream.inventory.domain.entity.NetworkDeviceEntity;
import id.co.netstream.inventory.domain.entity.NetworkServiceEntity;
import id.co.netstream.inventory.domain.entity.ServiceResourceMappingEntity;
import id.co.netstream.inventory.domain.enums.OperationalStatus;
import id.co.netstream.inventory.dto.CommonDTOs.PagedResponse;
import id.co.netstream.inventory.dto.DeviceDTOs.*;
import id.co.netstream.inventory.exception.DuplicateEntityException;
import id.co.netstream.inventory.exception.ResourceNotFoundException;
import id.co.netstream.inventory.repository.DevicePortRepository;
import id.co.netstream.inventory.repository.DeviceTypeRepository;
import id.co.netstream.inventory.repository.LocationRepository;
import id.co.netstream.inventory.repository.NetworkDeviceRepository;
import id.co.netstream.inventory.repository.NetworkServiceRepository;
import id.co.netstream.inventory.repository.OpticalCableRepository;
import id.co.netstream.inventory.repository.RackRepository;
import id.co.netstream.inventory.repository.ServiceResourceMappingRepository;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class PhysicalInventoryService {

    private static final Logger LOG = Logger.getLogger(PhysicalInventoryService.class);

    @Inject
    NetworkDeviceRepository deviceRepository;

    @Inject
    DeviceTypeRepository deviceTypeRepository;

    @Inject
    DevicePortRepository portRepository;

    @Inject
    OpticalCableRepository opticalCableRepository;

    @Inject
    NetworkServiceRepository serviceRepository;

    @Inject
    ServiceResourceMappingRepository mappingRepository;

    @Inject
    LocationRepository locationRepository;

    @Inject
    RackRepository rackRepository;

    @Inject
    SecurityIdentity securityIdentity;

    @Inject
    EntityManager entityManager;

    public List<DeviceTypeResponse> getAvailableDeviceTypes() {
        return deviceTypeRepository.findActive().stream()
                .map(dt -> new DeviceTypeResponse(
                        dt.code,
                        dt.name,
                        dt.category,
                        dt.description,
                        dt.isActive,
                        dt.displayOrder
                ))
                .toList();
    }

    @Transactional
    public DeviceDetailResponse createDevice(CreateDeviceRequest req) {
        String username = getUsername();
        LOG.infof("User %s creating new device: %s", username, req.hostname());

        if (deviceRepository.findByHostname(req.hostname()).isPresent()) {
            throw new DuplicateEntityException("Device with hostname '" + req.hostname() + "' already exists.");
        }
        if (deviceRepository.findBySerialNumber(req.serialNumber()).isPresent()) {
            throw new DuplicateEntityException("Device with serial number '" + req.serialNumber() + "' already exists.");
        }

        locationRepository.findByIdOptional(req.locationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with ID: " + req.locationId()));

        deviceTypeRepository.findByIdOptional(req.deviceType().trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Device type '" + req.deviceType() + "' is not registered."));

        NetworkDeviceEntity entity = new NetworkDeviceEntity();
        entity.locationId = req.locationId();
        entity.rackId = req.rackId();
        entity.hostname = req.hostname().trim();
        entity.serialNumber = req.serialNumber().trim();
        entity.assetTag = req.assetTag();
        entity.deviceType = req.deviceType().trim().toUpperCase();
        entity.vendor = req.vendor();
        entity.model = req.model();
        entity.hardwareVersion = req.hardwareVersion();
        entity.firmwareVersion = req.firmwareVersion();
        entity.rackUnitStart = req.rackUnitStart();
        entity.rackUnitHeight = req.rackUnitHeight() != null ? req.rackUnitHeight() : 1;
        entity.status = OperationalStatus.PLANNED;
        entity.managementIp = req.managementIp();
        entity.costUsd = req.costUsd() != null ? req.costUsd() : BigDecimal.ZERO;
        entity.createdBy = username;
        entity.updatedBy = username;

        deviceRepository.persist(entity);
        return mapToDto(entity);
    }

    public DeviceDetailResponse getDeviceById(UUID id) {
        NetworkDeviceEntity entity = deviceRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Network device not found with ID: " + id));
        return mapToDto(entity);
    }

    public PagedResponse<DeviceDetailResponse> listDevices(
            String search,
            String type,
            OperationalStatus status,
            UUID locationId,
            int page,
            int size
    ) {
        String cleanSearch = search != null ? search.trim().replaceAll("\\s+", " ") : null;
        if (cleanSearch != null && cleanSearch.isEmpty()) {
            cleanSearch = null;
        }

        PanacheQuery<NetworkDeviceEntity> query = deviceRepository.searchDevices(
                cleanSearch, type, status, locationId, page, size
        );

        List<DeviceDetailResponse> items = query.list().stream()
                .map(this::mapToDto)
                .toList();

        return new PagedResponse<>(
                items,
                query.count(),
                query.pageCount(),
                page,
                size
        );
    }

    public List<DeviceDetailResponse> getDevicesByRack(UUID rackId) {
        return deviceRepository.findByRackId(rackId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public DeviceDetailResponse updateDeviceStatus(UUID id, UpdateDeviceStatusRequest req) {
        String username = getUsername();
        NetworkDeviceEntity entity = deviceRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Network device not found with ID: " + id));

        LOG.infof("Updating status for device %s from %s to %s by %s. Reason: %s",
                entity.hostname, entity.status, req.status(), username, req.reason());

        entity.status = req.status();
        entity.updatedBy = username;

        return mapToDto(entity);
    }

    @Transactional
    public DeviceDetailResponse updateDevice(UUID id, UpdateDeviceRequest req) {
        String username = getUsername();
        NetworkDeviceEntity entity = deviceRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Network device not found with ID: " + id));

        LOG.infof("User %s updating device %s (IP=%s, Rack=%s, UStart=%s, Status=%s)",
                username, entity.hostname, req.managementIp(), req.rackId(), req.rackUnitStart(), req.status());

        if (req.rackId() != null) {
            rackRepository.findByIdOptional(req.rackId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rack not found with ID: " + req.rackId()));
            entity.rackId = req.rackId();
        }
        if (req.rackUnitStart() != null) {
            entity.rackUnitStart = req.rackUnitStart();
        }
        if (req.rackUnitHeight() != null) {
            entity.rackUnitHeight = req.rackUnitHeight();
        }
        if (req.managementIp() != null) {
            entity.managementIp = req.managementIp().trim();
        }
        if (req.status() != null) {
            entity.status = req.status();
        }
        if (req.assetTag() != null) {
            entity.assetTag = req.assetTag().trim();
        }
        if (req.firmwareVersion() != null) {
            entity.firmwareVersion = req.firmwareVersion().trim();
        }
        if (req.hardwareVersion() != null) {
            entity.hardwareVersion = req.hardwareVersion().trim();
        }
        if (req.costUsd() != null) {
            entity.costUsd = req.costUsd();
        }
        entity.updatedBy = username;

        return mapToDto(entity);
    }

    @Transactional
    public PortResponse addPortToDevice(UUID deviceId, CreatePortRequest req) {
        NetworkDeviceEntity device = deviceRepository.findByIdOptional(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Network device not found with ID: " + deviceId));

        if (portRepository.findByDeviceAndPortName(deviceId, req.portName()).isPresent()) {
            throw new DuplicateEntityException("Port '" + req.portName() + "' already exists on device '" + device.hostname + "'.");
        }

        DevicePortEntity port = new DevicePortEntity();
        port.device = device;
        port.portName = req.portName();
        port.portSpeedMbps = req.portSpeedMbps();
        port.mediumType = req.mediumType();
        port.connectorType = req.connectorType() != null ? req.connectorType() : "LC/UPC";
        port.macAddress = req.macAddress();
        port.isOperational = true;
        port.isAllocated = false;

        portRepository.persist(port);
        device.totalPorts = (device.totalPorts != null ? device.totalPorts : 0) + 1;

        return mapToPortDto(port);
    }

    public List<PortResponse> getPortsByDevice(UUID deviceId) {
        return portRepository.findByDeviceId(deviceId).stream()
                .map(this::mapToPortDto)
                .toList();
    }

    @Transactional
    public PortResponse allocatePort(UUID portId, AllocatePortRequest req) {
        DevicePortEntity port = portRepository.findByIdOptional(portId)
                .orElseThrow(() -> new ResourceNotFoundException("Port interface not found with ID: " + portId));

        NetworkServiceEntity service = serviceRepository.findByIdOptional(req.serviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Circuit/Service not found with ID: " + req.serviceId()));

        ServiceResourceMappingEntity mapping = mappingRepository.findByPortId(portId).orElseGet(ServiceResourceMappingEntity::new);
        mapping.service = service;
        mapping.portId = port.id;
        mapping.deviceId = port.device != null ? port.device.id : null;
        mapping.resourceRole = req.resourceRole() != null ? req.resourceRole().trim() : "ACCESS_PORT";
        mapping.allocatedBandwidthMbps = req.allocatedBandwidthMbps() != null ? req.allocatedBandwidthMbps() : (port.portSpeedMbps != null ? port.portSpeedMbps : 1000);
        mapping.hopOrder = req.hopOrder() != null ? req.hopOrder() : 1;

        if (mapping.id == null) {
            mappingRepository.persist(mapping);
        }

        if (req.connectedPortId() != null) {
            port.connectedPortId = req.connectedPortId();
            portRepository.findByIdOptional(req.connectedPortId()).ifPresent(peerPort -> {
                peerPort.connectedPortId = port.id;
            });
        }

        port.isAllocated = true;
        LOG.infof("Port %s allocated to circuit %s (%s) at Hop #%d", port.portName, service.serviceCode, service.customerName, mapping.hopOrder);

        return mapToPortDto(port);
    }

    @Transactional
    public PortResponse releasePort(UUID portId) {
        DevicePortEntity port = portRepository.findByIdOptional(portId)
                .orElseThrow(() -> new ResourceNotFoundException("Port interface not found with ID: " + portId));

        mappingRepository.findByPortId(portId).ifPresent(mapping -> {
            mappingRepository.delete(mapping);
            LOG.infof("Deleted circuit resource mapping for port %s", port.portName);
        });

        port.isAllocated = false;
        return mapToPortDto(port);
    }

    @Transactional
    public void deleteDevice(UUID id) {
        String username = getUsername();
        NetworkDeviceEntity entity = deviceRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Network device not found with ID: " + id));

        // 1. Check allocated ports
        long allocatedPorts = entity.ports != null 
                ? entity.ports.stream().filter(p -> Boolean.TRUE.equals(p.isAllocated)).count()
                : 0;
        if (allocatedPorts > 0) {
            throw new IllegalStateException("Cannot decommission device '" + entity.hostname + "': " + allocatedPorts + " port(s) are actively allocated to customer circuits. Release ports first.");
        }

        // 2. Check service resource mappings
        long activeHops = mappingRepository.find("device.id", id).count();
        if (activeHops > 0) {
            throw new IllegalStateException("Cannot decommission device '" + entity.hostname + "': It is referenced in " + activeHops + " active service route hop(s).");
        }

        // 3. Check attached optical cables (origin or termination)
        long attachedCables = opticalCableRepository.find("originDeviceId = ?1 or terminationDeviceId = ?1", id).count();
        if (attachedCables > 0) {
            throw new IllegalStateException("Cannot decommission device '" + entity.hostname + "': " + attachedCables + " optical cable(s) originate from or terminate at this equipment.");
        }

        LOG.warnf("User %s deleting device %s (ID: %s)", username, entity.hostname, id);
        deviceRepository.delete(entity);
    }

    private DeviceDetailResponse mapToDto(NetworkDeviceEntity entity) {
        List<PortResponse> portDtos = entity.ports != null ? entity.ports.stream().map(this::mapToPortDto).toList() : List.of();
        String locationName = entity.location != null ? entity.location.name : null;
        String rackNumber = entity.rack != null ? entity.rack.rackNumber : null;

        return new DeviceDetailResponse(
                entity.id,
                entity.locationId,
                locationName,
                entity.rackId,
                rackNumber,
                entity.hostname,
                entity.serialNumber,
                entity.assetTag,
                entity.deviceType,
                entity.vendor,
                entity.model,
                entity.hardwareVersion,
                entity.firmwareVersion,
                entity.rackUnitStart,
                entity.rackUnitHeight,
                entity.status,
                entity.managementIp,
                entity.totalPorts,
                entity.costUsd,
                portDtos,
                entity.createdAt,
                entity.updatedAt,
                entity.createdBy,
                entity.updatedBy
        );
    }

    private PortResponse mapToPortDto(DevicePortEntity port) {
        UUID serviceId = null;
        String serviceCode = null;
        String customerName = null;
        String resourceRole = null;
        Integer allocatedBw = null;

        var mappingOpt = mappingRepository.findByPortId(port.id);
        if (mappingOpt.isPresent()) {
            var m = mappingOpt.get();
            if (m.service != null) {
                serviceId = m.service.id;
                serviceCode = m.service.serviceCode;
                customerName = m.service.customerName;
            }
            resourceRole = m.resourceRole;
            allocatedBw = m.allocatedBandwidthMbps;
        }

        return new PortResponse(
                port.id,
                port.device != null ? port.device.id : null,
                port.portName,
                port.portSpeedMbps,
                port.mediumType,
                port.connectorType,
                port.macAddress,
                port.isOperational,
                port.isAllocated,
                port.connectedPortId,
                serviceId,
                serviceCode,
                customerName,
                resourceRole,
                allocatedBw
        );
    }

    private String getUsername() {
        if (securityIdentity != null && securityIdentity.getPrincipal() != null && securityIdentity.getPrincipal().getName() != null) {
            return securityIdentity.getPrincipal().getName();
        }
        return "system";
    }
}
