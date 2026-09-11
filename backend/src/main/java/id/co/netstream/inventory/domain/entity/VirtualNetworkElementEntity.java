package id.co.netstream.inventory.domain.entity;

import id.co.netstream.inventory.domain.enums.OperationalStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "inv_virtual_network_elements", schema = "inventory")
public class VirtualNetworkElementEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    @Column(name = "hypervisor_device_id")
    public UUID hypervisorDeviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hypervisor_device_id", insertable = false, updatable = false)
    public NetworkDeviceEntity hypervisorDevice;

    @NotBlank(message = "VNE name is required")
    @Column(name = "vne_name", nullable = false, unique = true, length = 128)
    public String vneName;

    @NotBlank(message = "VNF type is required (e.g. vRouter, vFirewall)")
    @Column(name = "vnf_type", nullable = false, length = 64)
    public String vnfType;

    @Min(1)
    @Max(4094)
    @Column(name = "vlan_id")
    public Integer vlanId;

    @Column(name = "vrf_name", length = 64)
    public String vrfName;

    @NotNull
    @Column(name = "allocated_vcpu", nullable = false)
    public Integer allocatedVcpu = 2;

    @NotNull
    @Column(name = "allocated_ram_gb", nullable = false)
    public Integer allocatedRamGb = 4;

    @NotNull
    @Column(name = "allocated_disk_gb", nullable = false)
    public Integer allocatedDiskGb = 50;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    public OperationalStatus status = OperationalStatus.PLANNED;

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
