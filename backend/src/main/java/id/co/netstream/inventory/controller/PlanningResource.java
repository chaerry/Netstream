package id.co.netstream.inventory.controller;

import id.co.netstream.inventory.dto.PlanningDTOs.*;
import id.co.netstream.inventory.service.PlanningCostService;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/api/v1/inventory/planning")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
@Tag(name = "Planning, Capacity & Cost", description = "Endpoints for Automated Path Cost Analysis, Fewest Hops vs Lowest Cost, and Capacity Forecasting")
public class PlanningResource {

    @Inject
    PlanningCostService planningCostService;

    @POST
    @Path("/calculate-cost")
    @Operation(summary = "Calculate optimal network route & cost based on rules (lowest cost, fewest hops, shortest path)")
    public CostCalculationResponse calculateCost(@Valid CostCalculationRequest request) {
        return planningCostService.calculatePathCost(request);
    }

    @GET
    @Path("/capacity-forecast")
    @Operation(summary = "Get site-level capacity and power forecast")
    public List<CapacityForecastResponse> getCapacityForecast() {
        return planningCostService.getCapacityForecast();
    }
}
