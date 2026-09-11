package id.co.netstream.inventory.dto;

import id.co.netstream.inventory.domain.enums.OperationalStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.UUID;

public class VirtualInventoryDTOs {

    public record CreateVneRequest(
            UUID hypervisorDeviceId,

            @NotBlank(message = "VNE name cannot be blank")
            String vneName,

            @NotBlank(message = "VNF type cannot be blank (e.g. vRouter, vFirewall)")
            String vnfType,

            @Min(1)
            @Max(4094)
            Integer vlanId,

            String vrfName,

            @NotNull
            @Min(1)
            Integer allocatedVcpu,

            @NotNull
            @Min(1)
            Integer allocatedRamGb,

            @NotNull
            @Min(1)
            Integer allocatedDiskGb
    ) {}

    public record VneResponse(
            UUID id,
            UUID hypervisorDeviceId,
            String hypervisorHostname,
            String vneName,
            String vnfType,
            Integer vlanId,
            String vrfName,
            Integer allocatedVcpu,
            Integer allocatedRamGb,
            Integer allocatedDiskGb,
            OperationalStatus status,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt
    ) {}
}
