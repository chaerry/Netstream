package id.co.netstream.integration.controller;

import id.co.netstream.integration.domain.entity.IntegrationAlarmEntity;
import id.co.netstream.integration.facade.InventoryFacade;
import id.co.netstream.integration.repository.IntegrationAlarmRepository;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Path("/api/v1/tmf")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "TM Forum Northbound Open APIs", description = "Standardized TMF638 (Service Inventory), TMF639 (Resource Inventory), and TMF642 (Alarm Management)")
public class TmfOpenApiResource {

    @Inject
    InventoryFacade inventoryFacade;

    @Inject
    IntegrationAlarmRepository alarmRepo;

    // --- TMF638 Service Inventory Management ---
    @GET
    @Path("/serviceInventory/v4/service")
    @PermitAll
    @Operation(summary = "TMF638: List active subscriber services and service topology")
    public Response getTmfServices() {
        return Response.ok(inventoryFacade.getTmfServices()).build();
    }

    // --- TMF639 Resource Inventory Management ---
    @GET
    @Path("/resourceInventory/v4/resource")
    @PermitAll
    @Operation(summary = "TMF639: Query physical and logical resource catalog")
    public Response getTmfResources() {
        return Response.ok(inventoryFacade.getTmfResources()).build();
    }

    // --- TMF642 Alarm Management ---
    @GET
    @Path("/alarmManagement/v4/alarm")
    @PermitAll
    @Operation(summary = "TMF642: Retrieve enriched telecom alarm stream")
    public Response getTmfAlarms() {
        List<IntegrationAlarmEntity> alarms = alarmRepo.findActiveAlarms();
        List<Map<String, Object>> tmfList = new ArrayList<>();
        for (IntegrationAlarmEntity a : alarms) {
            tmfList.add(Map.of(
                    "id", a.alarmIdentifier != null ? a.alarmIdentifier : a.id.toString(),
                    "href", "/api/v1/tmf/alarmManagement/v4/alarm/" + a.id,
                    "alarmType", a.alarmType != null ? a.alarmType : "COMMUNICATIONS_ALARM",
                    "perceivedSeverity", a.severity != null ? a.severity.name() : "MAJOR",
                    "probableCause", a.alarmName != null ? a.alarmName : "LossOfSignal",
                    "state", a.lifecycleStatus != null ? a.lifecycleStatus.name() : "ACTIVE",
                    "alarmRaisedTime", a.raisedAt != null ? a.raisedAt.toString() : "",
                    "affectedService", Map.of(
                            "serviceCount", a.impactedServicesCount != null ? a.impactedServicesCount : 0,
                            "customerCount", a.impactedCustomersCount != null ? a.impactedCustomersCount : 0,
                            "revenueRiskUsd", a.estimatedRevenueRiskUsd != null ? a.estimatedRevenueRiskUsd : 0
                    )
            ));
        }
        return Response.ok(tmfList).build();
    }
}
