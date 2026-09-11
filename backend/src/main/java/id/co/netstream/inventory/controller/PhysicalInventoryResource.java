package id.co.netstream.inventory.controller;

import id.co.netstream.inventory.domain.enums.OperationalStatus;
import id.co.netstream.inventory.dto.CommonDTOs.PagedResponse;
import id.co.netstream.inventory.dto.DeviceDTOs.*;
import id.co.netstream.inventory.service.PhysicalInventoryService;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Path("/api/v1/inventory/devices")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
@Tag(name = "Physical Inventory", description = "Endpoints for managing physical devices, chassis, routers, switches, and ports")
public class PhysicalInventoryResource {

    @Inject
    PhysicalInventoryService inventoryService;

    @POST
    @Operation(summary = "Register new physical device", description = "Creates a physical network device asset record.")
    public Response createDevice(@Valid CreateDeviceRequest request) {
        DeviceDetailResponse created = inventoryService.createDevice(request);
        return Response.created(URI.create("/api/v1/inventory/devices/" + created.id()))
                .entity(created)
                .build();
    }

    @GET
    @Path("/types")
    @Operation(summary = "Get available device types from database enum")
    public List<DeviceTypeResponse> getDeviceTypes() {
        return inventoryService.getAvailableDeviceTypes();
    }

    @GET
    @Operation(summary = "Search and filter physical devices", description = "Returns a paginated list of devices with search and filters.")
    public PagedResponse<DeviceDetailResponse> listDevices(
            @QueryParam("search") String search,
            @QueryParam("type") String type,
            @QueryParam("status") OperationalStatus status,
            @QueryParam("locationId") UUID locationId,
            @QueryParam("page") @DefaultValue("0") @Min(0) int page,
            @QueryParam("size") @DefaultValue("10") @Min(1) @Max(100) int size) {
        return inventoryService.listDevices(search, type, status, locationId, page, size);
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get device details by ID")
    public DeviceDetailResponse getDeviceById(@PathParam("id") UUID id) {
        return inventoryService.getDeviceById(id);
    }

    @GET
    @Path("/rack/{rackId}")
    @Operation(summary = "Get all devices installed in a specific rack")
    public List<DeviceDetailResponse> getDevicesByRack(@PathParam("rackId") UUID rackId) {
        return inventoryService.getDevicesByRack(rackId);
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update device configuration (IP, Rack Position, Status, and metadata)")
    public DeviceDetailResponse updateDevice(
            @PathParam("id") UUID id,
            @Valid UpdateDeviceRequest request) {
        return inventoryService.updateDevice(id, request);
    }

    @PATCH
    @Path("/{id}/status")
    @Operation(summary = "Update device operational status")
    public DeviceDetailResponse updateStatus(
            @PathParam("id") UUID id,
            @Valid UpdateDeviceStatusRequest request) {
        return inventoryService.updateDeviceStatus(id, request);
    }

    @POST
    @Path("/{id}/ports")
    @Operation(summary = "Add a port interface to a physical device")
    public Response addPort(@PathParam("id") UUID id, @Valid CreatePortRequest request) {
        PortResponse port = inventoryService.addPortToDevice(id, request);
        return Response.status(Response.Status.CREATED).entity(port).build();
    }

    @GET
    @Path("/{id}/ports")
    @Operation(summary = "List all ports of a physical device")
    public List<PortResponse> getPorts(@PathParam("id") UUID id) {
        return inventoryService.getPortsByDevice(id);
    }

    @POST
    @Path("/ports/{portId}/allocate")
    @Operation(summary = "Allocate a port interface to an active circuit/network service")
    public PortResponse allocatePort(
            @PathParam("portId") UUID portId,
            @Valid AllocatePortRequest request) {
        return inventoryService.allocatePort(portId, request);
    }

    @POST
    @Path("/ports/{portId}/release")
    @Operation(summary = "Release and deallocate a port interface from its circuit")
    public PortResponse releasePort(@PathParam("portId") UUID portId) {
        return inventoryService.releasePort(portId);
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Decommission and delete device")
    public Response deleteDevice(@PathParam("id") UUID id) {
        inventoryService.deleteDevice(id);
        return Response.noContent().build();
    }
}
