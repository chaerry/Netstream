package id.co.netstream.inventory.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "leased_line_decom_request", schema = "inventory")
public class LeasedLineDecomRequestEntity extends PanacheEntityBase {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    public String id;

    @NotNull
    @Column(name = "circuit_id", length = 64, nullable = false)
    public String circuitId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "circuit_id", insertable = false, updatable = false)
    public LeasedLineCircuitEntity circuit;

    @Column(name = "gaharu_process_instance_id", length = 128)
    public String gaharuProcessInstanceId;

    @NotBlank
    @Column(name = "initiated_by", length = 64, nullable = false)
    public String initiatedBy;

    @NotBlank
    @Column(name = "reason", length = 128, nullable = false)
    public String reason;

    @NotNull
    @Column(name = "target_decom_date", nullable = false)
    public LocalDate targetDecomDate;

    @Column(name = "estimated_annual_savings", precision = 15, scale = 2)
    public BigDecimal estimatedAnnualSavings = BigDecimal.ZERO;

    @Column(name = "workflow_state", length = 32)
    public String workflowState = "BPMN_SUBMITTED";

    @Column(name = "gaharu_response_payload", columnDefinition = "TEXT")
    public String gaharuResponsePayload;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    public OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    public OffsetDateTime updatedAt;
}
