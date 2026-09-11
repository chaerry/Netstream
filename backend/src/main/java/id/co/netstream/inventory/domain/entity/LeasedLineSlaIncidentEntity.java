package id.co.netstream.inventory.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "leased_line_sla_incident", schema = "inventory")
public class LeasedLineSlaIncidentEntity extends PanacheEntityBase {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    public String id;

    @NotNull
    @Column(name = "circuit_id", length = 64, nullable = false)
    public String circuitId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "circuit_id", insertable = false, updatable = false)
    public LeasedLineCircuitEntity circuit;

    @NotBlank
    @Column(name = "ticket_number", length = 64, nullable = false, unique = true)
    public String ticketNumber;

    @Column(name = "carrier_ticket_number", length = 64)
    public String carrierTicketNumber;

    @NotNull
    @Column(name = "incident_start", nullable = false)
    public OffsetDateTime incidentStart;

    @Column(name = "incident_end")
    public OffsetDateTime incidentEnd;

    @Column(name = "duration_minutes")
    public Integer durationMinutes = 0;

    @Column(name = "target_mttr_minutes")
    public Integer targetMttrMinutes = 240;

    @Column(name = "is_mttr_breached")
    public Boolean isMttrBreached = false;

    @Column(name = "outage_type", length = 32)
    public String outageType = "FIBER_CUT";

    @Column(name = "root_cause", columnDefinition = "TEXT")
    public String rootCause;

    @Column(name = "currency", length = 8)
    public String currency = "USD";

    @Column(name = "penalty_rebate_amount", precision = 15, scale = 2)
    public BigDecimal penaltyRebateAmount = BigDecimal.ZERO;

    @Column(name = "claim_status", length = 32)
    public String claimStatus = "PENDING_CLAIM";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    public OffsetDateTime createdAt;
}
