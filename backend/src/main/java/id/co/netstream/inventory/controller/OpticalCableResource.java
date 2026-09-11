package id.co.netstream.inventory.controller;

import id.co.netstream.inventory.dto.OpticalCableDTOs.*;
import id.co.netstream.inventory.service.OpticalCableService;
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
import java.util.UUID;

@Path("/api/v1/inventory/cables")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Optical Cables & Core Management", description = "Endpoints for managing outside plant & optical fiber infrastructure")
public class OpticalCableResource {

    @Inject
    OpticalCableService cableService;

    @GET
    @PermitAll
    @Operation(summary = "List all optical fiber cables")
    public List<OpticalCableResponse> getAllCables() {
        return cableService.getAllCables();
    }

    @GET
    @Path("/{id}")
    @PermitAll
    @Operation(summary = "Get optical cable details with strand matrix")
    public OpticalCableResponse getCableById(@PathParam("id") UUID id) {
        return cableService.getCableById(id);
    }

    @POST
    @PermitAll
    @Operation(summary = "Register new optical fiber cable")
    public Response createCable(@Valid CreateCableRequest req) {
        OpticalCableResponse res = cableService.createCable(req);
        return Response.status(Response.Status.CREATED).entity(res).build();
    }

    @PUT
    @Path("/{id}")
    @PermitAll
    @Operation(summary = "Update optical cable properties, specifications, status, and route geometry")
    public OpticalCableResponse updateCable(
            @PathParam("id") UUID id,
            @Valid UpdateCableRequest req
    ) {
        return cableService.updateCable(id, req);
    }

    @PUT
    @Path("/strands/{strandId}")
    @PermitAll
    @Operation(summary = "Update cable strand allocation status")
    public CableStrandResponse updateStrand(
            @PathParam("strandId") UUID strandId,
            @Valid UpdateStrandRequest req
    ) {
        return cableService.updateStrand(strandId, req);
    }

    @DELETE
    @Path("/{id}")
    @PermitAll
    @Operation(summary = "Delete optical fiber cable")
    public Response deleteCable(@PathParam("id") UUID id) {
        cableService.deleteCable(id);
        return Response.noContent().build();
    }
}
