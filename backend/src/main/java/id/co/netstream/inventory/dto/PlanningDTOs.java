package id.co.netstream.inventory.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class PlanningDTOs {

    public record CostCalculationRequest(
            UUID aEndLocationId,
            UUID zEndLocationId,
            Integer requiredBandwidthMbps,
            String routingStrategy // "LOWEST_COST", "FEWEST_HOPS", "SHORTEST_PATH"
    ) {}

    public record PathSegment(
            int hop,
            String fromLocation,
            String toLocation,
            String deviceHostname,
            String linkType,
            BigDecimal segmentCostUsd,
            int latencyMs
    ) {}

    public record CostCalculationResponse(
            String routingStrategy,
            BigDecimal totalEstimatedCostUsd,
            int totalHops,
            int totalLatencyMs,
            boolean capacityAvailable,
            List<PathSegment> segments
    ) {}

    public record CapacityForecastResponse(
            String siteCode,
            String siteName,
            int totalRacks,
            int totalDevices,
            int totalPorts,
            int allocatedPorts,
            double portUtilizationPct,
            BigDecimal totalPowerWatt,
            BigDecimal consumedPowerWatt,
            double powerUtilizationPct
    ) {}
}
