package id.co.netstream.inventory.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class GisDTOs {

    public record GisFeatureDTO(
            String type, // "Feature"
            String id,
            JsonNode geometry,
            Map<String, Object> properties
    ) {}

    public record GisFeatureCollectionDTO(
            String type, // "FeatureCollection"
            List<GisFeatureDTO> features
    ) {}

    public record NetworkLayersResponse(
            GisFeatureCollectionDTO locations,
            GisFeatureCollectionDTO cables,
            GisFeatureCollectionDTO manholes,
            GisFeatureCollectionDTO spliceClosures,
            Map<String, Long> summaryStats
    ) {}

    public record OtdrLocateRequest(
            UUID cableId,
            BigDecimal distanceKm
    ) {}

    public record OtdrLocateResponse(
            UUID cableId,
            String cableCode,
            String cableName,
            BigDecimal faultDistanceKm,
            BigDecimal totalCableKm,
            double latitude,
            double longitude,
            String nearestManholeCode,
            String nearestManholeName,
            BigDecimal distanceToNearestManholeMeters,
            String nearestLandmark,
            String recommendedAction
    ) {}

    public record BomRequest(
            List<UUID> cableIds
    ) {}

    public record BomItemDTO(
            String category,
            String itemCode,
            String description,
            BigDecimal quantity,
            String unit,
            BigDecimal unitPriceIdr,
            BigDecimal totalPriceIdr
    ) {}

    public record BillOfMaterialsResponse(
            int totalCables,
            BigDecimal totalRouteKm,
            int totalCores,
            int totalManholesEncountered,
            int totalSpliceClosures,
            List<BomItemDTO> items,
            BigDecimal totalEstimatedCapexIdr,
            BigDecimal totalEstimatedOpexAnnualIdr
    ) {}

    public record CreateManholeRequest(
            String code,
            String name,
            String type, // MANHOLE, HANDHOLE, POLE, PEDESTAL
            double latitude,
            double longitude,
            int ductCapacity,
            int ductUsed,
            BigDecimal depthMeters,
            String coverType
    ) {}

    public record ManholeResponse(
            UUID id,
            String code,
            String name,
            String type,
            double latitude,
            double longitude,
            int ductCapacity,
            int ductUsed,
            BigDecimal depthMeters,
            String coverType,
            String status
    ) {}
}
