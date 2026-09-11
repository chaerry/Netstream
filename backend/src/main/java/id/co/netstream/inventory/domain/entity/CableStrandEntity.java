package id.co.netstream.inventory.domain.entity;

import id.co.netstream.inventory.domain.enums.StrandStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "inv_cable_strands", schema = "inventory")
public class CableStrandEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cable_id", nullable = false)
    public OpticalCableEntity cable;

    @NotNull
    @Column(name = "core_number", nullable = false)
    public Integer coreNumber;

    @Column(name = "tube_number", nullable = false)
    public Integer tubeNumber = 1;

    @NotNull
    @Column(name = "color_name", nullable = false, length = 32)
    public String colorName;

    @NotNull
    @Column(name = "color_hex", nullable = false, length = 16)
    public String colorHex;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    public StrandStatus status = StrandStatus.AVAILABLE;

    @Column(name = "allocated_service_id")
    public UUID allocatedServiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocated_service_id", insertable = false, updatable = false)
    public NetworkServiceEntity allocatedService;

    @Column(name = "allocated_service_hop")
    public Integer allocatedServiceHop;

    @Column(name = "measured_loss_db", precision = 5, scale = 2)
    public BigDecimal measuredLossDb;

    @Column(name = "remarks", length = 255)
    public String remarks;

    @UpdateTimestamp
    @Column(name = "updated_at")
    public OffsetDateTime updatedAt;
}
