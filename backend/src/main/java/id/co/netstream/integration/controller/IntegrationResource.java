package id.co.netstream.integration.controller;

import id.co.netstream.integration.domain.enums.AlarmSeverity;
import id.co.netstream.integration.domain.enums.DiscrepancyType;
import id.co.netstream.integration.domain.enums.ReconciliationStatus;
import id.co.netstream.integration.dto.IntegrationDTOs.*;
import id.co.netstream.integration.service.IntegrationService;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.List;

@Path("/api/v1/integration")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Integration & Automation Module", description = "Southbound multi-vendor NMS/EMS discovery, auto-reconciliation, change tracking (CDC), enriched alarms, and Northbound webhooks")
public class IntegrationResource {

    @Inject
    IntegrationService integrationService;

    // --- Dashboard Stats ---
    @GET
    @Path("/stats")
    @PermitAll
    @Operation(summary = "Get integration hub telemetry stats")
    public Response getStats() {
        return Response.ok(integrationService.getIntegrationStats()).build();
    }

    // --- Connectors ---
    @GET
    @Path("/connectors")
    @PermitAll
    @Operation(summary = "List all registered multi-vendor EMS/NMS connectors")
    public List<ConnectorResponse> listConnectors() {
        return integrationService.listConnectors();
    }

    @GET
    @Path("/connectors/{id}")
    @PermitAll
    @Operation(summary = "Get connector details by ID")
    public ConnectorResponse getConnector(@PathParam("id") Long id) {
        return integrationService.getConnector(id);
    }

    @POST
    @Path("/connectors")
    @RolesAllowed({"TELECOM_ADMIN", "TELECOM_PLANNER"})
    @Operation(summary = "Register a new Southbound EMS/NMS connector")
    public Response createConnector(@Valid CreateConnectorRequest req) {
        return Response.status(Response.Status.CREATED).entity(integrationService.createConnector(req)).build();
    }

    @POST
    @Path("/connectors/{id}/test")
    @PermitAll
    @Operation(summary = "Test connectivity and measure ping latency for a connector")
    public ConnectorResponse testConnector(@PathParam("id") Long id) {
        return integrationService.testConnection(id);
    }

    // --- Discovery Jobs ---
    @GET
    @Path("/discovery-jobs")
    @PermitAll
    @Operation(summary = "List discovery job history")
    public List<DiscoveryJobResponse> listDiscoveryJobs(@QueryParam("connectorId") Long connectorId) {
        return integrationService.listDiscoveryJobs(connectorId);
    }

    @POST
    @Path("/connectors/{id}/discovery")
    @RolesAllowed({"TELECOM_ADMIN", "TELECOM_PLANNER", "TELECOM_ENGINEER"})
    @Operation(summary = "Trigger an auto-discovery sweep against an EMS/NMS connector")
    public DiscoveryJobResponse triggerDiscovery(@PathParam("id") Long connectorId, TriggerDiscoveryRequest req) {
        return integrationService.triggerDiscovery(connectorId, req != null ? req : new TriggerDiscoveryRequest("FULL_INVENTORY_SWEEP", "MANUAL_TRIGGER"));
    }

    // --- Reconciliation Items ---
    @GET
    @Path("/reconciliation")
    @PermitAll
    @Operation(summary = "List detected discrepancies between Live Network and Netstream Inventory SSoT")
    public List<ReconciliationItemResponse> listReconciliation(
            @QueryParam("status") ReconciliationStatus status,
            @QueryParam("type") DiscrepancyType type
    ) {
        return integrationService.listReconciliationItems(status, type);
    }

    @POST
    @Path("/reconciliation/{id}/resolve")
    @RolesAllowed({"TELECOM_ADMIN", "TELECOM_PLANNER", "TELECOM_ENGINEER"})
    @Operation(summary = "Apply sync, mark rogue, or dispatch field work order to Gaharu_BPMN_NGIN")
    public ReconciliationItemResponse resolveDiscrepancy(
            @PathParam("id") Long id,
            @Valid ResolveDiscrepancyRequest req
    ) {
        return integrationService.resolveDiscrepancy(id, req);
    }

    // --- Change Logs (CDC) ---
    @GET
    @Path("/audit-logs")
    @PermitAll
    @Operation(summary = "Query immutable Change Data Capture (CDC) audit ledger")
    public List<ChangeLogResponse> listChangeLogs(
            @QueryParam("limit") @DefaultValue("50") int limit,
            @QueryParam("domain") String domain
    ) {
        return integrationService.listChangeLogs(limit, domain);
    }

    @POST
    @Path("/audit-logs")
    @RolesAllowed({"TELECOM_ADMIN", "TELECOM_PLANNER", "TELECOM_ENGINEER"})
    @Operation(summary = "Record an audit log entry for external integration updates")
    public ChangeLogResponse recordChangeLog(@Valid CreateChangeLogRequest req) {
        return integrationService.recordChangeLog(req);
    }

    // --- Alarms ---
    @GET
    @Path("/alarms")
    @PermitAll
    @Operation(summary = "List real-time network alarms with telecom inventory enrichment")
    public List<AlarmResponse> listAlarms(
            @QueryParam("severity") AlarmSeverity severity,
            @QueryParam("activeOnly") @DefaultValue("true") Boolean activeOnly
    ) {
        return integrationService.listAlarms(severity, activeOnly);
    }

    @POST
    @Path("/alarms/ingest")
    @PermitAll
    @Operation(summary = "Ingest a raw alarm trap/event and enrich it with Netstream topology")
    public Response ingestAlarm(@Valid IngestAlarmRequest req) {
        return Response.status(Response.Status.CREATED).entity(integrationService.ingestAlarm(req)).build();
    }

    @POST
    @Path("/alarms/{id}/action")
    @RolesAllowed({"TELECOM_ADMIN", "TELECOM_ENGINEER"})
    @Operation(summary = "Acknowledge, clear, or escalate alarm to Gaharu_BPMN_NGIN trouble ticket")
    public AlarmResponse processAlarmAction(@PathParam("id") Long id, @Valid AlarmActionRequest req) {
        return integrationService.processAlarmAction(id, req);
    }

    // --- Webhooks ---
    @GET
    @Path("/webhooks")
    @PermitAll
    @Operation(summary = "List Northbound BSS/OSS webhook subscribers")
    public List<WebhookSubscriptionResponse> listWebhooks() {
        return integrationService.listWebhooks();
    }

    @POST
    @Path("/webhooks")
    @RolesAllowed({"TELECOM_ADMIN"})
    @Operation(summary = "Register a new Northbound webhook subscriber")
    public Response createWebhook(@Valid CreateWebhookSubscriptionRequest req) {
        return Response.status(Response.Status.CREATED).entity(integrationService.createWebhook(req)).build();
    }

    @GET
    @Path("/webhooks/{id}/logs")
    @PermitAll
    @Operation(summary = "View dispatch delivery logs for a webhook subscriber")
    public List<WebhookLogResponse> listWebhookLogs(@PathParam("id") Long id) {
        return integrationService.listWebhookLogs(id);
    }
}
