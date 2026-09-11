package id.co.netstream.inventory.controller;

import id.co.netstream.inventory.domain.enums.CircuitDirection;
import id.co.netstream.inventory.domain.enums.CircuitLifecycleStatus;
import id.co.netstream.inventory.domain.enums.CircuitTechnology;
import id.co.netstream.inventory.dto.CommonDTOs.PagedResponse;
import id.co.netstream.inventory.dto.LeasedLineDTOs.*;
import id.co.netstream.inventory.service.LeasedLineService;
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

@Path("/api/v1/leased-lines")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Leased Line Module (VC4 S2C Model)", description = "Dedicated circuits, carrier contracts, automated invoice audit, and OpEx capacity optimization")
public class LeasedLineResource {

    @Inject
    LeasedLineService leasedLineService;

    // =========================================================================
    // CIRCUITS
    // =========================================================================

    @GET
    @Path("/circuits")
    @PermitAll
    @Operation(summary = "Search and list leased line circuits")
    public PagedResponse<CircuitResponse> getCircuits(
            @QueryParam("query") String query,
            @QueryParam("direction") CircuitDirection direction,
            @QueryParam("technology") CircuitTechnology technology,
            @QueryParam("status") CircuitLifecycleStatus status,
            @QueryParam("carrierId") String carrierId,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size
    ) {
        return leasedLineService.getCircuits(query, direction, technology, status, carrierId, page, size);
    }

    @GET
    @Path("/circuits/{id}")
    @PermitAll
    @Operation(summary = "Get leased line circuit details by ID")
    public CircuitResponse getCircuitById(@PathParam("id") String id) {
        return leasedLineService.getCircuitById(id);
    }

    @POST
    @Path("/circuits")
    @RolesAllowed({"TELECOM_ADMIN", "TELECOM_PLANNER"})
    @Operation(summary = "Provision a new leased line circuit")
    public Response createCircuit(@Valid CreateCircuitRequest request) {
        CircuitResponse response = leasedLineService.createCircuit(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @PUT
    @Path("/circuits/{id}")
    @RolesAllowed({"TELECOM_ADMIN", "TELECOM_PLANNER", "TELECOM_ENGINEER"})
    @Operation(summary = "Update an existing leased line circuit")
    public CircuitResponse updateCircuit(@PathParam("id") String id, @Valid UpdateCircuitRequest request) {
        return leasedLineService.updateCircuit(id, request);
    }

    @GET
    @Path("/circuits/{id}/topology")
    @PermitAll
    @Operation(summary = "Get physical and logical hop topology for circuit")
    public TopologyPathResponse getCircuitTopologyPath(@PathParam("id") String id) {
        return leasedLineService.getCircuitTopologyPath(id);
    }

    // =========================================================================
    // OPEX CAPACITY AUDIT & DORMANT SCANNER
    // =========================================================================

    @GET
    @Path("/capacity/audit")
    @PermitAll
    @Operation(summary = "Run OpEx capacity audit scanning for dormant/idle leased lines")
    public CapacityAuditReportResponse runCapacityAudit() {
        return leasedLineService.runCapacityAudit();
    }

    @POST
    @Path("/capacity/decommission/gaharu-trigger")
    @RolesAllowed({"TELECOM_ADMIN", "TELECOM_PLANNER"})
    @Operation(summary = "Trigger Gaharu BPMN NGIN workflow for circuit decommissioning")
    public Response triggerGaharuDecomWorkflow(@Valid InitiateDecomRequest request) {
        DecomRequestResponse response = leasedLineService.triggerGaharuDecomWorkflow(request);
        return Response.status(Response.Status.ACCEPTED).entity(response).build();
    }

    // =========================================================================
    // INVOICE AUDIT & 3-WAY RECONCILIATION
    // =========================================================================

    @GET
    @Path("/invoices/audit")
    @PermitAll
    @Operation(summary = "Retrieve automated invoice audit reconciliation records")
    public List<InvoiceAuditResponse> getInvoiceAudits(@QueryParam("carrierId") String carrierId) {
        return leasedLineService.getInvoiceAudits(carrierId);
    }

    // =========================================================================
    // SLA MONITORING & PENALTIES
    // =========================================================================

    @GET
    @Path("/sla/incidents")
    @PermitAll
    @Operation(summary = "List SLA outage incidents and penalty claims")
    public List<SlaIncidentResponse> getSlaIncidents(@QueryParam("circuitId") String circuitId) {
        return leasedLineService.getSlaIncidents(circuitId);
    }

    @POST
    @Path("/sla/incidents")
    @RolesAllowed({"TELECOM_ADMIN", "TELECOM_ENGINEER"})
    @Operation(summary = "Log an outage incident and calculate penalty rebate")
    public Response logSlaIncident(@Valid LogSlaIncidentRequest request) {
        SlaIncidentResponse response = leasedLineService.logSlaIncident(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    // =========================================================================
    // CARRIERS & CONTRACTS
    // =========================================================================

    @GET
    @Path("/carriers")
    @PermitAll
    @Operation(summary = "List carrier / telco providers")
    public List<CarrierResponse> getCarriers() {
        return leasedLineService.getCarriers();
    }

    @GET
    @Path("/contracts")
    @PermitAll
    @Operation(summary = "List Master Service Agreements & Service Orders")
    public List<ContractResponse> getContracts() {
        return leasedLineService.getContracts();
    }
}
