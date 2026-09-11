package id.co.netstream.inventory.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "inv_racks", schema = "inventory", uniqueConstraints = {
    @UniqueConstraint(name = "uq_location_rack", columnNames = {"location_id", "rack_number"})
})
public class RackEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    @NotNull(message = "Location ID cannot be null")
    @Column(name = "location_id", nullable = false)
    public UUID locationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", insertable = false, updatable = false)
    public LocationEntity location;

    @NotBlank(message = "Rack number is mandatory")
    @Column(name = "rack_number", nullable = false, length = 64)
    public String rackNumber;

    @NotNull
    @Column(name = "height_units", nullable = false)
    public Integer heightUnits = 42;

    @Column(name = "max_power_watt", precision = 10, scale = 2)
    public BigDecimal maxPowerWatt = new BigDecimal("5000.00");

    @Column(name = "current_power_watt", precision = 10, scale = 2)
    public BigDecimal currentPowerWatt = BigDecimal.ZERO;

    @Column(name = "max_weight_kg", precision = 10, scale = 2)
    public BigDecimal maxWeightKg = new BigDecimal("800.00");

    @Column(name = "status", nullable = false, length = 32)
    public String status = "ACTIVE";

    @OneToMany(mappedBy = "rack", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public List<NetworkDeviceEntity> devices = new ArrayList<>();

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
}
