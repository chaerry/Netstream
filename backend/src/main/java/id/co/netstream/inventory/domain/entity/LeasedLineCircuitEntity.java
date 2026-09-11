package id.co.netstream.inventory.domain.entity;

import id.co.netstream.inventory.domain.enums.CircuitDirection;
import id.co.netstream.inventory.domain.enums.CircuitLifecycleStatus;
import id.co.netstream.inventory.domain.enums.CircuitTechnology;
import id.co.netstream.inventory.domain.enums.SlaTier;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "leased_line_circuit", schema = "inventory")
public class LeasedLineCircuitEntity extends PanacheEntityBase {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    public String id;

    @NotBlank
    @Column(name = "circuit_id", length = 64, nullable = false, unique = true)
    public String circuitId;

    @Column(name = "carrier_circuit_id", length = 64)
    public String carrierCircuitId;

    @NotBlank
    @Column(name = "circuit_name", length = 128, nullable = false)
    public String circuitName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "direction", length = 32, nullable = false)
    public CircuitDirection direction = CircuitDirection.INBOUND_RENTED;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "technology", length = 32, nullable = false)
    public CircuitTechnology technology = CircuitTechnology.EPL;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 32, nullable = false)
    public CircuitLifecycleStatus status = CircuitLifecycleStatus.ACTIVE;

    @Column(name = "carrier_id", length = 64)
    public String carrierId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrier_id", insertable = false, updatable = false)
    public LeasedLineCarrierEntity carrier;

    @Column(name = "contract_id", length = 64)
    public String contractId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", insertable = false, updatable = false)
    public LeasedLineContractEntity contract;

    // Technical Specifications
    @Column(name = "bandwidth_mbps", nullable = false)
    public Integer bandwidthMbps = 1000;

    @Column(name = "bandwidth_display", length = 32)
    public String bandwidthDisplay = "1 Gbps";

    @Enumerated(EnumType.STRING)
    @Column(name = "sla_tier", length = 32)
    public SlaTier slaTier = SlaTier.GOLD_99_99;

    @Column(name = "uptime_target_percent", precision = 5, scale = 3)
    public BigDecimal uptimeTargetPercent = new BigDecimal("99.990");

    @Column(name = "mttr_target_hours", precision = 4, scale = 1)
    public BigDecimal mttrTargetHours = new BigDecimal("4.0");

    @Column(name = "committed_latency_ms", precision = 6, scale = 2)
    public BigDecimal committedLatencyMs = new BigDecimal("15.00");

    @Column(name = "actual_latency_ms", precision = 6, scale = 2)
    public BigDecimal actualLatencyMs = new BigDecimal("12.40");

    @Column(name = "jitter_ms", precision = 5, scale = 2)
    public BigDecimal jitterMs = new BigDecimal("1.20");

    @Column(name = "packet_loss_percent", precision = 4, scale = 3)
    public BigDecimal packetLossPercent = new BigDecimal("0.001");

    // Physical & Logical Inventory Linkage
    @Column(name = "a_end_location_id")
    public UUID aEndLocationId;

    @Column(name = "a_end_device_id")
    public UUID aEndDeviceId;

    @Column(name = "a_end_port_id")
    public UUID aEndPortId;

    @Column(name = "z_end_location_id")
    public UUID zEndLocationId;

    @Column(name = "z_end_device_id")
    public UUID zEndDeviceId;

    @Column(name = "z_end_port_id")
    public UUID zEndPortId;

    @Column(name = "optical_cable_id")
    public UUID opticalCableId;

    @Column(name = "strand_number")
    public Integer strandNumber;

    @Column(name = "vne_id")
    public UUID vneId;

    @Column(name = "vlan_id")
    public Integer vlanId;

    // Commercial & Customer Mapping
    @Column(name = "customer_id", length = 64)
    public String customerId;

    @Column(name = "customer_name", length = 128)
    public String customerName;

    @Column(name = "service_id")
    public UUID serviceId;

    @Column(name = "currency", length = 8)
    public String currency = "USD";

    @Column(name = "mrc", precision = 15, scale = 2, nullable = false)
    public BigDecimal mrc = BigDecimal.ZERO;

    @Column(name = "nrc", precision = 15, scale = 2)
    public BigDecimal nrc = BigDecimal.ZERO;

    // Capacity & OpEx Reduction Engine
    @Column(name = "utilization_percent", precision = 5, scale = 2)
    public BigDecimal utilizationPercent = BigDecimal.ZERO;

    @Column(name = "is_dormant")
    public Boolean isDormant = false;

    @Column(name = "dormant_since")
    public LocalDate dormantSince;

    @Column(name = "potential_monthly_savings", precision = 15, scale = 2)
    public BigDecimal potentialMonthlySavings = BigDecimal.ZERO;

    @Column(name = "activation_date")
    public LocalDate activationDate;

    @Column(name = "decommission_date")
    public LocalDate decommissionDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    public String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    public OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    public OffsetDateTime updatedAt;
}
