package id.co.netstream.inventory.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "leased_line_carrier", schema = "inventory")
public class LeasedLineCarrierEntity extends PanacheEntityBase {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    public String id;

    @NotBlank
    @Size(max = 128)
    @Column(name = "name", length = 128, nullable = false)
    public String name;

    @NotBlank
    @Size(max = 32)
    @Column(name = "code", length = 32, nullable = false, unique = true)
    public String code;

    @Column(name = "carrier_type", length = 32)
    public String carrierType = "EXTERNAL_OPERATOR";

    @Column(name = "contact_person", length = 128)
    public String contactPerson;

    @Column(name = "contact_email", length = 128)
    public String contactEmail;

    @Column(name = "contact_phone", length = 64)
    public String contactPhone;

    @Column(name = "portal_url", length = 255)
    public String portalUrl;

    @Column(name = "support_tier", length = 32)
    public String supportTier = "TIER_1_ENTERPRISE";

    @Column(name = "escalation_matrix", columnDefinition = "TEXT")
    public String escalationMatrix;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    public OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    public OffsetDateTime updatedAt;
}
