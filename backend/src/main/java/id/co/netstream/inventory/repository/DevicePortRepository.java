package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.DevicePortEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class DevicePortRepository implements PanacheRepositoryBase<DevicePortEntity, UUID> {

    public List<DevicePortEntity> findByDeviceId(UUID deviceId) {
        return list("device.id = ?1 order by portName asc", deviceId);
    }

    public Optional<DevicePortEntity> findByDeviceAndPortName(UUID deviceId, String portName) {
        return find("device.id = ?1 and portName = ?2", deviceId, portName).firstResultOptional();
    }

    public List<DevicePortEntity> findAvailablePorts(UUID deviceId) {
        return list("device.id = ?1 and isAllocated = false and isOperational = true order by portName asc", deviceId);
    }
}
