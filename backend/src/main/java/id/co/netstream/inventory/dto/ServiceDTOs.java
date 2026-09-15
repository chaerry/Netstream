package id.co.netstream.inventory.dto;

import id.co.netstream.inventory.domain.enums.ServiceStatus;
import id.co.netstream.inventory.domain.enums.ServiceType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class ServiceDTOs {

    public record CreateServiceRequest(
            @NotBlank(message = "Service code is mandatory")
            String serviceCode,

            @NotBlank(message = "Customer name is mandatory")
            String customerName,

            @NotNull(message = "Service type is mandatory")
            ServiceType serviceType,

            @NotNull(message = "Bandwidth is mandatory")
            @Positive
            Integer bandwidthMbps,

            String slaTier,
            BigDecimal slaAvailabilityPct,
            BigDecimal monthlyRecurringCost,

            UUID aEndLocationId,
            UUID zEndLocationId,

            List<CreateResourceMappingRequest> mappings
    ) {}

    public record CreateResourceMappingRequest(
            UUID deviceId,
            UUID portId,
            UUID vneId,

            @NotBlank
            String resourceRole,

            @NotNull
            Integer hopOrder,

            @NotNull
            Integer allocatedBandwidthMbps
    ) {}

    public record ServiceDetailResponse(
            UUID id,
            String serviceCode,
            String customerName,
            ServiceType serviceType,
            Integer bandwidthMbps,
            String slaTier,
            BigDecimal slaAvailabilityPct,
            BigDecimal monthlyRecurringCost,
            ServiceStatus status,
            UUID aEndLocationId,
            String aEndLocationName,
            UUID zEndLocationId,
            String zEndLocationName,
            OffsetDateTime activationDate,
            OffsetDateTime terminationDate,
            List<ResourceMappingResponse> resourceMappings,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt,
            String createdBy,
            String updatedBy
    ) {}

    public record ResourceMappingResponse(
            UUID id,
            UUID deviceId,
            String deviceHostname,
            UUID portId,
            String portName,
            UUID vneId,
            String vneName,
            String resourceRole,
            Integer hopOrder,
            Integer allocatedBandwidthMbps
    ) {}
}
