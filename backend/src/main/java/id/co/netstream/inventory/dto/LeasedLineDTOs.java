package id.co.netstream.inventory.dto;

import id.co.netstream.inventory.domain.enums.CircuitDirection;
import id.co.netstream.inventory.domain.enums.CircuitLifecycleStatus;
import id.co.netstream.inventory.domain.enums.CircuitTechnology;
import id.co.netstream.inventory.domain.enums.InvoiceStatus;
import id.co.netstream.inventory.domain.enums.SlaTier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class LeasedLineDTOs {

    public record CircuitResponse(
            String id,
            String circuitId,
            String carrierCircuitId,
            String circuitName,
            CircuitDirection direction,
            CircuitTechnology technology,
            CircuitLifecycleStatus status,
            String carrierId,
            String carrierName,
            String carrierCode,
            String contractId,
            String contractNumber,
            Integer bandwidthMbps,
            String bandwidthDisplay,
            SlaTier slaTier,
            BigDecimal uptimeTargetPercent,
            BigDecimal mttrTargetHours,
            BigDecimal committedLatencyMs,
            BigDecimal actualLatencyMs,
            BigDecimal jitterMs,
            BigDecimal packetLossPercent,
            UUID aEndLocationId,
            String aEndLocationName,
            UUID aEndDeviceId,
            String aEndDeviceHostname,
            UUID aEndPortId,
            String aEndPortName,
            UUID zEndLocationId,
            String zEndLocationName,
            UUID zEndDeviceId,
            String zEndDeviceHostname,
            UUID zEndPortId,
            String zEndPortName,
            UUID opticalCableId,
            String opticalCableName,
            Integer strandNumber,
            UUID vneId,
            String vneName,
            Integer vlanId,
            String customerId,
            String customerName,
            UUID serviceId,
            String serviceName,
            String currency,
            BigDecimal mrc,
            BigDecimal nrc,
            BigDecimal utilizationPercent,
            Boolean isDormant,
            LocalDate dormantSince,
            BigDecimal potentialMonthlySavings,
            LocalDate activationDate,
            LocalDate decommissionDate,
            String notes,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt
    ) {}

    public record CreateCircuitRequest(
            @NotBlank String circuitId,
            String carrierCircuitId,
            @NotBlank String circuitName,
            @NotNull CircuitDirection direction,
            @NotNull CircuitTechnology technology,
            CircuitLifecycleStatus status,
            String carrierId,
            String contractId,
            @NotNull Integer bandwidthMbps,
            String bandwidthDisplay,
            SlaTier slaTier,
            BigDecimal uptimeTargetPercent,
            BigDecimal mttrTargetHours,
            BigDecimal committedLatencyMs,
            UUID aEndLocationId,
            UUID aEndDeviceId,
            UUID aEndPortId,
            UUID zEndLocationId,
            UUID zEndDeviceId,
            UUID zEndPortId,
            UUID opticalCableId,
            Integer strandNumber,
            UUID vneId,
            Integer vlanId,
            String customerId,
            String customerName,
            UUID serviceId,
            String currency,
            @NotNull BigDecimal mrc,
            BigDecimal nrc,
            String notes
    ) {}

    public record UpdateCircuitRequest(
            String carrierCircuitId,
            String circuitName,
            CircuitLifecycleStatus status,
            String carrierId,
            String contractId,
            Integer bandwidthMbps,
            String bandwidthDisplay,
            SlaTier slaTier,
            BigDecimal actualLatencyMs,
            BigDecimal utilizationPercent,
            UUID aEndPortId,
            UUID zEndPortId,
            UUID opticalCableId,
            Integer strandNumber,
            UUID vneId,
            Integer vlanId,
            String customerId,
            String customerName,
            BigDecimal mrc,
            BigDecimal nrc,
            String notes
    ) {}

    public record CarrierResponse(
            String id,
            String name,
            String code,
            String carrierType,
            String contactPerson,
            String contactEmail,
            String contactPhone,
            String portalUrl,
            String supportTier,
            String escalationMatrix,
            Integer activeCircuitCount,
            BigDecimal totalMonthlyOpexUsd,
            OffsetDateTime createdAt
    ) {}

    public record ContractResponse(
            String id,
            String carrierId,
            String carrierName,
            String contractNumber,
            String title,
            String contractType,
            LocalDate startDate,
            LocalDate endDate,
            Integer termMonths,
            Boolean autoRenewal,
            Integer noticePeriodDays,
            String currency,
            BigDecimal mrcTotal,
            BigDecimal nrcTotal,
            String status,
            String documentUrl,
            Integer circuitCount,
            Long daysUntilExpiration
    ) {}

    public record InvoiceAuditResponse(
            String id,
            String invoiceNumber,
            String carrierId,
            String carrierName,
            LocalDate billingPeriodStart,
            LocalDate billingPeriodEnd,
            String currency,
            BigDecimal billedAmount,
            BigDecimal contractedAmount,
            BigDecimal slaPenaltyCredit,
            BigDecimal netPayableAmount,
            BigDecimal discrepancyAmount,
            InvoiceStatus status,
            String disputeReason,
            LocalDate invoiceDate,
            LocalDate dueDate,
            List<InvoiceItemResponse> items
    ) {}

    public record InvoiceItemResponse(
            String id,
            String circuitId,
            String circuitReference,
            BigDecimal billedMrc,
            BigDecimal contractedMrc,
            BigDecimal discrepancy,
            String status,
            String notes
    ) {}

    public record CapacityAuditReportResponse(
            Integer totalCircuitsAudited,
            Integer dormantCircuitCount,
            BigDecimal totalMonthlySavingsUsd,
            BigDecimal totalAnnualSavingsUsd,
            List<DormantCircuitItem> dormantCircuits
    ) {}

    public record DormantCircuitItem(
            String id,
            String circuitId,
            String carrierCircuitId,
            String circuitName,
            String carrierName,
            String technology,
            String bandwidthDisplay,
            BigDecimal mrcUsd,
            BigDecimal utilizationPercent,
            LocalDate dormantSince,
            String reason,
            String recommendedAction,
            String gaharuProcessStatus
    ) {}

    public record SlaIncidentResponse(
            String id,
            String circuitId,
            String circuitName,
            String ticketNumber,
            String carrierTicketNumber,
            OffsetDateTime incidentStart,
            OffsetDateTime incidentEnd,
            Integer durationMinutes,
            Integer targetMttrMinutes,
            Boolean isMttrBreached,
            String outageType,
            String rootCause,
            String currency,
            BigDecimal penaltyRebateAmount,
            String claimStatus,
            OffsetDateTime createdAt
    ) {}

    public record LogSlaIncidentRequest(
            @NotBlank String circuitId,
            @NotBlank String ticketNumber,
            String carrierTicketNumber,
            @NotNull OffsetDateTime incidentStart,
            OffsetDateTime incidentEnd,
            Integer durationMinutes,
            Integer targetMttrMinutes,
            String outageType,
            String rootCause,
            String currency,
            BigDecimal penaltyRebateAmount
    ) {}

    public record InitiateDecomRequest(
            @NotBlank String circuitId,
            @NotBlank String initiatedBy,
            @NotBlank String reason,
            @NotNull LocalDate targetDecomDate
    ) {}

    public record DecomRequestResponse(
            String id,
            String circuitId,
            String circuitName,
            String gaharuProcessInstanceId,
            String initiatedBy,
            String reason,
            LocalDate targetDecomDate,
            BigDecimal estimatedAnnualSavingsUsd,
            String workflowState,
            String gaharuResponsePayload,
            OffsetDateTime createdAt
    ) {}

    public record TopologyPathResponse(
            String circuitId,
            String circuitName,
            String technology,
            String bandwidthDisplay,
            List<CircuitHopItem> hops
    ) {}

    public record CircuitHopItem(
            Integer sequence,
            String hopType, // LOCATION, DEVICE_PORT, FIBER_STRAND, VNE_OVERLAY
            String name,
            String details,
            String status
    ) {}
}
