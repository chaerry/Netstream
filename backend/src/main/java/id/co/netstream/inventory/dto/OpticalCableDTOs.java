package id.co.netstream.inventory.dto;

import id.co.netstream.inventory.domain.enums.CableType;
import id.co.netstream.inventory.domain.enums.FiberGrade;
import id.co.netstream.inventory.domain.enums.StrandStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class OpticalCableDTOs {

    public record OpticalCableResponse(
            UUID id,
            String cableCode,
            String cableName,
            CableType cableType,
            FiberGrade fiberGrade,
            Integer totalCores,
            Integer litCores,
            Integer darkCores,
            Double utilizationPct,
            BigDecimal lengthMeters,
            UUID originLocationId,
            String originLocationName,
            UUID originDeviceId,
            String originDeviceHostname,
            UUID terminationLocationId,
            String terminationLocationName,
            UUID terminationDeviceId,
            String terminationDeviceHostname,
            String installationType,
            String sheathType,
            BigDecimal attenuationDbPerKm,
            String status,
            List<CableStrandResponse> strands,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt,
            String routeGeomGeoJson
    ) {}

    public record UpdateCableRequest(
            String cableName,
            CableType cableType,
            FiberGrade fiberGrade,
            String status,
            BigDecimal lengthMeters,
            UUID originLocationId,
            UUID originDeviceId,
            UUID terminationLocationId,
            UUID terminationDeviceId,
            String installationType,
            String sheathType,
            BigDecimal attenuationDbPerKm,
            String routeGeomGeoJson,
            String routeGeomWkt
    ) {}

    public record CableStrandResponse(
            UUID id,
            UUID cableId,
            Integer coreNumber,
            Integer tubeNumber,
            String colorName,
            String colorHex,
            StrandStatus status,
            UUID allocatedServiceId,
            String allocatedServiceCode,
            String allocatedCustomerName,
            Integer allocatedServiceHop,
            BigDecimal measuredLossDb,
            String remarks
    ) {}

    public record CreateCableRequest(
            @NotBlank(message = "Cable code is required")
            String cableCode,

            @NotBlank(message = "Cable name is required")
            String cableName,

            @NotNull(message = "Cable type is required")
            CableType cableType,

            @NotNull(message = "Fiber grade is required")
            FiberGrade fiberGrade,

            @NotNull(message = "Total cores is required")
            @Positive
            Integer totalCores,

            BigDecimal lengthMeters,
            UUID originLocationId,
            UUID originDeviceId,
            UUID terminationLocationId,
            UUID terminationDeviceId,
            String installationType,
            String sheathType,
            BigDecimal attenuationDbPerKm
    ) {}

    public record UpdateStrandRequest(
            StrandStatus status,
            UUID allocatedServiceId,
            Integer allocatedServiceHop,
            BigDecimal measuredLossDb,
            String remarks
    ) {}
}
