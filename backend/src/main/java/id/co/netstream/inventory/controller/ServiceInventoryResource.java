package id.co.netstream.inventory.controller;

import id.co.netstream.inventory.domain.enums.ServiceStatus;
import id.co.netstream.inventory.domain.enums.ServiceType;
import id.co.netstream.inventory.dto.ServiceDTOs.*;
import id.co.netstream.inventory.service.ServiceInventoryService;
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

@Path("/api/v1/inventory/services")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
@Tag(name = "Service Inventory", description = "Endpoints for Telecom Customer Services and Service-to-Resource Mappings")
public class ServiceInventoryResource {

    @Inject
    ServiceInventoryService serviceInventoryService;

    @GET
    @Operation(summary = "List customer network services", description = "Returns active, planned, and provisioning services.")
    public List<ServiceDetailResponse> listServices(
            @QueryParam("search") String search,
            @QueryParam("type") ServiceType type,
            @QueryParam("status") ServiceStatus status) {
        return serviceInventoryService.listServices(search, type, status);
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get service details with end-to-end resource hops")
    public ServiceDetailResponse getServiceById(@PathParam("id") UUID id) {
        return serviceInventoryService.getServiceById(id);
    }

    @POST
    @Operation(summary = "Provision a new network service")
    public Response createService(@Valid CreateServiceRequest request) {
        ServiceDetailResponse created = serviceInventoryService.createService(request);
        return Response.created(URI.create("/api/v1/inventory/services/" + created.id()))
                .entity(created)
                .build();
    }

    @PATCH
    @Path("/{id}/status")
    @Operation(summary = "Update service lifecycle status (e.g. ACTIVE, SUSPENDED, TERMINATED)")
    public ServiceDetailResponse updateStatus(
            @PathParam("id") UUID id,
            @QueryParam("status") ServiceStatus status) {
        return serviceInventoryService.updateServiceStatus(id, status);
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete service record")
    public Response deleteService(@PathParam("id") UUID id) {
        serviceInventoryService.deleteService(id);
        return Response.noContent().build();
    }
}
