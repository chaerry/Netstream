package id.co.netstream.inventory.domain.entity;

import id.co.netstream.inventory.domain.enums.InvoiceStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "leased_line_invoice", schema = "inventory")
public class LeasedLineInvoiceEntity extends PanacheEntityBase {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    public String id;

    @NotBlank
    @Column(name = "invoice_number", length = 64, nullable = false, unique = true)
    public String invoiceNumber;

    @NotNull
    @Column(name = "carrier_id", length = 64, nullable = false)
    public String carrierId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrier_id", insertable = false, updatable = false)
    public LeasedLineCarrierEntity carrier;

    @NotNull
    @Column(name = "billing_period_start", nullable = false)
    public LocalDate billingPeriodStart;

    @NotNull
    @Column(name = "billing_period_end", nullable = false)
    public LocalDate billingPeriodEnd;

    @Column(name = "currency", length = 8)
    public String currency = "USD";

    @NotNull
    @Column(name = "billed_amount", precision = 15, scale = 2, nullable = false)
    public BigDecimal billedAmount;

    @NotNull
    @Column(name = "contracted_amount", precision = 15, scale = 2, nullable = false)
    public BigDecimal contractedAmount;

    @Column(name = "sla_penalty_credit", precision = 15, scale = 2)
    public BigDecimal slaPenaltyCredit = BigDecimal.ZERO;

    @NotNull
    @Column(name = "net_payable_amount", precision = 15, scale = 2, nullable = false)
    public BigDecimal netPayableAmount;

    @Column(name = "discrepancy_amount", precision = 15, scale = 2)
    public BigDecimal discrepancyAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 32)
    public InvoiceStatus status = InvoiceStatus.AUDITED_OK;

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    public String disputeReason;

    @NotNull
    @Column(name = "invoice_date", nullable = false)
    public LocalDate invoiceDate;

    @NotNull
    @Column(name = "due_date", nullable = false)
    public LocalDate dueDate;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<LeasedLineInvoiceItemEntity> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    public OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    public OffsetDateTime updatedAt;
}
