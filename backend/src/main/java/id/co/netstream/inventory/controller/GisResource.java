package id.co.netstream.inventory.controller;

import id.co.netstream.inventory.dto.GisDTOs.*;
import id.co.netstream.inventory.service.GisService;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/v1/gis")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "GIS Module & PostGIS Telecom Spatial", description = "Endpoints for interactive GIS mapping, GeoJSON layers, OTDR fault locating, and Outside Plant (OSP)")
public class GisResource {

    @Inject
    GisService gisService;

    @GET
    @Path("/layers")
    @PermitAll
    @Operation(summary = "Get full network GIS layers as GeoJSON FeatureCollections (Locations, Cables, Manholes, Splice Closures)")
    public NetworkLayersResponse getNetworkLayers() {
        return gisService.getNetworkLayersGeoJson();
    }

    @POST
    @Path("/otdr-locate")
    @PermitAll
    @Operation(summary = "Pinpoint exact geographical coordinate of an optical fiber break from OTDR distance")
    public OtdrLocateResponse locateOtdrFault(@Valid OtdrLocateRequest req) {
        return gisService.locateOtdrFault(req.cableId(), req.distanceKm());
    }

    @POST
    @Path("/bom")
    @PermitAll
    @Operation(summary = "Calculate Outside Plant Bill of Materials (BOM) and cost estimates for selected route spans")
    public BillOfMaterialsResponse calculateBOM(@Valid BomRequest req) {
        return gisService.calculateBillOfMaterials(req.cableIds());
    }

    @POST
    @Path("/manholes")
    @PermitAll
    @Operation(summary = "Register new Outside Plant (OSP) manhole / handhole at GPS coordinate")
    public Response createManhole(@Valid CreateManholeRequest req) {
        ManholeResponse res = gisService.createManhole(req);
        return Response.status(Response.Status.CREATED).entity(res).build();
    }
}
