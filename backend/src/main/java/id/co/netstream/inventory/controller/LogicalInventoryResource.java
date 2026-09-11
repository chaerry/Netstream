package id.co.netstream.inventory.controller;

import id.co.netstream.inventory.dto.VirtualInventoryDTOs.*;
import id.co.netstream.inventory.service.LogicalInventoryService;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Path("/api/v1/inventory/virtual")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
@Tag(name = "Logical & Virtual Inventory", description = "Endpoints for Virtual Network Elements (VNE), VNFs, VLANs, and VRFs")
public class LogicalInventoryResource {

    @Inject
    LogicalInventoryService logicalService;

    @GET
    @Operation(summary = "List all Virtual Network Elements (VNE/VNF)")
    public List<VneResponse> listVnes() {
        return logicalService.listAllVnes();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get VNE details by ID")
    public VneResponse getVneById(@PathParam("id") UUID id) {
        return logicalService.getVneById(id);
    }

    @POST
    @Operation(summary = "Create a new Virtual Network Element")
    public Response createVne(@Valid CreateVneRequest request) {
        VneResponse created = logicalService.createVne(request);
        return Response.created(URI.create("/api/v1/inventory/virtual/" + created.id()))
                .entity(created)
                .build();
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a Virtual Network Element")
    public Response deleteVne(@PathParam("id") UUID id) {
        logicalService.deleteVne(id);
        return Response.noContent().build();
    }
}
