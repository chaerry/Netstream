package id.co.netstream.inventory.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Entity
@Table(name = "leased_line_invoice_item", schema = "inventory")
public class LeasedLineInvoiceItemEntity extends PanacheEntityBase {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    public String id;

    @NotNull
    @Column(name = "invoice_id", length = 64, nullable = false)
    public String invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", insertable = false, updatable = false)
    public LeasedLineInvoiceEntity invoice;

    @Column(name = "circuit_id", length = 64)
    public String circuitId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "circuit_id", insertable = false, updatable = false)
    public LeasedLineCircuitEntity circuit;

    @NotBlank
    @Column(name = "circuit_reference", length = 64, nullable = false)
    public String circuitReference;

    @NotNull
    @Column(name = "billed_mrc", precision = 15, scale = 2, nullable = false)
    public BigDecimal billedMrc;

    @NotNull
    @Column(name = "contracted_mrc", precision = 15, scale = 2, nullable = false)
    public BigDecimal contractedMrc;

    @Column(name = "discrepancy", precision = 15, scale = 2)
    public BigDecimal discrepancy = BigDecimal.ZERO;

    @Column(name = "status", length = 32)
    public String status = "VERIFIED";

    @Column(name = "notes", columnDefinition = "TEXT")
    public String notes;
}
