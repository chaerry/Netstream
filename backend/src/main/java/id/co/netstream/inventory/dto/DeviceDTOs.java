package id.co.netstream.inventory.dto;

import id.co.netstream.inventory.domain.enums.OperationalStatus;
import id.co.netstream.inventory.domain.enums.PortMedium;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class DeviceDTOs {

    public record CreateDeviceRequest(
            @NotNull(message = "Location ID cannot be null")
            UUID locationId,

            UUID rackId,

            @NotBlank(message = "Hostname is mandatory")
            @Size(min = 3, max = 128)
            String hostname,

            @NotBlank(message = "Serial number is mandatory")
            @Size(min = 3, max = 128)
            String serialNumber,

            String assetTag,

            @NotBlank(message = "Device type is mandatory")
            String deviceType,

            @NotBlank(message = "Vendor is mandatory")
            String vendor,

            @NotBlank(message = "Model is mandatory")
            String model,

            String hardwareVersion,
            String firmwareVersion,

            @Min(1)
            Integer rackUnitStart,

            @Min(1)
            Integer rackUnitHeight,

            String managementIp,

            @PositiveOrZero
            Integer totalPorts,

            @PositiveOrZero
            BigDecimal costUsd
    ) {}

    public record UpdateDeviceStatusRequest(
            @NotNull(message = "Operational status must not be null")
            OperationalStatus status,

            String reason
    ) {}

    public record UpdateDeviceRequest(
            UUID rackId,
            @Min(1)
            Integer rackUnitStart,
            @Min(1)
            Integer rackUnitHeight,
            String managementIp,
            OperationalStatus status,
            String assetTag,
            String firmwareVersion,
            String hardwareVersion,
            @PositiveOrZero
            Integer totalPorts,
            @PositiveOrZero
            BigDecimal costUsd
    ) {}

    public record DeviceDetailResponse(
            UUID id,
            UUID locationId,
            String locationName,
            UUID rackId,
            String rackNumber,
            String hostname,
            String serialNumber,
            String assetTag,
            String deviceType,
            String vendor,
            String model,
            String hardwareVersion,
            String firmwareVersion,
            Integer rackUnitStart,
            Integer rackUnitHeight,
            OperationalStatus status,
            String managementIp,
            Integer totalPorts,
            BigDecimal costUsd,
            List<PortResponse> ports,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt,
            String createdBy,
            String updatedBy
    ) {}

    public record CreatePortRequest(
            @NotBlank(message = "Port name is mandatory")
            String portName,

            @NotNull
            Integer portSpeedMbps,

            @NotNull
            PortMedium mediumType,

            String connectorType,
            String macAddress
    ) {}

    public record AllocatePortRequest(
            @NotNull(message = "Service/Circuit ID cannot be null")
            UUID serviceId,

            String resourceRole,

            Integer allocatedBandwidthMbps,

            Integer hopOrder,

            UUID connectedPortId
    ) {}

    public record PortResponse(
            UUID id,
            UUID deviceId,
            String portName,
            Integer portSpeedMbps,
            PortMedium mediumType,
            String connectorType,
            String macAddress,
            Boolean isOperational,
            Boolean isAllocated,
            UUID connectedPortId,
            UUID allocatedServiceId,
            String allocatedServiceCode,
            String allocatedCustomerName,
            String allocatedResourceRole,
            Integer allocatedBandwidthMbps
    ) {}

    public record DeviceTypeResponse(
            String code,
            String label,
            String category,
            String description,
            Boolean isActive,
            Integer displayOrder
    ) {}
}
