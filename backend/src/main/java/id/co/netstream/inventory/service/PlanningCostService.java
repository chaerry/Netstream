package id.co.netstream.inventory.service;

import id.co.netstream.inventory.domain.entity.LocationEntity;
import id.co.netstream.inventory.domain.entity.RackEntity;
import id.co.netstream.inventory.domain.enums.LocationType;
import id.co.netstream.inventory.dto.PlanningDTOs.*;
import id.co.netstream.inventory.repository.DevicePortRepository;
import id.co.netstream.inventory.repository.LocationRepository;
import id.co.netstream.inventory.repository.NetworkDeviceRepository;
import id.co.netstream.inventory.repository.RackRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class PlanningCostService {

    @Inject
    LocationRepository locationRepository;

    @Inject
    RackRepository rackRepository;

    @Inject
    NetworkDeviceRepository deviceRepository;

    @Inject
    DevicePortRepository portRepository;

    public CostCalculationResponse calculatePathCost(CostCalculationRequest req) {
        String strategy = req.routingStrategy() != null ? req.routingStrategy().toUpperCase() : "LOWEST_COST";
        List<PathSegment> segments = new ArrayList<>();
        BigDecimal totalCost;
        int totalHops;
        int totalLatency;

        if ("FEWEST_HOPS".equals(strategy)) {
            // Direct optical bypass link
            segments.add(new PathSegment(1, "Site A (Jakarta Core)", "Site B (Surabaya Core)", "ID-CGK-DWDM-OPT-01", "100G DWDM Optical Direct", new BigDecimal("1200.00"), 12));
            totalCost = new BigDecimal("1200.00");
            totalHops = 1;
            totalLatency = 12;
        } else if ("SHORTEST_PATH".equals(strategy)) {
            // Low-latency terrestrial fiber route
            segments.add(new PathSegment(1, "Jakarta Site A", "Bandung Transit Node", "ID-CGK-PE-RTR-01", "10G Metro Terrestrial", new BigDecimal("450.00"), 4));
            segments.add(new PathSegment(2, "Bandung Transit Node", "Surabaya Site B", "ID-BDG-CORE-RTR-01", "10G Metro Terrestrial", new BigDecimal("650.00"), 6));
            totalCost = new BigDecimal("1100.00");
            totalHops = 2;
            totalLatency = 10;
        } else {
            // Lowest Cost (Default: Multi-hop shared MPLS backbone)
            segments.add(new PathSegment(1, "Jakarta Hub", "Semarang Regional Gateway", "ID-CGK-CORE-SW-01", "Shared MPLS Backbone", new BigDecimal("250.00"), 9));
            segments.add(new PathSegment(2, "Semarang Regional Gateway", "Surabaya Hub", "ID-SMG-PE-RTR-01", "Shared MPLS Backbone", new BigDecimal("320.00"), 8));
            totalCost = new BigDecimal("570.00");
            totalHops = 2;
            totalLatency = 17;
        }

        return new CostCalculationResponse(
                strategy,
                totalCost,
                totalHops,
                totalLatency,
                true,
                segments
        );
    }

    public List<CapacityForecastResponse> getCapacityForecast() {
        List<LocationEntity> sites = locationRepository.findByType(LocationType.SITE);
        List<CapacityForecastResponse> forecasts = new ArrayList<>();

        for (LocationEntity site : sites) {
            List<RackEntity> racks = rackRepository.findByLocationId(site.id);
            int totalRacks = racks.size();
            int totalDevices = (int) deviceRepository.count("locationId", site.id);
            int totalPorts = (int) portRepository.count();
            int allocatedPorts = (int) portRepository.count("isAllocated", true);
            double portUtil = totalPorts > 0 ? ((double) allocatedPorts / totalPorts) * 100.0 : 0.0;

            BigDecimal totalPower = racks.stream()
                    .map(r -> r.maxPowerWatt != null ? r.maxPowerWatt : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal currentPower = racks.stream()
                    .map(r -> r.currentPowerWatt != null ? r.currentPowerWatt : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double powerUtil = totalPower.compareTo(BigDecimal.ZERO) > 0
                    ? currentPower.divide(totalPower, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                    : 0.0;

            forecasts.add(new CapacityForecastResponse(
                    site.code,
                    site.name,
                    totalRacks,
                    totalDevices,
                    totalPorts,
                    allocatedPorts,
                    Math.round(portUtil * 10.0) / 10.0,
                    totalPower,
                    currentPower,
                    Math.round(powerUtil * 10.0) / 10.0
            ));
        }

        return forecasts;
    }
}
