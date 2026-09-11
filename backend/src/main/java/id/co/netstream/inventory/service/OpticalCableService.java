package id.co.netstream.inventory.service;

import id.co.netstream.inventory.domain.entity.CableStrandEntity;
import id.co.netstream.inventory.domain.entity.OpticalCableEntity;
import id.co.netstream.inventory.domain.enums.StrandStatus;
import id.co.netstream.inventory.dto.OpticalCableDTOs.*;
import id.co.netstream.inventory.exception.DuplicateEntityException;
import id.co.netstream.inventory.exception.ResourceNotFoundException;
import id.co.netstream.inventory.repository.CableStrandRepository;
import id.co.netstream.inventory.repository.OpticalCableRepository;
import io.agroal.api.AgroalDataSource;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class OpticalCableService {

    private static final Logger LOG = Logger.getLogger(OpticalCableService.class);

    private static final String[][] TIA_598_COLORS = {
            {"Blue", "#3b82f6"},
            {"Orange", "#f97316"},
            {"Green", "#22c55e"},
            {"Brown", "#92400e"},
            {"Slate", "#64748b"},
            {"White", "#f8fafc"},
            {"Red", "#ef4444"},
            {"Black", "#1e293b"},
            {"Yellow", "#eab308"},
            {"Violet", "#a855f7"},
            {"Rose", "#ec4899"},
            {"Aqua", "#06b6d4"}
    };

    @Inject
    OpticalCableRepository cableRepository;

    @Inject
    CableStrandRepository strandRepository;

    @Inject
    AgroalDataSource dataSource;

    @Inject
    SecurityIdentity securityIdentity;

    private String getUsername() {
        if (securityIdentity != null && securityIdentity.getPrincipal() != null) {
            return securityIdentity.getPrincipal().getName();
        }
        return "system";
    }

    public List<OpticalCableResponse> getAllCables() {
        return cableRepository.listAll().stream()
                .map(this::mapToCableDto)
                .toList();
    }

    public OpticalCableResponse getCableById(UUID id) {
        OpticalCableEntity cable = cableRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Optical cable not found with ID: " + id));
        return mapToCableDto(cable);
    }

    @Transactional
    public OpticalCableResponse createCable(CreateCableRequest req) {
        String username = getUsername();
        String code = req.cableCode().trim().toUpperCase();

        if (cableRepository.findByCode(code).isPresent()) {
            throw new DuplicateEntityException("Optical cable with code already exists: " + code);
        }

        LOG.infof("Creating new optical cable %s (%d cores) by %s", code, req.totalCores(), username);

        OpticalCableEntity cable = new OpticalCableEntity();
        cable.cableCode = code;
        cable.cableName = req.cableName().trim();
        cable.cableType = req.cableType();
        cable.fiberGrade = req.fiberGrade();
        cable.totalCores = req.totalCores();
        cable.lengthMeters = req.lengthMeters() != null ? req.lengthMeters() : BigDecimal.ZERO;
        cable.originLocationId = req.originLocationId();
        cable.originDeviceId = req.originDeviceId();
        cable.terminationLocationId = req.terminationLocationId();
        cable.terminationDeviceId = req.terminationDeviceId();
        cable.installationType = req.installationType() != null ? req.installationType().trim() : "UNDERGROUND_DUCT";
        cable.sheathType = req.sheathType() != null ? req.sheathType().trim() : "ARMORED_HDPE";
        cable.attenuationDbPerKm = req.attenuationDbPerKm() != null ? req.attenuationDbPerKm() : new BigDecimal("0.350");
        cable.status = "ACTIVE";
        cable.createdBy = username;
        cable.updatedBy = username;

        cableRepository.persist(cable);

        // Automatically generate all individual strands (1..totalCores) with TIA-598 standard color sequences
        BigDecimal estLoss = cable.attenuationDbPerKm.multiply(cable.lengthMeters.divide(BigDecimal.valueOf(1000), 4, java.math.RoundingMode.HALF_UP));
        for (int coreNum = 1; coreNum <= cable.totalCores; coreNum++) {
            int colorIdx = (coreNum - 1) % 12;
            int tubeNum = ((coreNum - 1) / 12) + 1;
            String colorName = TIA_598_COLORS[colorIdx][0];
            String colorHex = TIA_598_COLORS[colorIdx][1];

            CableStrandEntity strand = new CableStrandEntity();
            strand.cable = cable;
            strand.coreNumber = coreNum;
            strand.tubeNumber = tubeNum;
            strand.colorName = colorName;
            strand.colorHex = colorHex;
            strand.status = StrandStatus.AVAILABLE;
            strand.measuredLossDb = estLoss.setScale(2, java.math.RoundingMode.HALF_UP);
            strand.remarks = "Dark Fiber Core (Available)";

            strandRepository.persist(strand);
            cable.strands.add(strand);
        }

        return mapToCableDto(cable);
    }

    @Transactional
    public CableStrandResponse updateStrand(UUID strandId, UpdateStrandRequest req) {
        CableStrandEntity strand = strandRepository.findByIdOptional(strandId)
                .orElseThrow(() -> new ResourceNotFoundException("Cable strand not found with ID: " + strandId));

        if (req.status() != null) {
            strand.status = req.status();
        }
        if (req.allocatedServiceId() != null) {
            strand.allocatedServiceId = req.allocatedServiceId();
        }
        if (req.allocatedServiceHop() != null) {
            strand.allocatedServiceHop = req.allocatedServiceHop();
        }
        if (req.measuredLossDb() != null) {
            strand.measuredLossDb = req.measuredLossDb();
        }
        if (req.remarks() != null) {
            strand.remarks = req.remarks().trim();
        }

        return mapToStrandDto(strand);
    }

    @Transactional
    public OpticalCableResponse updateCable(UUID id, UpdateCableRequest req) {
        OpticalCableEntity cable = cableRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Optical cable not found with ID: " + id));

        String username = getUsername();

        if (req.cableName() != null && !req.cableName().isBlank()) {
            cable.cableName = req.cableName().trim();
        }
        if (req.cableType() != null) {
            cable.cableType = req.cableType();
        }
        if (req.fiberGrade() != null) {
            cable.fiberGrade = req.fiberGrade();
        }
        if (req.status() != null && !req.status().isBlank()) {
            cable.status = req.status().trim().toUpperCase();
        }
        if (req.installationType() != null && !req.installationType().isBlank()) {
            cable.installationType = req.installationType().trim();
        }
        if (req.sheathType() != null && !req.sheathType().isBlank()) {
            cable.sheathType = req.sheathType().trim();
        }
        if (req.attenuationDbPerKm() != null) {
            cable.attenuationDbPerKm = req.attenuationDbPerKm();
        }
        if (req.lengthMeters() != null) {
            cable.lengthMeters = req.lengthMeters();
        }
        if (req.originLocationId() != null) {
            cable.originLocationId = req.originLocationId();
        }
        if (req.originDeviceId() != null) {
            cable.originDeviceId = req.originDeviceId();
        }
        if (req.terminationLocationId() != null) {
            cable.terminationLocationId = req.terminationLocationId();
        }
        if (req.terminationDeviceId() != null) {
            cable.terminationDeviceId = req.terminationDeviceId();
        }

        cable.updatedBy = username;
        cable.updatedAt = OffsetDateTime.now();

        // Update PostGIS route_geom if provided
        if (req.routeGeomGeoJson() != null && !req.routeGeomGeoJson().isBlank()) {
            updateCableGeometryGeoJson(id, req.routeGeomGeoJson().trim(), req.lengthMeters());
            cableRepository.getEntityManager().refresh(cable);
        } else if (req.routeGeomWkt() != null && !req.routeGeomWkt().isBlank()) {
            updateCableGeometryWkt(id, req.routeGeomWkt().trim(), req.lengthMeters());
            cableRepository.getEntityManager().refresh(cable);
        }

        LOG.infof("Optical cable %s (%s) updated by %s", cable.cableCode, cable.id, username);
        return mapToCableDto(cable);
    }

    private void updateCableGeometryGeoJson(UUID cableId, String geoJson, BigDecimal lengthMetersOverride) {
        String sql = """
            UPDATE inventory.inv_optical_cables
            SET route_geom = ST_SetSRID(ST_GeomFromGeoJSON(?), 4326),
                length_meters = COALESCE(?, ROUND(ST_Length(ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)::geography)::numeric, 2))
            WHERE id = ?
        """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, geoJson);
            ps.setObject(2, lengthMetersOverride);
            ps.setString(3, geoJson);
            ps.setObject(4, cableId);
            ps.executeUpdate();
        } catch (Exception e) {
            LOG.error("Failed to update cable route_geom via GeoJSON: " + e.getMessage(), e);
            throw new IllegalArgumentException("Invalid GeoJSON geometry: " + e.getMessage());
        }
    }

    private void updateCableGeometryWkt(UUID cableId, String wkt, BigDecimal lengthMetersOverride) {
        String sql = """
            UPDATE inventory.inv_optical_cables
            SET route_geom = ST_GeomFromText(?, 4326),
                length_meters = COALESCE(?, ROUND(ST_Length(ST_GeomFromText(?, 4326)::geography)::numeric, 2))
            WHERE id = ?
        """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, wkt);
            ps.setObject(2, lengthMetersOverride);
            ps.setString(3, wkt);
            ps.setObject(4, cableId);
            ps.executeUpdate();
        } catch (Exception e) {
            LOG.error("Failed to update cable route_geom via WKT: " + e.getMessage(), e);
            throw new IllegalArgumentException("Invalid WKT geometry: " + e.getMessage());
        }
    }

    private String getCableRouteGeomJson(UUID cableId) {
        String sql = "SELECT ST_AsGeoJSON(route_geom) FROM inventory.inv_optical_cables WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setObject(1, cableId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString(1);
                }
            }
        } catch (Exception e) {
            LOG.warn("Could not query route_geom for cable " + cableId + ": " + e.getMessage());
        }
        return null;
    }

    @Transactional
    public void deleteCable(UUID id) {
        OpticalCableEntity cable = cableRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Optical cable not found with ID: " + id));

        long litStrands = strandRepository.findByCableId(id).stream()
                .filter(s -> s.status == StrandStatus.LIT_IN_USE || s.allocatedServiceId != null)
                .count();
        if (litStrands > 0) {
            throw new IllegalStateException("Cannot delete cable '" + cable.cableCode + "': " + litStrands + " core strand(s) are currently LIT_IN_USE in active circuits. Please release all active circuits first.");
        }

        cableRepository.delete(cable);
    }

    private OpticalCableResponse mapToCableDto(OpticalCableEntity c) {
        List<CableStrandEntity> strandEntities = c.strands != null && !c.strands.isEmpty()
                ? c.strands
                : strandRepository.findByCableId(c.id);

        int total = c.totalCores != null ? c.totalCores : strandEntities.size();
        int lit = (int) strandEntities.stream().filter(s -> s.status == StrandStatus.LIT_IN_USE).count();
        int dark = total - lit;
        double utilPct = total > 0 ? ((double) lit / total) * 100.0 : 0.0;

        List<CableStrandResponse> strandDtos = strandEntities.stream()
                .map(this::mapToStrandDto)
                .toList();

        String routeGeomJson = getCableRouteGeomJson(c.id);

        UUID origLocId = c.originLocationId;
        String origLocName = c.originLocation != null ? c.originLocation.name : null;
        if (origLocId == null && c.originDevice != null) {
            origLocId = c.originDevice.locationId;
            origLocName = c.originDevice.location != null ? c.originDevice.location.name : null;
        }

        UUID termLocId = c.terminationLocationId;
        String termLocName = c.terminationLocation != null ? c.terminationLocation.name : null;
        if (termLocId == null && c.terminationDevice != null) {
            termLocId = c.terminationDevice.locationId;
            termLocName = c.terminationDevice.location != null ? c.terminationDevice.location.name : null;
        }

        return new OpticalCableResponse(
                c.id,
                c.cableCode,
                c.cableName,
                c.cableType,
                c.fiberGrade,
                total,
                lit,
                dark,
                Math.round(utilPct * 10.0) / 10.0,
                c.lengthMeters,
                origLocId,
                origLocName,
                c.originDeviceId,
                c.originDevice != null ? c.originDevice.hostname : null,
                termLocId,
                termLocName,
                c.terminationDeviceId,
                c.terminationDevice != null ? c.terminationDevice.hostname : null,
                c.installationType,
                c.sheathType,
                c.attenuationDbPerKm,
                c.status,
                strandDtos,
                c.createdAt,
                c.updatedAt,
                routeGeomJson
        );
    }

    private CableStrandResponse mapToStrandDto(CableStrandEntity s) {
        return new CableStrandResponse(
                s.id,
                s.cable != null ? s.cable.id : null,
                s.coreNumber,
                s.tubeNumber != null ? s.tubeNumber : 1,
                s.colorName,
                s.colorHex,
                s.status,
                s.allocatedServiceId,
                s.allocatedService != null ? s.allocatedService.serviceCode : null,
                s.allocatedService != null ? s.allocatedService.customerName : null,
                s.allocatedServiceHop,
                s.measuredLossDb,
                s.remarks
        );
    }
}
