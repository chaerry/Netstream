package id.co.netstream.inventory.domain.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "inv_service_resource_mappings", schema = "inventory")
public class ServiceResourceMappingEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    public NetworkServiceEntity service;

    @Column(name = "device_id")
    public UUID deviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", insertable = false, updatable = false)
    public NetworkDeviceEntity device;

    @Column(name = "port_id")
    public UUID portId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "port_id", insertable = false, updatable = false)
    public DevicePortEntity port;

    @Column(name = "vne_id")
    public UUID vneId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vne_id", insertable = false, updatable = false)
    public VirtualNetworkElementEntity vne;

    @Column(name = "resource_role", nullable = false, length = 64)
    public String resourceRole;

    @NotNull
    @Column(name = "hop_order", nullable = false)
    public Integer hopOrder = 1;

    @NotNull
    @Column(name = "allocated_bandwidth_mbps", nullable = false)
    public Integer allocatedBandwidthMbps;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public OffsetDateTime createdAt;
}
