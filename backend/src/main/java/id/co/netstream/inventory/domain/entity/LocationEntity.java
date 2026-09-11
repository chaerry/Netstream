package id.co.netstream.inventory.domain.entity;

import id.co.netstream.inventory.domain.enums.LocationStatus;
import id.co.netstream.inventory.domain.enums.LocationType;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "inv_locations", schema = "inventory")
public class LocationEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    @Column(name = "parent_id")
    public UUID parentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    public LocationEntity parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public List<LocationEntity> children = new ArrayList<>();

    @NotBlank(message = "Location code is mandatory")
    @Size(max = 64)
    @Column(name = "code", nullable = false, unique = true, length = 64)
    public String code;

    @NotBlank(message = "Location name is mandatory")
    @Size(max = 255)
    @Column(name = "name", nullable = false, length = 255)
    public String name;

    @NotNull(message = "Location type must be specified")
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    public LocationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    public LocationStatus status = LocationStatus.ACTIVE;

    @Column(name = "latitude", precision = 10, scale = 8)
    public BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    public BigDecimal longitude;

    @Column(name = "address", columnDefinition = "TEXT")
    public String address;

    @Column(name = "contact_person", length = 128)
    public String contactPerson;

    @Column(name = "contact_phone", length = 64)
    public String contactPhone;

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
