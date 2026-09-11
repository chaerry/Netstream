package id.co.netstream.inventory.domain.entity;

import id.co.netstream.inventory.domain.enums.ServiceStatus;
import id.co.netstream.inventory.domain.enums.ServiceType;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "inv_services", schema = "inventory")
public class NetworkServiceEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    @NotBlank(message = "Service code is required")
    @Column(name = "service_code", nullable = false, unique = true, length = 64)
    public String serviceCode;

    @NotBlank(message = "Customer name is required")
    @Column(name = "customer_name", nullable = false, length = 255)
    public String customerName;

    @NotNull(message = "Service type must be specified")
    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false)
    public ServiceType serviceType;

    @NotNull
    @Positive
    @Column(name = "bandwidth_mbps", nullable = false)
    public Integer bandwidthMbps;

    @Column(name = "sla_tier", nullable = false, length = 32)
    public String slaTier = "STANDARD";

    @DecimalMin("90.00")
    @DecimalMax("100.00")
    @Column(name = "sla_availability_pct", precision = 5, scale = 2)
    public BigDecimal slaAvailabilityPct = new BigDecimal("99.90");

    @DecimalMin("0.00")
    @Column(name = "monthly_recurring_cost", precision = 12, scale = 2)
    public BigDecimal monthlyRecurringCost = BigDecimal.ZERO;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    public ServiceStatus status = ServiceStatus.PLANNED;

    @NotNull(message = "A-End Location ID is required")
    @Column(name = "a_end_location_id", nullable = false)
    public UUID aEndLocationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "a_end_location_id", insertable = false, updatable = false)
    public LocationEntity aEndLocation;

    @NotNull(message = "Z-End Location ID is required")
    @Column(name = "z_end_location_id", nullable = false)
    public UUID zEndLocationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "z_end_location_id", insertable = false, updatable = false)
    public LocationEntity zEndLocation;

    @Column(name = "activation_date")
    public OffsetDateTime activationDate;

    @Column(name = "termination_date")
    public OffsetDateTime terminationDate;

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @jakarta.persistence.OrderBy("hopOrder ASC")
    public List<ServiceResourceMappingEntity> resourceMappings = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    @Column(name = "created_by", nullable = false, length = 128)
    public String createdBy = "system";

    @Column(name = "updated_by", nullable = false, length = 128)
    public String updatedBy = "system";

    public void addMapping(ServiceResourceMappingEntity mapping) {
        resourceMappings.add(mapping);
        mapping.service = this;
    }
}
