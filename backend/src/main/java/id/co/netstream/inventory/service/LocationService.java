package id.co.netstream.inventory.service;

import id.co.netstream.inventory.domain.entity.LocationEntity;
import id.co.netstream.inventory.domain.entity.RackEntity;
import id.co.netstream.inventory.domain.enums.LocationStatus;
import id.co.netstream.inventory.domain.enums.LocationType;
import id.co.netstream.inventory.dto.LocationDTOs.*;
import id.co.netstream.inventory.exception.DuplicateEntityException;
import id.co.netstream.inventory.exception.ResourceNotFoundException;
import id.co.netstream.inventory.repository.LocationRepository;
import id.co.netstream.inventory.repository.RackRepository;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class LocationService {

    private static final Logger LOG = Logger.getLogger(LocationService.class);

    @Inject
    LocationRepository locationRepository;

    @Inject
    RackRepository rackRepository;

    @Inject
    SecurityIdentity securityIdentity;

    public List<LocationResponse> getHierarchyTree() {
        List<LocationEntity> roots = locationRepository.findRoots();
        return roots.stream().map(this::mapToTreeDto).toList();
    }

    public List<LocationResponse> getLocationsByType(LocationType type) {
        return locationRepository.findByType(type).stream()
                .map(this::mapToDto)
                .toList();
    }

    public LocationResponse getLocationById(UUID id) {
        LocationEntity entity = locationRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with ID: " + id));
        return mapToDto(entity);
    }

    @Transactional
    public LocationResponse createLocation(CreateLocationRequest req) {
        String username = getUsername();
        if (locationRepository.findByCode(req.code()).isPresent()) {
            throw new DuplicateEntityException("Location with code '" + req.code() + "' already exists.");
        }

        LocationEntity entity = new LocationEntity();
        entity.parentId = req.parentId();
        entity.code = req.code().trim().toUpperCase();
        entity.name = req.name().trim();
        entity.type = req.type();
        entity.status = req.status() != null ? req.status() : LocationStatus.ACTIVE;
        entity.latitude = req.latitude();
        entity.longitude = req.longitude();
        entity.address = req.address();
        entity.contactPerson = req.contactPerson();
        entity.contactPhone = req.contactPhone();
        entity.createdBy = username;
        entity.updatedBy = username;

        locationRepository.persist(entity);
        return mapToDto(entity);
    }

    @Transactional
    public LocationResponse updateLocation(UUID id, UpdateLocationRequest req) {
        String username = getUsername();
        LocationEntity entity = locationRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with ID: " + id));

        if (!entity.code.equalsIgnoreCase(req.code().trim())) {
            locationRepository.findByCode(req.code().trim()).ifPresent(other -> {
                if (!other.id.equals(id)) {
                    throw new DuplicateEntityException("Location with code '" + req.code() + "' already exists.");
                }
            });
        }

        if (req.parentId() != null && req.parentId().equals(id)) {
            throw new IllegalArgumentException("A location cannot be set as its own parent.");
        }

        entity.parentId = req.parentId();
        entity.code = req.code().trim().toUpperCase();
        entity.name = req.name().trim();
        entity.type = req.type();
        entity.status = req.status() != null ? req.status() : (entity.status != null ? entity.status : LocationStatus.ACTIVE);
        entity.latitude = req.latitude();
        entity.longitude = req.longitude();
        entity.address = req.address();
        entity.contactPerson = req.contactPerson();
        entity.contactPhone = req.contactPhone();
        entity.updatedBy = username;

        return mapToDto(entity);
    }

    public List<RackResponse> getAllRacks() {
        return rackRepository.listAll().stream()
                .map(this::mapToRackDto)
                .toList();
    }

    public List<RackResponse> getRacksByLocation(UUID locationId) {
        return rackRepository.findByLocationId(locationId).stream()
                .map(this::mapToRackDto)
                .toList();
    }

    @Transactional
    public RackResponse createRack(CreateRackRequest req) {
        String username = getUsername();
        if (rackRepository.findByLocationAndNumber(req.locationId(), req.rackNumber()).isPresent()) {
            throw new DuplicateEntityException("Rack '" + req.rackNumber() + "' already exists in this location.");
        }

        RackEntity rack = new RackEntity();
        rack.locationId = req.locationId();
        rack.rackNumber = req.rackNumber().trim();
        rack.heightUnits = req.heightUnits() != null ? req.heightUnits() : 42;
        rack.maxPowerWatt = req.maxPowerWatt() != null ? req.maxPowerWatt() : new BigDecimal("5000.00");
        rack.maxWeightKg = req.maxWeightKg() != null ? req.maxWeightKg() : new BigDecimal("800.00");
        rack.createdBy = username;
        rack.updatedBy = username;

        rackRepository.persist(rack);
        return mapToRackDto(rack);
    }

    private LocationResponse mapToDto(LocationEntity entity) {
        return new LocationResponse(
                entity.id,
                entity.parentId,
                entity.code,
                entity.name,
                entity.type,
                entity.status != null ? entity.status : LocationStatus.ACTIVE,
                entity.latitude,
                entity.longitude,
                entity.address,
                entity.contactPerson,
                entity.contactPhone,
                entity.createdAt,
                entity.updatedAt,
                null
        );
    }

    private LocationResponse mapToTreeDto(LocationEntity entity) {
        List<LocationResponse> children = locationRepository.findByParentId(entity.id).stream()
                .map(this::mapToTreeDto)
                .toList();

        return new LocationResponse(
                entity.id,
                entity.parentId,
                entity.code,
                entity.name,
                entity.type,
                entity.status != null ? entity.status : LocationStatus.ACTIVE,
                entity.latitude,
                entity.longitude,
                entity.address,
                entity.contactPerson,
                entity.contactPhone,
                entity.createdAt,
                entity.updatedAt,
                children
        );
    }

    private RackResponse mapToRackDto(RackEntity entity) {
        int occupiedUnits = entity.devices != null ? entity.devices.stream().mapToInt(d -> d.rackUnitHeight != null ? d.rackUnitHeight : 1).sum() : 0;
        int availableUnits = Math.max(0, entity.heightUnits - occupiedUnits);

        return new RackResponse(
                entity.id,
                entity.locationId,
                entity.rackNumber,
                entity.heightUnits,
                entity.maxPowerWatt,
                entity.currentPowerWatt,
                entity.maxWeightKg,
                entity.status,
                occupiedUnits,
                availableUnits
        );
    }

    private String getUsername() {
        if (securityIdentity != null && securityIdentity.getPrincipal() != null && securityIdentity.getPrincipal().getName() != null) {
            return securityIdentity.getPrincipal().getName();
        }
        return "system";
    }
}
