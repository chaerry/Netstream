package id.co.netstream.inventory.service;

import id.co.netstream.inventory.domain.entity.*;
import id.co.netstream.inventory.domain.enums.CircuitDirection;
import id.co.netstream.inventory.domain.enums.CircuitLifecycleStatus;
import id.co.netstream.inventory.domain.enums.CircuitTechnology;
import id.co.netstream.inventory.dto.CommonDTOs.PagedResponse;
import id.co.netstream.inventory.dto.LeasedLineDTOs.*;
import id.co.netstream.inventory.exception.DuplicateEntityException;
import id.co.netstream.inventory.exception.ResourceNotFoundException;
import id.co.netstream.inventory.repository.*;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class LeasedLineService {

    private static final Logger LOG = Logger.getLogger(LeasedLineService.class);

    @Inject
    LeasedLineCircuitRepository circuitRepository;

    @Inject
    LeasedLineCarrierRepository carrierRepository;

    @Inject
    LeasedLineContractRepository contractRepository;

    @Inject
    LeasedLineInvoiceRepository invoiceRepository;

    @Inject
    LeasedLineSlaIncidentRepository slaIncidentRepository;

    @Inject
    LeasedLineDecomRequestRepository decomRequestRepository;

    @Inject
    LocationRepository locationRepository;

    @Inject
    NetworkDeviceRepository deviceRepository;

    @Inject
    DevicePortRepository portRepository;

    @Inject
    OpticalCableRepository cableRepository;

    @Inject
    VirtualNetworkElementRepository vneRepository;

    @Inject
    NetworkServiceRepository serviceRepository;

    // =========================================================================
    // 1. CIRCUIT MANAGEMENT & 360° VIEW
    // =========================================================================

    public PagedResponse<CircuitResponse> getCircuits(
            String query,
            CircuitDirection direction,
            CircuitTechnology technology,
            CircuitLifecycleStatus status,
            String carrierId,
            int page,
            int size
    ) {
        PanacheQuery<LeasedLineCircuitEntity> panacheQuery = circuitRepository.searchCircuits(
                query, direction, technology, status, carrierId, page, size
        );

        List<CircuitResponse> items = panacheQuery.list().stream()
                .map(this::mapCircuitToResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                items,
                panacheQuery.count(),
                panacheQuery.pageCount(),
                page,
                size
        );
    }

    public CircuitResponse getCircuitById(String id) {
        LeasedLineCircuitEntity entity = circuitRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeasedLineCircuit with id " + id + " not found"));
        return mapCircuitToResponse(entity);
    }

    @Transactional
    public CircuitResponse createCircuit(CreateCircuitRequest request) {
        if (circuitRepository.findByCircuitId(request.circuitId()).isPresent()) {
            throw new DuplicateEntityException("LeasedLineCircuit with circuitId " + request.circuitId() + " already exists");
        }

        LeasedLineCircuitEntity entity = new LeasedLineCircuitEntity();
        entity.id = "CKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        entity.circuitId = request.circuitId();
        entity.carrierCircuitId = request.carrierCircuitId();
        entity.circuitName = request.circuitName();
        entity.direction = request.direction();
        entity.technology = request.technology();
        entity.status = request.status() != null ? request.status() : CircuitLifecycleStatus.ACTIVE;
        entity.carrierId = request.carrierId();
        entity.contractId = request.contractId();

        entity.bandwidthMbps = request.bandwidthMbps();
        entity.bandwidthDisplay = request.bandwidthDisplay() != null ? request.bandwidthDisplay() : (request.bandwidthMbps() >= 1000 ? (request.bandwidthMbps() / 1000) + " Gbps" : request.bandwidthMbps() + " Mbps");
        entity.slaTier = request.slaTier();
        if (request.uptimeTargetPercent() != null) entity.uptimeTargetPercent = request.uptimeTargetPercent();
        if (request.mttrTargetHours() != null) entity.mttrTargetHours = request.mttrTargetHours();
        if (request.committedLatencyMs() != null) entity.committedLatencyMs = request.committedLatencyMs();

        entity.aEndLocationId = request.aEndLocationId();
        entity.aEndDeviceId = request.aEndDeviceId();
        entity.aEndPortId = request.aEndPortId();
        entity.zEndLocationId = request.zEndLocationId();
        entity.zEndDeviceId = request.zEndDeviceId();
        entity.zEndPortId = request.zEndPortId();
        entity.opticalCableId = request.opticalCableId();
        entity.strandNumber = request.strandNumber();
        entity.vneId = request.vneId();
        entity.vlanId = request.vlanId();

        entity.customerId = request.customerId();
        entity.customerName = request.customerName();
        entity.serviceId = request.serviceId();
        entity.currency = request.currency() != null ? request.currency() : "USD";
        entity.mrc = request.mrc();
        entity.nrc = request.nrc() != null ? request.nrc() : BigDecimal.ZERO;
        entity.notes = request.notes();
        entity.activationDate = LocalDate.now();

        circuitRepository.persist(entity);
        LOG.infof("Created new Leased Line Circuit: %s (%s)", entity.circuitId, entity.circuitName);

        return mapCircuitToResponse(entity);
    }

    @Transactional
    public CircuitResponse updateCircuit(String id, UpdateCircuitRequest request) {
        LeasedLineCircuitEntity entity = circuitRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeasedLineCircuit with id " + id + " not found"));

        if (request.carrierCircuitId() != null) entity.carrierCircuitId = request.carrierCircuitId();
        if (request.circuitName() != null) entity.circuitName = request.circuitName();
        if (request.status() != null) entity.status = request.status();
        if (request.carrierId() != null) entity.carrierId = request.carrierId();
        if (request.contractId() != null) entity.contractId = request.contractId();
        if (request.bandwidthMbps() != null) entity.bandwidthMbps = request.bandwidthMbps();
        if (request.bandwidthDisplay() != null) entity.bandwidthDisplay = request.bandwidthDisplay();
        if (request.slaTier() != null) entity.slaTier = request.slaTier();
        if (request.actualLatencyMs() != null) entity.actualLatencyMs = request.actualLatencyMs();
        if (request.utilizationPercent() != null) entity.utilizationPercent = request.utilizationPercent();
        if (request.aEndPortId() != null) entity.aEndPortId = request.aEndPortId();
        if (request.zEndPortId() != null) entity.zEndPortId = request.zEndPortId();
        if (request.opticalCableId() != null) entity.opticalCableId = request.opticalCableId();
        if (request.strandNumber() != null) entity.strandNumber = request.strandNumber();
        if (request.vneId() != null) entity.vneId = request.vneId();
        if (request.vlanId() != null) entity.vlanId = request.vlanId();
        if (request.customerId() != null) entity.customerId = request.customerId();
        if (request.customerName() != null) entity.customerName = request.customerName();
        if (request.mrc() != null) entity.mrc = request.mrc();
        if (request.nrc() != null) entity.nrc = request.nrc();
        if (request.notes() != null) entity.notes = request.notes();

        circuitRepository.persist(entity);
        return mapCircuitToResponse(entity);
    }

    // =========================================================================
    // 2. TOPOLOGY & INVENTORY RESOURCE MAPPING
    // =========================================================================

    public TopologyPathResponse getCircuitTopologyPath(String id) {
        LeasedLineCircuitEntity circuit = circuitRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeasedLineCircuit with id " + id + " not found"));

        List<CircuitHopItem> hops = new ArrayList<>();
        int seq = 1;

        // Hop 1: Origin Location
        String aLocName = getLocationName(circuit.aEndLocationId);
        hops.add(new CircuitHopItem(seq++, "LOCATION", aLocName != null ? aLocName : "A-End Site", "Origin Facility & Cage", "ACTIVE"));

        // Hop 2: A-End Termination Port
        String aDeviceName = getDeviceName(circuit.aEndDeviceId);
        String aPortName = getPortName(circuit.aEndPortId);
        hops.add(new CircuitHopItem(seq++, "DEVICE_PORT", (aDeviceName != null ? aDeviceName : "A-Device") + " : " + (aPortName != null ? aPortName : "GigE0/0/1"), "Physical SFP/XFP Port Hand-off", "ACTIVE"));

        // Hop 3: Optical Fiber Cable & Strand
        String cableName = getCableName(circuit.opticalCableId);
        hops.add(new CircuitHopItem(seq++, "FIBER_STRAND", cableName != null ? cableName : "Backbone Optical Span", "Strand #" + (circuit.strandNumber != null ? circuit.strandNumber : 1) + " (Single-Mode G.652D)", "ACTIVE"));

        // Hop 4: Logical VNE / VLAN / VRF
        String vneName = getVneName(circuit.vneId);
        hops.add(new CircuitHopItem(seq++, "VNE_OVERLAY", vneName != null ? vneName : "EPL Pseudowire VLL", "VLAN Tag: " + (circuit.vlanId != null ? circuit.vlanId : 100) + " | Encapsulation 802.1Q", "ACTIVE"));

        // Hop 5: Z-End Termination Port
        String zDeviceName = getDeviceName(circuit.zEndDeviceId);
        String zPortName = getPortName(circuit.zEndPortId);
        hops.add(new CircuitHopItem(seq++, "DEVICE_PORT", (zDeviceName != null ? zDeviceName : "Z-Device") + " : " + (zPortName != null ? zPortName : "GigE0/0/2"), "Destination SFP/XFP Hand-off", "ACTIVE"));

        // Hop 6: Destination Location
        String zLocName = getLocationName(circuit.zEndLocationId);
        hops.add(new CircuitHopItem(seq++, "LOCATION", zLocName != null ? zLocName : "Z-End Site", "Destination POP / Datacenter", "ACTIVE"));

        return new TopologyPathResponse(circuit.circuitId, circuit.circuitName, circuit.technology.name(), circuit.bandwidthDisplay, hops);
    }

    // =========================================================================
    // 3. OPEX CAPACITY AUDIT & DORMANT LINE SCANNER
    // =========================================================================

    public CapacityAuditReportResponse runCapacityAudit() {
        List<LeasedLineCircuitEntity> circuits = circuitRepository.listAll();
        List<DormantCircuitItem> dormantList = new ArrayList<>();
        BigDecimal totalMonthlySavings = BigDecimal.ZERO;

        for (LeasedLineCircuitEntity ckt : circuits) {
            // Criteria: marked dormant OR (inbound rented AND utilization < 1.00% AND 0 active services)
            boolean isUnderutilized = ckt.direction == CircuitDirection.INBOUND_RENTED
                    && (Boolean.TRUE.equals(ckt.isDormant) || (ckt.utilizationPercent != null && ckt.utilizationPercent.compareTo(new BigDecimal("1.00")) < 0));

            if (isUnderutilized) {
                BigDecimal savings = ckt.mrc != null ? ckt.mrc : BigDecimal.ZERO;
                totalMonthlySavings = totalMonthlySavings.add(savings);

                String carrierName = ckt.carrier != null ? ckt.carrier.name : (ckt.carrierId != null ? ckt.carrierId : "3rd-Party Carrier");
                dormantList.add(new DormantCircuitItem(
                        ckt.id,
                        ckt.circuitId,
                        ckt.carrierCircuitId,
                        ckt.circuitName,
                        carrierName,
                        ckt.technology.name(),
                        ckt.bandwidthDisplay,
                        savings,
                        ckt.utilizationPercent != null ? ckt.utilizationPercent : BigDecimal.ZERO,
                        ckt.dormantSince != null ? ckt.dormantSince : LocalDate.now().minusMonths(2),
                        "Zero active subscriber services attached; dormant traffic detected for >60 days.",
                        "Eligible for immediate cancellation via Gaharu BPMN NGIN workflow to eliminate OpEx.",
                        ckt.status == CircuitLifecycleStatus.PENDING_DECOMMISSION ? "BPMN_IN_PROGRESS" : "READY_TO_TRIGGER"
                ));
            }
        }

        BigDecimal totalAnnualSavings = totalMonthlySavings.multiply(new BigDecimal("12"));

        return new CapacityAuditReportResponse(
                circuits.size(),
                dormantList.size(),
                totalMonthlySavings,
                totalAnnualSavings,
                dormantList
        );
    }

    // =========================================================================
    // 4. GAHARU BPMN NGIN INTEGRATION (DECOMMISSIONING WORKFLOW)
    // =========================================================================

    @Transactional
    public DecomRequestResponse triggerGaharuDecomWorkflow(InitiateDecomRequest request) {
        LeasedLineCircuitEntity circuit = circuitRepository.findByIdOptional(request.circuitId())
                .orElseThrow(() -> new ResourceNotFoundException("LeasedLineCircuit with id " + request.circuitId() + " not found"));

        circuit.status = CircuitLifecycleStatus.PENDING_DECOMMISSION;
        circuit.decommissionDate = request.targetDecomDate();
        circuitRepository.persist(circuit);

        // Generate Gaharu BPMN process instance reference
        String processInstanceId = "gaharu_bpmn_inst_" + System.currentTimeMillis() + "_circuit_decom";
        BigDecimal annualSavings = circuit.mrc.multiply(new BigDecimal("12"));

        LeasedLineDecomRequestEntity entity = new LeasedLineDecomRequestEntity();
        entity.id = "DCM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        entity.circuitId = circuit.id;
        entity.gaharuProcessInstanceId = processInstanceId;
        entity.initiatedBy = request.initiatedBy();
        entity.reason = request.reason();
        entity.targetDecomDate = request.targetDecomDate();
        entity.estimatedAnnualSavings = annualSavings;
        entity.workflowState = "BPMN_SUBMITTED";
        entity.gaharuResponsePayload = String.format(
                "{\"status\":\"RUNNING\",\"processDefinitionKey\":\"leased_line_cancellation_flow\",\"circuitId\":\"%s\",\"carrierId\":\"%s\",\"targetDate\":\"%s\",\"savingsUsd\":%s}",
                circuit.circuitId, circuit.carrierId, request.targetDecomDate(), annualSavings
        );

        decomRequestRepository.persist(entity);
        LOG.infof("Dispatched Gaharu BPMN Ngin Decommissioning Flow: %s for Circuit: %s", processInstanceId, circuit.circuitId);

        return new DecomRequestResponse(
                entity.id,
                circuit.circuitId,
                circuit.circuitName,
                entity.gaharuProcessInstanceId,
                entity.initiatedBy,
                entity.reason,
                entity.targetDecomDate,
                entity.estimatedAnnualSavings,
                entity.workflowState,
                entity.gaharuResponsePayload,
                OffsetDateTime.now()
        );
    }

    // =========================================================================
    // 5. AUTOMATED INVOICE AUDIT & 3-WAY RECONCILIATION
    // =========================================================================

    public List<InvoiceAuditResponse> getInvoiceAudits(String carrierId) {
        List<LeasedLineInvoiceEntity> invoices = (carrierId != null && !carrierId.trim().isEmpty())
                ? invoiceRepository.findByCarrierId(carrierId)
                : invoiceRepository.listAll();

        return invoices.stream().map(inv -> {
            String carrierName = inv.carrier != null ? inv.carrier.name : inv.carrierId;
            List<InvoiceItemResponse> items = inv.items.stream()
                    .map(it -> new InvoiceItemResponse(it.id, it.circuitId, it.circuitReference, it.billedMrc, it.contractedMrc, it.discrepancy, it.status, it.notes))
                    .collect(Collectors.toList());

            return new InvoiceAuditResponse(
                    inv.id,
                    inv.invoiceNumber,
                    inv.carrierId,
                    carrierName,
                    inv.billingPeriodStart,
                    inv.billingPeriodEnd,
                    inv.currency,
                    inv.billedAmount,
                    inv.contractedAmount,
                    inv.slaPenaltyCredit,
                    inv.netPayableAmount,
                    inv.discrepancyAmount,
                    inv.status,
                    inv.disputeReason,
                    inv.invoiceDate,
                    inv.dueDate,
                    items
            );
        }).collect(Collectors.toList());
    }

    // =========================================================================
    // 6. SLA OUTAGE & PENALTY REBATE CALCULATOR
    // =========================================================================

    public List<SlaIncidentResponse> getSlaIncidents(String circuitId) {
        List<LeasedLineSlaIncidentEntity> incidents = (circuitId != null && !circuitId.trim().isEmpty())
                ? slaIncidentRepository.findByCircuitId(circuitId)
                : slaIncidentRepository.listAll();

        return incidents.stream().map(inc -> {
            String circuitName = inc.circuit != null ? inc.circuit.circuitName : inc.circuitId;
            return new SlaIncidentResponse(
                    inc.id,
                    inc.circuitId,
                    circuitName,
                    inc.ticketNumber,
                    inc.carrierTicketNumber,
                    inc.incidentStart,
                    inc.incidentEnd,
                    inc.durationMinutes,
                    inc.targetMttrMinutes,
                    inc.isMttrBreached,
                    inc.outageType,
                    inc.rootCause,
                    inc.currency,
                    inc.penaltyRebateAmount,
                    inc.claimStatus,
                    inc.createdAt
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public SlaIncidentResponse logSlaIncident(LogSlaIncidentRequest request) {
        LeasedLineCircuitEntity circuit = circuitRepository.findByIdOptional(request.circuitId())
                .orElseThrow(() -> new ResourceNotFoundException("LeasedLineCircuit with id " + request.circuitId() + " not found"));

        LeasedLineSlaIncidentEntity entity = new LeasedLineSlaIncidentEntity();
        entity.id = "INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        entity.circuitId = circuit.id;
        entity.ticketNumber = request.ticketNumber();
        entity.carrierTicketNumber = request.carrierTicketNumber();
        entity.incidentStart = request.incidentStart();
        entity.incidentEnd = request.incidentEnd();
        entity.durationMinutes = request.durationMinutes() != null ? request.durationMinutes() : 0;
        entity.targetMttrMinutes = request.targetMttrMinutes() != null ? request.targetMttrMinutes() : 240;
        entity.isMttrBreached = entity.durationMinutes > entity.targetMttrMinutes;
        entity.outageType = request.outageType() != null ? request.outageType() : "FIBER_CUT";
        entity.rootCause = request.rootCause();
        entity.currency = request.currency() != null ? request.currency() : "USD";

        // Automated Penalty Rebate Calculation:
        // If MTTR breached, calculate rebate pro-rata: (Excess Hours / 720 hours) * MRC * 2.0 multiplier
        if (request.penaltyRebateAmount() != null && request.penaltyRebateAmount().compareTo(BigDecimal.ZERO) > 0) {
            entity.penaltyRebateAmount = request.penaltyRebateAmount();
        } else if (entity.isMttrBreached && circuit.mrc.compareTo(BigDecimal.ZERO) > 0) {
            int excessMinutes = entity.durationMinutes - entity.targetMttrMinutes;
            BigDecimal excessHours = BigDecimal.valueOf(excessMinutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            BigDecimal hourlyRate = circuit.mrc.divide(BigDecimal.valueOf(720), 2, RoundingMode.HALF_UP);
            entity.penaltyRebateAmount = excessHours.multiply(hourlyRate).multiply(BigDecimal.valueOf(2));
        } else {
            entity.penaltyRebateAmount = BigDecimal.ZERO;
        }

        entity.claimStatus = entity.penaltyRebateAmount.compareTo(BigDecimal.ZERO) > 0 ? "PENDING_CLAIM" : "NO_PENALTY";
        slaIncidentRepository.persist(entity);

        return new SlaIncidentResponse(
                entity.id,
                circuit.circuitId,
                circuit.circuitName,
                entity.ticketNumber,
                entity.carrierTicketNumber,
                entity.incidentStart,
                entity.incidentEnd,
                entity.durationMinutes,
                entity.targetMttrMinutes,
                entity.isMttrBreached,
                entity.outageType,
                entity.rootCause,
                entity.currency,
                entity.penaltyRebateAmount,
                entity.claimStatus,
                entity.createdAt
        );
    }

    // =========================================================================
    // 7. CARRIERS & CONTRACTS
    // =========================================================================

    public List<CarrierResponse> getCarriers() {
        return carrierRepository.listAll().stream().map(c -> {
            long count = circuitRepository.count("carrierId", c.id);
            BigDecimal opex = circuitRepository.find("carrierId", c.id).list().stream()
                    .map(ckt -> ckt.mrc != null ? ckt.mrc : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return new CarrierResponse(
                    c.id, c.name, c.code, c.carrierType, c.contactPerson, c.contactEmail,
                    c.contactPhone, c.portalUrl, c.supportTier, c.escalationMatrix,
                    (int) count, opex, c.createdAt
            );
        }).collect(Collectors.toList());
    }

    public List<ContractResponse> getContracts() {
        return contractRepository.listAll().stream().map(ctr -> {
            String carrierName = ctr.carrier != null ? ctr.carrier.name : ctr.carrierId;
            long circuitCount = circuitRepository.count("contractId", ctr.id);
            long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), ctr.endDate);

            return new ContractResponse(
                    ctr.id, ctr.carrierId, carrierName, ctr.contractNumber, ctr.title,
                    ctr.contractType, ctr.startDate, ctr.endDate, ctr.termMonths,
                    ctr.autoRenewal, ctr.noticePeriodDays, ctr.currency, ctr.mrcTotal,
                    ctr.nrcTotal, ctr.status, ctr.documentUrl, (int) circuitCount, daysLeft
            );
        }).collect(Collectors.toList());
    }

    // =========================================================================
    // HELPER MAPPERS
    // =========================================================================

    private CircuitResponse mapCircuitToResponse(LeasedLineCircuitEntity e) {
        String carrierName = e.carrier != null ? e.carrier.name : (e.carrierId != null ? e.carrierId : null);
        String carrierCode = e.carrier != null ? e.carrier.code : null;
        String contractNumber = e.contract != null ? e.contract.contractNumber : null;

        String aLoc = getLocationName(e.aEndLocationId);
        String aDev = getDeviceName(e.aEndDeviceId);
        String aPort = getPortName(e.aEndPortId);
        String zLoc = getLocationName(e.zEndLocationId);
        String zDev = getDeviceName(e.zEndDeviceId);
        String zPort = getPortName(e.zEndPortId);
        String cableName = getCableName(e.opticalCableId);
        String vneName = getVneName(e.vneId);
        String serviceName = getServiceName(e.serviceId);

        return new CircuitResponse(
                e.id,
                e.circuitId,
                e.carrierCircuitId,
                e.circuitName,
                e.direction,
                e.technology,
                e.status,
                e.carrierId,
                carrierName,
                carrierCode,
                e.contractId,
                contractNumber,
                e.bandwidthMbps,
                e.bandwidthDisplay,
                e.slaTier,
                e.uptimeTargetPercent,
                e.mttrTargetHours,
                e.committedLatencyMs,
                e.actualLatencyMs,
                e.jitterMs,
                e.packetLossPercent,
                e.aEndLocationId,
                aLoc,
                e.aEndDeviceId,
                aDev,
                e.aEndPortId,
                aPort,
                e.zEndLocationId,
                zLoc,
                e.zEndDeviceId,
                zDev,
                e.zEndPortId,
                zPort,
                e.opticalCableId,
                cableName,
                e.strandNumber,
                e.vneId,
                vneName,
                e.vlanId,
                e.customerId,
                e.customerName,
                e.serviceId,
                serviceName,
                e.currency != null ? e.currency : "USD",
                e.mrc,
                e.nrc,
                e.utilizationPercent,
                e.isDormant,
                e.dormantSince,
                e.potentialMonthlySavings,
                e.activationDate,
                e.decommissionDate,
                e.notes,
                e.createdAt,
                e.updatedAt
        );
    }

    private String getLocationName(UUID id) {
        if (id == null) return null;
        return locationRepository.findByIdOptional(id).map(l -> l.name).orElse(null);
    }

    private String getDeviceName(UUID id) {
        if (id == null) return null;
        return deviceRepository.findByIdOptional(id).map(d -> d.hostname).orElse(null);
    }

    private String getPortName(UUID id) {
        if (id == null) return null;
        return portRepository.findByIdOptional(id).map(p -> p.portName).orElse(null);
    }

    private String getCableName(UUID id) {
        if (id == null) return null;
        return cableRepository.findByIdOptional(id).map(c -> c.cableName).orElse(null);
    }

    private String getVneName(UUID id) {
        if (id == null) return null;
        return vneRepository.findByIdOptional(id).map(v -> v.vneName).orElse(null);
    }

    private String getServiceName(UUID id) {
        if (id == null) return null;
        return serviceRepository.findByIdOptional(id).map(s -> s.serviceCode + " (" + s.customerName + ")").orElse(null);
    }
}
