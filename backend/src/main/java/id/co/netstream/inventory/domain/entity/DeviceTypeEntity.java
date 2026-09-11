package id.co.netstream.inventory.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "inv_device_types", schema = "inventory")
public class DeviceTypeEntity extends PanacheEntityBase {

    @Id
    @NotBlank
    @Size(max = 32)
    @Column(name = "code", nullable = false, unique = true, length = 32)
    public String code;

    @NotBlank
    @Size(max = 128)
    @Column(name = "name", nullable = false, length = 128)
    public String name;

    @Size(max = 64)
    @Column(name = "category", length = 64)
    public String category;

    @Column(name = "description", columnDefinition = "TEXT")
    public String description;

    @Column(name = "is_active", nullable = false)
    public Boolean isActive = true;

    @Column(name = "display_order")
    public Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public OffsetDateTime createdAt;
}
