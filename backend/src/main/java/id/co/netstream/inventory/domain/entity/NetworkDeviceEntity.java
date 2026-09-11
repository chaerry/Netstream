package id.co.netstream.inventory.domain.entity;

import id.co.netstream.inventory.domain.enums.OperationalStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "inv_network_devices", schema = "inventory")
public class NetworkDeviceEntity extends PanacheEntityBase {

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

    @Column(name = "rack_id")
    public UUID rackId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rack_id", insertable = false, updatable = false)
    public RackEntity rack;

    @NotBlank(message = "Hostname is mandatory")
    @Size(max = 128)
    @Column(name = "hostname", nullable = false, unique = true, length = 128)
    public String hostname;

    @NotBlank(message = "Serial number is mandatory")
    @Size(max = 128)
    @Column(name = "serial_number", nullable = false, unique = true, length = 128)
    public String serialNumber;

    @Size(max = 128)
    @Column(name = "asset_tag", unique = true, length = 128)
    public String assetTag;

    @NotBlank(message = "Device type must be specified")
    @Size(max = 32)
    @Column(name = "device_type", nullable = false, length = 32)
    public String deviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_type", insertable = false, updatable = false)
    public DeviceTypeEntity typeInfo;

    @NotBlank(message = "Vendor is required")
    @Column(name = "vendor", nullable = false, length = 64)
    public String vendor;

    @NotBlank(message = "Model is required")
    @Column(name = "model", nullable = false, length = 128)
    public String model;

    @Column(name = "hardware_version", length = 64)
    public String hardwareVersion;

    @Column(name = "firmware_version", length = 64)
    public String firmwareVersion;

    @Min(1)
    @Column(name = "rack_unit_start")
    public Integer rackUnitStart;

    @Min(1)
    @Column(name = "rack_unit_height")
    public Integer rackUnitHeight = 1;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    public OperationalStatus status = OperationalStatus.PLANNED;

    @Column(name = "management_ip", length = 64)
    public String managementIp;

    @PositiveOrZero
    @Column(name = "total_ports")
    public Integer totalPorts = 0;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "cost_usd", precision = 12, scale = 2)
    public BigDecimal costUsd = BigDecimal.ZERO;

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<DevicePortEntity> ports = new ArrayList<>();

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

    public void addPort(DevicePortEntity port) {
        ports.add(port);
        port.device = this;
    }
}
