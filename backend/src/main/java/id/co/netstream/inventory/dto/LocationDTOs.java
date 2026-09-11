package id.co.netstream.inventory.dto;

import id.co.netstream.inventory.domain.enums.LocationStatus;
import id.co.netstream.inventory.domain.enums.LocationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class LocationDTOs {

    public record CreateLocationRequest(
            UUID parentId,

            @NotBlank(message = "Location code cannot be blank")
            @Size(min = 2, max = 64)
            String code,

            @NotBlank(message = "Location name cannot be blank")
            @Size(min = 2, max = 255)
            String name,

            @NotNull(message = "Location type is mandatory")
            LocationType type,

            LocationStatus status,
            BigDecimal latitude,
            BigDecimal longitude,
            String address,
            String contactPerson,
            String contactPhone
    ) {}

    public record UpdateLocationRequest(
            UUID parentId,

            @NotBlank(message = "Location code cannot be blank")
            @Size(min = 2, max = 64)
            String code,

            @NotBlank(message = "Location name cannot be blank")
            @Size(min = 2, max = 255)
            String name,

            @NotNull(message = "Location type is mandatory")
            LocationType type,

            LocationStatus status,
            BigDecimal latitude,
            BigDecimal longitude,
            String address,
            String contactPerson,
            String contactPhone
    ) {}

    public record LocationResponse(
            UUID id,
            UUID parentId,
            String code,
            String name,
            LocationType type,
            LocationStatus status,
            BigDecimal latitude,
            BigDecimal longitude,
            String address,
            String contactPerson,
            String contactPhone,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt,
            List<LocationResponse> children
    ) {}

    public record CreateRackRequest(
            @NotNull(message = "Location ID cannot be null")
            UUID locationId,

            @NotBlank(message = "Rack number is mandatory")
            String rackNumber,

            Integer heightUnits,
            BigDecimal maxPowerWatt,
            BigDecimal maxWeightKg
    ) {}

    public record RackResponse(
            UUID id,
            UUID locationId,
            String rackNumber,
            Integer heightUnits,
            BigDecimal maxPowerWatt,
            BigDecimal currentPowerWatt,
            BigDecimal maxWeightKg,
            String status,
            Integer occupiedUnits,
            Integer availableUnits
    ) {}
}
