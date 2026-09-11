package id.co.netstream.inventory.domain.entity;

import id.co.netstream.inventory.domain.enums.PortMedium;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "inv_device_ports", schema = "inventory", uniqueConstraints = {
    @UniqueConstraint(name = "uq_device_port_name", columnNames = {"device_id", "port_name"})
})
public class DevicePortEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "device_id", nullable = false)
    public NetworkDeviceEntity device;

    @NotBlank(message = "Port name is mandatory")
    @Column(name = "port_name", nullable = false, length = 64)
    public String portName;

    @NotNull
    @Column(name = "port_speed_mbps", nullable = false)
    public Integer portSpeedMbps = 1000;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "medium_type", nullable = false)
    public PortMedium mediumType = PortMedium.COPPER_RJ45;

    @Column(name = "connector_type", length = 32)
    public String connectorType = "LC/UPC";

    @Column(name = "mac_address", length = 32)
    public String macAddress;

    @Column(name = "is_operational", nullable = false)
    public Boolean isOperational = false;

    @Column(name = "is_allocated", nullable = false)
    public Boolean isAllocated = false;

    @Column(name = "connected_port_id")
    public UUID connectedPortId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    public OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;
}
