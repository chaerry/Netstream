package id.co.netstream.integration.service;

import id.co.netstream.integration.domain.entity.*;
import id.co.netstream.integration.domain.enums.*;
import id.co.netstream.integration.dto.IntegrationDTOs.*;
import id.co.netstream.integration.facade.InventoryFacade;
import id.co.netstream.integration.repository.*;
import id.co.netstream.inventory.exception.ResourceNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class IntegrationService {

    @Inject
    IntegrationConnectorRepository connectorRepo;

    @Inject
    IntegrationDiscoveryJobRepository discoveryJobRepo;

    @Inject
    IntegrationReconciliationItemRepository reconciliationRepo;

    @Inject
    IntegrationChangeLogRepository changeLogRepo;

    @Inject
    IntegrationAlarmRepository alarmRepo;

    @Inject
    IntegrationWebhookSubscriptionRepository webhookSubRepo;

    @Inject
    IntegrationWebhookLogRepository webhookLogRepo;

    @Inject
    InventoryFacade inventoryFacade;

    // =========================================================================
    // 1. CONNECTORS
    // =========================================================================
    public List<ConnectorResponse> listConnectors() {
        return connectorRepo.listAll().stream().map(this::mapToConnectorResponse).collect(Collectors.toList());
    }

    public ConnectorResponse getConnector(Long id) {
        IntegrationConnectorEntity entity = connectorRepo.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Connector not found: " + id));
        return mapToConnectorResponse(entity);
    }

    @Transactional
    public ConnectorResponse createConnector(CreateConnectorRequest req) {
        IntegrationConnectorEntity entity = new IntegrationConnectorEntity();
        entity.name = req.name();
        entity.vendor = req.vendor();
        entity.connectorType = req.connectorType();
        entity.protocol = req.protocol();
        entity.endpointUrl = req.endpointUrl();
        entity.authType = req.authType();
        entity.authCredentialMasked = req.authCredential() != null ? "******" : null;
        entity.syncIntervalMins = req.syncIntervalMins() != null ? req.syncIntervalMins() : 60;
        entity.autoReconcileEnabled = req.autoReconcileEnabled() != null ? req.autoReconcileEnabled() : true;
        entity.autoApproveMinorDiffs = req.autoApproveMinorDiffs() != null ? req.autoApproveMinorDiffs() : true;
        entity.status = ConnectorStatus.ONLINE;
        entity.pingLatencyMs = 12;
        entity.managedElementsCount = 0;
        connectorRepo.persist(entity);

        recordChangeLog(new CreateChangeLogRequest(
                "admin", "TELECOM_ADMIN", "127.0.0.1", "INTEGRATION",
                "IntegrationConnectorEntity", entity.id.toString(), ChangeAction.CREATE,
                "Registered new Southbound EMS/NMS connector: " + entity.name,
                null, "{\"name\": \"" + entity.name + "\", \"protocol\": \"" + entity.protocol + "\"}", null
        ));

        return mapToConnectorResponse(entity);
    }

    @Transactional
    public ConnectorResponse testConnection(Long id) {
        IntegrationConnectorEntity entity = connectorRepo.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Connector not found: " + id));
        entity.status = ConnectorStatus.ONLINE;
        entity.pingLatencyMs = (int) (Math.random() * 25) + 5;
        entity.lastSyncAt = OffsetDateTime.now();
        entity.lastSyncStatus = "SUCCESS";
        entity.persist();
        return mapToConnectorResponse(entity);
    }

    // =========================================================================
    // 2. DISCOVERY JOBS
    // =========================================================================
    public List<DiscoveryJobResponse> listDiscoveryJobs(Long connectorId) {
        List<IntegrationDiscoveryJobEntity> jobs = (connectorId != null)
                ? discoveryJobRepo.findByConnectorId(connectorId)
                : discoveryJobRepo.listRecentJobs(30);
        return jobs.stream().map(this::mapToDiscoveryJobResponse).collect(Collectors.toList());
    }

    @Transactional
    public DiscoveryJobResponse triggerDiscovery(Long connectorId, TriggerDiscoveryRequest req) {
        IntegrationConnectorEntity connector = connectorRepo.findByIdOptional(connectorId)
                .orElseThrow(() -> new ResourceNotFoundException("Connector not found: " + connectorId));

        IntegrationDiscoveryJobEntity job = new IntegrationDiscoveryJobEntity();
        job.connector = connector;
        job.jobType = req.jobType() != null ? req.jobType() : "FULL_INVENTORY_SWEEP";
        job.status = "COMPLETED";
        job.startedAt = OffsetDateTime.now().minusSeconds(15);
        job.completedAt = OffsetDateTime.now();
        job.elementsScanned = (int) (Math.random() * 150) + 80;
        job.discrepanciesFound = (int) (Math.random() * 3) + 1;
        job.initiatedBy = req.initiatedBy() != null ? req.initiatedBy() : "ENGINEER_MANUAL";
        discoveryJobRepo.persist(job);

        connector.lastSyncAt = OffsetDateTime.now();
        connector.lastSyncStatus = "SUCCESS";
        connector.managedElementsCount = job.elementsScanned;
        connector.persist();

        // Generate a synthetic live discrepancy for inspection
        IntegrationReconciliationItemEntity item = new IntegrationReconciliationItemEntity();
        item.discoveryJob = job;
        item.connector = connector;
        item.entityType = "PORT";
        item.entityIdentifier = "JKT-CORE-PE-01/GigabitEthernet0/0/" + ((int) (Math.random() * 20) + 1);
        item.discrepancyType = DiscrepancyType.ATTRIBUTE_MISMATCH;
        item.attributeName = "portSpeedMbps";
        item.inventoryValue = "1000 Mbps (1G)";
        item.liveDiscoveredValue = "10000 Mbps (10G Optic Inserted)";
        item.severity = "MINOR";
        item.status = ReconciliationStatus.PENDING_REVIEW;
        item.resolutionNotes = "Discovered 10G optical transceiver inserted in live port. Ready for reconciliation.";
        reconciliationRepo.persist(item);

        return mapToDiscoveryJobResponse(job);
    }

    // =========================================================================
    // 3. RECONCILIATION ITEMS
    // =========================================================================
    public List<ReconciliationItemResponse> listReconciliationItems(ReconciliationStatus status, DiscrepancyType type) {
        List<IntegrationReconciliationItemEntity> items;
        if (status != null) {
            items = reconciliationRepo.findByStatus(status);
        } else if (type != null) {
            items = reconciliationRepo.findByDiscrepancyType(type);
        } else {
            items = reconciliationRepo.listAll();
        }
        return items.stream().map(this::mapToReconciliationResponse).collect(Collectors.toList());
    }

    @Transactional
    public ReconciliationItemResponse resolveDiscrepancy(Long id, ResolveDiscrepancyRequest req) {
        IntegrationReconciliationItemEntity item = reconciliationRepo.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reconciliation item not found: " + id));

        item.resolutionAction = req.resolutionAction();
        item.resolutionNotes = req.resolutionNotes();
        item.resolvedBy = req.resolvedBy() != null ? req.resolvedBy() : "noc.engineer";
        item.resolvedAt = OffsetDateTime.now();

        if ("APPLY_TO_INVENTORY".equalsIgnoreCase(req.resolutionAction())) {
            item.status = ReconciliationStatus.MANUALLY_SYNCED;
            inventoryFacade.applyReconciliationDiff(
                    item.entityType, item.entityIdentifier, item.attributeName, item.liveDiscoveredValue
            );

            recordChangeLog(new CreateChangeLogRequest(
                    item.resolvedBy, "TELECOM_ENGINEER", "127.0.0.1", "INTEGRATION",
                    item.entityType, item.entityIdentifier, ChangeAction.RECONCILIATION_SYNC,
                    "Synchronized live network state for " + item.entityIdentifier + ": " + item.attributeName + " -> " + item.liveDiscoveredValue,
                    item.inventoryValue, item.liveDiscoveredValue, null
            ));
        } else if ("DISPATCH_WORK_ORDER".equalsIgnoreCase(req.resolutionAction())) {
            item.status = ReconciliationStatus.ESCALATED_BPMN;
            item.gaharuProcessInstanceId = "GAHARU-REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } else {
            item.status = ReconciliationStatus.REJECTED_ROGUE;
        }

        item.persist();
        return mapToReconciliationResponse(item);
    }

    // =========================================================================
    // 4. CHANGE LOGS (CDC)
    // =========================================================================
    public List<ChangeLogResponse> listChangeLogs(int limit, String domain) {
        List<IntegrationChangeLogEntity> logs = (domain != null && !domain.isBlank())
                ? changeLogRepo.findByEntityDomain(domain)
                : changeLogRepo.listRecent(limit > 0 ? limit : 50);
        return logs.stream().map(this::mapToChangeLogResponse).collect(Collectors.toList());
    }

    @Transactional
    public ChangeLogResponse recordChangeLog(CreateChangeLogRequest req) {
        IntegrationChangeLogEntity entity = new IntegrationChangeLogEntity();
        entity.username = req.username() != null ? req.username() : "system";
        entity.userRole = req.userRole() != null ? req.userRole() : "TELECOM_ENGINEER";
        entity.clientIp = req.clientIp() != null ? req.clientIp() : "127.0.0.1";
        entity.entityDomain = req.entityDomain();
        entity.entityType = req.entityType();
        entity.entityId = req.entityId();
        entity.action = req.action();
        entity.summary = req.summary();
        entity.beforeSnapshotJson = req.beforeSnapshotJson();
        entity.afterSnapshotJson = req.afterSnapshotJson();
        entity.diffSummaryJson = req.diffSummaryJson();
        changeLogRepo.persist(entity);
        return mapToChangeLogResponse(entity);
    }

    // =========================================================================
    // 5. ALARMS
    // =========================================================================
    public List<AlarmResponse> listAlarms(AlarmSeverity severity, Boolean activeOnly) {
        List<IntegrationAlarmEntity> alarms;
        if (severity != null) {
            alarms = alarmRepo.findBySeverity(severity);
        } else if (Boolean.TRUE.equals(activeOnly)) {
            alarms = alarmRepo.findActiveAlarms();
        } else {
            alarms = alarmRepo.list("order by raisedAt desc");
        }
        return alarms.stream().map(this::mapToAlarmResponse).collect(Collectors.toList());
    }

    @Transactional
    public AlarmResponse ingestAlarm(IngestAlarmRequest req) {
        IntegrationAlarmEntity entity = new IntegrationAlarmEntity();
        entity.alarmIdentifier = (req.alarmIdentifier() != null && !req.alarmIdentifier().isBlank())
                ? req.alarmIdentifier()
                : "ALM-" + System.currentTimeMillis();
        entity.sourceSystem = req.sourceSystem() != null ? req.sourceSystem() : "REST_INGEST";
        entity.sourceIp = req.sourceIp() != null ? req.sourceIp() : "10.200.1.1";
        entity.alarmName = req.alarmName() != null ? req.alarmName() : "LinkDown";
        entity.alarmType = req.alarmType() != null ? req.alarmType() : "COMMUNICATIONS_ALARM";
        entity.severity = req.severity() != null ? req.severity() : AlarmSeverity.MAJOR;
        entity.lifecycleStatus = AlarmLifecycleStatus.ACTIVE_UNACKNOWLEDGED;
        entity.rawPayloadJson = req.rawPayloadJson();
        entity.rootCauseTag = req.rootCauseTag();

        // TELECOM ENRICHMENT VIA INVENTORY FACADE
        InventoryFacade.EnrichedTopology enriched = inventoryFacade.enrichAlarm(req.deviceIdentifier(), req.portIdentifier());
        entity.deviceId = enriched.deviceId();
        entity.deviceName = enriched.deviceName();
        entity.portId = enriched.portId();
        entity.portName = enriched.portName();
        entity.locationName = enriched.locationName();
        entity.rackCode = enriched.rackCode();
        entity.opticalCableCode = enriched.opticalCableCode();
        entity.opticalStrandNo = enriched.opticalStrandNo();
        entity.leasedLineCircuitCode = enriched.leasedLineCircuitCode();
        entity.carrierName = enriched.carrierName();
        entity.slaTier = enriched.slaTier();
        entity.impactedServicesCount = enriched.impactedServicesCount();
        entity.impactedCustomersCount = enriched.impactedCustomersCount();
        entity.estimatedRevenueRiskUsd = enriched.estimatedRevenueRiskUsd();
        if (entity.rootCauseTag == null) entity.rootCauseTag = enriched.rootCauseRecommendation();

        alarmRepo.persist(entity);

        // Webhook trigger if Critical or Major
        if (entity.severity == AlarmSeverity.CRITICAL || entity.severity == AlarmSeverity.MAJOR) {
            dispatchWebhookEvent("Alarm" + entity.severity.name(), entity);
        }

        return mapToAlarmResponse(entity);
    }

    @Transactional
    public AlarmResponse processAlarmAction(Long alarmId, AlarmActionRequest req) {
        IntegrationAlarmEntity alarm = alarmRepo.findByIdOptional(alarmId)
                .orElseThrow(() -> new ResourceNotFoundException("Alarm not found: " + alarmId));

        if ("ACKNOWLEDGE".equalsIgnoreCase(req.action())) {
            alarm.lifecycleStatus = AlarmLifecycleStatus.ACKNOWLEDGED;
            alarm.acknowledgedBy = req.username() != null ? req.username() : "noc.operator";
            alarm.acknowledgedAt = OffsetDateTime.now();
        } else if ("CLEAR".equalsIgnoreCase(req.action())) {
            alarm.lifecycleStatus = AlarmLifecycleStatus.RESOLVED;
            alarm.clearedAt = OffsetDateTime.now();
        } else if ("ESCALATE_GAHARU".equalsIgnoreCase(req.action())) {
            alarm.lifecycleStatus = AlarmLifecycleStatus.IN_INVESTIGATION;
            alarm.gaharuTicketId = "GAHARU-INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        alarm.persist();
        return mapToAlarmResponse(alarm);
    }

    // =========================================================================
    // 6. WEBHOOKS
    // =========================================================================
    public List<WebhookSubscriptionResponse> listWebhooks() {
        return webhookSubRepo.listAll().stream().map(this::mapToWebhookSubResponse).collect(Collectors.toList());
    }

    @Transactional
    public WebhookSubscriptionResponse createWebhook(CreateWebhookSubscriptionRequest req) {
        IntegrationWebhookSubscriptionEntity entity = new IntegrationWebhookSubscriptionEntity();
        entity.name = req.name();
        entity.subscriberSystem = req.subscriberSystem();
        entity.targetUrl = req.targetUrl();
        entity.eventTopics = req.eventTopics();
        entity.secretToken = req.secretToken() != null ? req.secretToken() : UUID.randomUUID().toString();
        entity.retryCount = req.retryCount() != null ? req.retryCount() : 3;
        entity.timeoutMs = req.timeoutMs() != null ? req.timeoutMs() : 5000;
        entity.isActive = true;
        webhookSubRepo.persist(entity);
        return mapToWebhookSubResponse(entity);
    }

    public List<WebhookLogResponse> listWebhookLogs(Long subId) {
        List<IntegrationWebhookLogEntity> logs = (subId != null)
                ? webhookLogRepo.findBySubscriptionId(subId)
                : webhookLogRepo.listRecent(30);
        return logs.stream().map(this::mapToWebhookLogResponse).collect(Collectors.toList());
    }

    @Transactional
    public void dispatchWebhookEvent(String eventTopic, Object payload) {
        List<IntegrationWebhookSubscriptionEntity> subs = webhookSubRepo.findByTopic(eventTopic);
        for (IntegrationWebhookSubscriptionEntity sub : subs) {
            IntegrationWebhookLogEntity log = new IntegrationWebhookLogEntity();
            log.subscription = sub;
            log.eventTopic = eventTopic;
            log.payloadJson = (payload != null) ? payload.toString() : "{}";
            log.responseCode = 200;
            log.responseBody = "{\"status\": \"ACCEPTED\"}";
            log.latencyMs = (int) (Math.random() * 80) + 20;
            log.status = "DELIVERED";
            webhookLogRepo.persist(log);
        }
    }

    // =========================================================================
    // 7. STATS
    // =========================================================================
    public IntegrationStatsResponse getIntegrationStats() {
        long totalConn = connectorRepo.count();
        long onlineConn = connectorRepo.count("status", ConnectorStatus.ONLINE);
        long pendingRec = reconciliationRepo.count("status", ReconciliationStatus.PENDING_REVIEW);
        long critAlarms = alarmRepo.count("severity = ?1 and lifecycleStatus != ?2", AlarmSeverity.CRITICAL, AlarmLifecycleStatus.RESOLVED);
        long majAlarms = alarmRepo.count("severity = ?1 and lifecycleStatus != ?2", AlarmSeverity.MAJOR, AlarmLifecycleStatus.RESOLVED);
        long totalChanges = changeLogRepo.count();
        long activeHooks = webhookSubRepo.count("isActive", true);

        // Sum revenue at risk from active critical/major alarms
        List<IntegrationAlarmEntity> activeAlarms = alarmRepo.findActiveAlarms();
        BigDecimal revRisk = activeAlarms.stream()
                .map(a -> a.estimatedRevenueRiskUsd != null ? a.estimatedRevenueRiskUsd : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new IntegrationStatsResponse(
                totalConn, onlineConn, pendingRec, critAlarms, majAlarms, totalChanges, activeHooks, revRisk
        );
    }

    // =========================================================================
    // MAPPERS
    // =========================================================================
    private ConnectorResponse mapToConnectorResponse(IntegrationConnectorEntity e) {
        return new ConnectorResponse(
                e.id, e.name, e.vendor, e.connectorType, e.protocol, e.endpointUrl, e.authType,
                e.authCredentialMasked, e.status, e.pingLatencyMs, e.syncIntervalMins,
                e.autoReconcileEnabled, e.autoApproveMinorDiffs, e.lastSyncAt, e.lastSyncStatus,
                e.managedElementsCount, e.createdAt
        );
    }

    private DiscoveryJobResponse mapToDiscoveryJobResponse(IntegrationDiscoveryJobEntity e) {
        return new DiscoveryJobResponse(
                e.id, e.connector.id, e.connector.name, e.jobType, e.status,
                e.startedAt, e.completedAt, e.elementsScanned, e.discrepanciesFound,
                e.errorMessage, e.initiatedBy
        );
    }

    private ReconciliationItemResponse mapToReconciliationResponse(IntegrationReconciliationItemEntity e) {
        return new ReconciliationItemResponse(
                e.id, e.discoveryJob != null ? e.discoveryJob.id : null,
                e.connector.id, e.connector.name, e.entityType, e.entityIdentifier,
                e.targetInventoryId, e.discrepancyType, e.attributeName, e.inventoryValue,
                e.liveDiscoveredValue, e.severity, e.status, e.resolutionAction, e.resolvedBy,
                e.resolvedAt, e.resolutionNotes, e.gaharuProcessInstanceId, e.createdAt
        );
    }

    private ChangeLogResponse mapToChangeLogResponse(IntegrationChangeLogEntity e) {
        return new ChangeLogResponse(
                e.id, e.timestamp, e.username, e.userRole, e.clientIp, e.entityDomain,
                e.entityType, e.entityId, e.action, e.summary, e.beforeSnapshotJson,
                e.afterSnapshotJson, e.diffSummaryJson
        );
    }

    private AlarmResponse mapToAlarmResponse(IntegrationAlarmEntity e) {
        return new AlarmResponse(
                e.id, e.alarmIdentifier, e.sourceSystem, e.sourceIp, e.alarmName, e.alarmType,
                e.severity, e.lifecycleStatus, e.raisedAt, e.clearedAt, e.acknowledgedBy,
                e.acknowledgedAt, e.rawPayloadJson, e.deviceId, e.deviceName, e.portId,
                e.portName, e.locationName, e.rackCode, e.opticalCableCode, e.opticalStrandNo,
                e.leasedLineCircuitCode, e.carrierName, e.slaTier, e.impactedServicesCount,
                e.impactedCustomersCount, e.estimatedRevenueRiskUsd, e.gaharuTicketId, e.rootCauseTag
        );
    }

    private WebhookSubscriptionResponse mapToWebhookSubResponse(IntegrationWebhookSubscriptionEntity e) {
        return new WebhookSubscriptionResponse(
                e.id, e.name, e.subscriberSystem, e.targetUrl, e.eventTopics,
                "******", e.isActive, e.retryCount, e.timeoutMs, e.createdAt
        );
    }

    private WebhookLogResponse mapToWebhookLogResponse(IntegrationWebhookLogEntity e) {
        return new WebhookLogResponse(
                e.id, e.subscription.id, e.subscription.name, e.eventTopic, e.payloadJson,
                e.dispatchedAt, e.responseCode, e.responseBody, e.latencyMs, e.status
        );
    }
}
