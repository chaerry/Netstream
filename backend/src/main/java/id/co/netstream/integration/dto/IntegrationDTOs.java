package id.co.netstream.integration.dto;

import id.co.netstream.integration.domain.enums.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public class IntegrationDTOs {

    // --- Connectors ---
    public record ConnectorResponse(
            Long id,
            String name,
            String vendor,
            String connectorType,
            ConnectorProtocol protocol,
            String endpointUrl,
            String authType,
            String authCredentialMasked,
            ConnectorStatus status,
            Integer pingLatencyMs,
            Integer syncIntervalMins,
            Boolean autoReconcileEnabled,
            Boolean autoApproveMinorDiffs,
            OffsetDateTime lastSyncAt,
            String lastSyncStatus,
            Integer managedElementsCount,
            OffsetDateTime createdAt
    ) {}

    public record CreateConnectorRequest(
            String name,
            String vendor,
            String connectorType,
            ConnectorProtocol protocol,
            String endpointUrl,
            String authType,
            String authCredential,
            Integer syncIntervalMins,
            Boolean autoReconcileEnabled,
            Boolean autoApproveMinorDiffs
    ) {}

    // --- Discovery Jobs ---
    public record DiscoveryJobResponse(
            Long id,
            Long connectorId,
            String connectorName,
            String jobType,
            String status,
            OffsetDateTime startedAt,
            OffsetDateTime completedAt,
            Integer elementsScanned,
            Integer discrepanciesFound,
            String errorMessage,
            String initiatedBy
    ) {}

    public record TriggerDiscoveryRequest(
            String jobType,
            String initiatedBy
    ) {}

    // --- Reconciliation Items ---
    public record ReconciliationItemResponse(
            Long id,
            Long discoveryJobId,
            Long connectorId,
            String connectorName,
            String entityType,
            String entityIdentifier,
            Long targetInventoryId,
            DiscrepancyType discrepancyType,
            String attributeName,
            String inventoryValue,
            String liveDiscoveredValue,
            String severity,
            ReconciliationStatus status,
            String resolutionAction,
            String resolvedBy,
            OffsetDateTime resolvedAt,
            String resolutionNotes,
            String gaharuProcessInstanceId,
            OffsetDateTime createdAt
    ) {}

    public record ResolveDiscrepancyRequest(
            String resolutionAction, // APPLY_TO_INVENTORY, IGNORE_MARK_ROGUE, DISPATCH_WORK_ORDER
            String resolutionNotes,
            String resolvedBy
    ) {}

    // --- Change Logs (CDC) ---
    public record ChangeLogResponse(
            Long id,
            OffsetDateTime timestamp,
            String username,
            String userRole,
            String clientIp,
            String entityDomain,
            String entityType,
            String entityId,
            ChangeAction action,
            String summary,
            String beforeSnapshotJson,
            String afterSnapshotJson,
            String diffSummaryJson
    ) {}

    public record CreateChangeLogRequest(
            String username,
            String userRole,
            String clientIp,
            String entityDomain,
            String entityType,
            String entityId,
            ChangeAction action,
            String summary,
            String beforeSnapshotJson,
            String afterSnapshotJson,
            String diffSummaryJson
    ) {}

    // --- Alarms ---
    public record AlarmResponse(
            Long id,
            String alarmIdentifier,
            String sourceSystem,
            String sourceIp,
            String alarmName,
            String alarmType,
            AlarmSeverity severity,
            AlarmLifecycleStatus lifecycleStatus,
            OffsetDateTime raisedAt,
            OffsetDateTime clearedAt,
            String acknowledgedBy,
            OffsetDateTime acknowledgedAt,
            String rawPayloadJson,
            Long deviceId,
            String deviceName,
            Long portId,
            String portName,
            String locationName,
            String rackCode,
            String opticalCableCode,
            Integer opticalStrandNo,
            String leasedLineCircuitCode,
            String carrierName,
            String slaTier,
            Integer impactedServicesCount,
            Integer impactedCustomersCount,
            BigDecimal estimatedRevenueRiskUsd,
            String gaharuTicketId,
            String rootCauseTag
    ) {}

    public record IngestAlarmRequest(
            String alarmIdentifier,
            String sourceSystem,
            String sourceIp,
            String alarmName,
            String alarmType,
            AlarmSeverity severity,
            String rawPayloadJson,
            String deviceIdentifier, // Name or IP to correlate
            String portIdentifier,
            String rootCauseTag
    ) {}

    public record AlarmActionRequest(
            String action, // ACKNOWLEDGE, CLEAR, ESCALATE_GAHARU
            String username,
            String notes
    ) {}

    // --- Webhook Subscriptions ---
    public record WebhookSubscriptionResponse(
            Long id,
            String name,
            String subscriberSystem,
            String targetUrl,
            String eventTopics,
            String secretTokenMasked,
            Boolean isActive,
            Integer retryCount,
            Integer timeoutMs,
            OffsetDateTime createdAt
    ) {}

    public record CreateWebhookSubscriptionRequest(
            String name,
            String subscriberSystem,
            String targetUrl,
            String eventTopics,
            String secretToken,
            Integer retryCount,
            Integer timeoutMs
    ) {}

    public record WebhookLogResponse(
            Long id,
            Long subscriptionId,
            String subscriptionName,
            String eventTopic,
            String payloadJson,
            OffsetDateTime dispatchedAt,
            Integer responseCode,
            String responseBody,
            Integer latencyMs,
            String status
    ) {}

    // --- TM Forum Northbound Schemas ---
    public record TmfServiceResponse(
            String id,
            String href,
            String name,
            String state,
            String serviceType,
            String customerName,
            Map<String, Object> serviceSpecification,
            List<Map<String, Object>> supportingResource
    ) {}

    public record TmfResourceResponse(
            String id,
            String href,
            String name,
            String category,
            String operationalState,
            String administrativeState,
            Map<String, Object> place,
            List<Map<String, Object>> resourceCharacteristic
    ) {}

    public record TmfAlarmResponse(
            String id,
            String href,
            String alarmType,
            String perceivedSeverity,
            String probableCause,
            String state,
            OffsetDateTime alarmRaisedTime,
            Map<String, Object> affectedService
    ) {}

    // --- Dashboard Stats ---
    public record IntegrationStatsResponse(
            Long totalConnectors,
            Long onlineConnectors,
            Long pendingReconciliations,
            Long activeCriticalAlarms,
            Long activeMajorAlarms,
            Long totalChangeLogsToday,
            Long activeWebhooks,
            BigDecimal totalRevenueAtRiskUsd
    ) {}
}
