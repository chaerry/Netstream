package id.co.netstream.inventory.controller;

import id.co.netstream.inventory.domain.enums.LocationType;
import id.co.netstream.inventory.dto.LocationDTOs.*;
import id.co.netstream.inventory.service.LocationService;
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

@Path("/api/v1/inventory/locations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
@Tag(name = "Location & Digital Twin", description = "Endpoints for Country, City, Site, Building, Room, and Rack Hierarchy")
public class LocationResource {

    @Inject
    LocationService locationService;

    @GET
    @Path("/tree")
    @Operation(summary = "Get full hierarchical location digital twin tree")
    public List<LocationResponse> getHierarchyTree() {
        return locationService.getHierarchyTree();
    }

    @GET
    @Operation(summary = "List locations optionally filtered by type")
    public List<LocationResponse> getLocations(@QueryParam("type") LocationType type) {
        if (type != null) {
            return locationService.getLocationsByType(type);
        }
        return locationService.getHierarchyTree();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get location by ID")
    public LocationResponse getLocationById(@PathParam("id") UUID id) {
        return locationService.getLocationById(id);
    }

    @POST
    @Operation(summary = "Create a location node (Site, Building, Room)")
    public Response createLocation(@Valid CreateLocationRequest request) {
        LocationResponse created = locationService.createLocation(request);
        return Response.created(URI.create("/api/v1/inventory/locations/" + created.id()))
                .entity(created)
                .build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update location node properties, status, and parent binding")
    public LocationResponse updateLocation(@PathParam("id") UUID id, @Valid UpdateLocationRequest request) {
        return locationService.updateLocation(id, request);
    }

    @GET
    @Path("/racks")
    @Operation(summary = "Get all equipment racks across all locations")
    public List<RackResponse> getAllRacks() {
        return locationService.getAllRacks();
    }

    @GET
    @Path("/{id}/racks")
    @Operation(summary = "Get all equipment racks in a location/room")
    public List<RackResponse> getRacksByLocation(@PathParam("id") UUID id) {
        return locationService.getRacksByLocation(id);
    }

    @POST
    @Path("/racks")
    @Operation(summary = "Create a server rack")
    public Response createRack(@Valid CreateRackRequest request) {
        RackResponse created = locationService.createRack(request);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }
}
