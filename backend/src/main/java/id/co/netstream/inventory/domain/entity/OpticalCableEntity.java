package id.co.netstream.inventory.domain.entity;

import id.co.netstream.inventory.domain.enums.CableType;
import id.co.netstream.inventory.domain.enums.FiberGrade;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "inv_optical_cables", schema = "inventory")
public class OpticalCableEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @NotNull
    @Column(name = "cable_code", nullable = false, unique = true, length = 64)
    public String cableCode;

    @NotNull
    @Column(name = "cable_name", nullable = false, length = 255)
    public String cableName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "cable_type", nullable = false, length = 64)
    public CableType cableType = CableType.FEEDER_CABLE;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "fiber_grade", nullable = false, length = 64)
    public FiberGrade fiberGrade = FiberGrade.SINGLE_MODE_G652D;

    @NotNull
    @Column(name = "total_cores", nullable = false)
    public Integer totalCores = 48;

    @Column(name = "length_meters", precision = 12, scale = 2)
    public BigDecimal lengthMeters = BigDecimal.ZERO;

    @Column(name = "origin_location_id")
    public UUID originLocationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_location_id", insertable = false, updatable = false)
    public LocationEntity originLocation;

    @Column(name = "origin_device_id")
    public UUID originDeviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_device_id", insertable = false, updatable = false)
    public NetworkDeviceEntity originDevice;

    @Column(name = "termination_location_id")
    public UUID terminationLocationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "termination_location_id", insertable = false, updatable = false)
    public LocationEntity terminationLocation;

    @Column(name = "termination_device_id")
    public UUID terminationDeviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "termination_device_id", insertable = false, updatable = false)
    public NetworkDeviceEntity terminationDevice;

    @Column(name = "installation_type", nullable = false, length = 64)
    public String installationType = "UNDERGROUND_DUCT";

    @Column(name = "sheath_type", length = 64)
    public String sheathType = "ARMORED_HDPE";

    @Column(name = "attenuation_db_per_km", precision = 5, scale = 3)
    public BigDecimal attenuationDbPerKm = new BigDecimal("0.350");

    @Column(name = "status", nullable = false, length = 32)
    public String status = "ACTIVE";

    @OneToMany(mappedBy = "cable", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("coreNumber ASC")
    public List<CableStrandEntity> strands = new ArrayList<>();

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
