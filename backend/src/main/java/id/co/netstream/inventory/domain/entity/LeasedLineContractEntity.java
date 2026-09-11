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
@Table(name = "leased_line_contract", schema = "inventory")
public class LeasedLineContractEntity extends PanacheEntityBase {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    public String id;

    @Column(name = "carrier_id", length = 64)
    public String carrierId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrier_id", insertable = false, updatable = false)
    public LeasedLineCarrierEntity carrier;

    @NotBlank
    @Column(name = "contract_number", length = 64, nullable = false, unique = true)
    public String contractNumber;

    @NotBlank
    @Column(name = "title", length = 128, nullable = false)
    public String title;

    @Column(name = "contract_type", length = 32)
    public String contractType = "MSA";

    @NotNull
    @Column(name = "start_date", nullable = false)
    public LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    public LocalDate endDate;

    @Column(name = "term_months")
    public Integer termMonths = 12;

    @Column(name = "auto_renewal")
    public Boolean autoRenewal = true;

    @Column(name = "notice_period_days")
    public Integer noticePeriodDays = 60;

    @Column(name = "currency", length = 8)
    public String currency = "USD";

    @Column(name = "mrc_total", precision = 15, scale = 2)
    public BigDecimal mrcTotal = BigDecimal.ZERO;

    @Column(name = "nrc_total", precision = 15, scale = 2)
    public BigDecimal nrcTotal = BigDecimal.ZERO;

    @Column(name = "status", length = 32)
    public String status = "ACTIVE";

    @Column(name = "document_url", length = 255)
    public String documentUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    public OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    public OffsetDateTime updatedAt;
}
