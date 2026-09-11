package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.NetworkDeviceEntity;
import id.co.netstream.inventory.domain.enums.OperationalStatus;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class NetworkDeviceRepository implements PanacheRepositoryBase<NetworkDeviceEntity, UUID> {

    public Optional<NetworkDeviceEntity> findByHostname(String hostname) {
        return find("hostname", hostname).firstResultOptional();
    }

    public Optional<NetworkDeviceEntity> findBySerialNumber(String serialNumber) {
        return find("serialNumber", serialNumber).firstResultOptional();
    }

    public List<NetworkDeviceEntity> findByRackId(UUID rackId) {
        return list("rackId = ?1 order by rackUnitStart asc", rackId);
    }

    public PanacheQuery<NetworkDeviceEntity> searchDevices(
            String query,
            String type,
            OperationalStatus status,
            UUID locationId,
            int pageIndex,
            int pageSize
    ) {
        StringBuilder hql = new StringBuilder("1=1");
        Map<String, Object> params = new HashMap<>();

        if (query != null && !query.trim().isEmpty()) {
            String cleanQuery = query.trim().replaceAll("\\s+", " ").toLowerCase();
            hql.append(" and (lower(hostname) like :query or lower(serialNumber) like :query or lower(model) like :query or lower(vendor) like :query or lower(coalesce(managementIp, '')) like :query or lower(coalesce(assetTag, '')) like :query)");
            params.put("query", "%" + cleanQuery + "%");
        }
        if (type != null && !type.trim().isEmpty()) {
            hql.append(" and deviceType = :type");
            params.put("type", type.trim());
        }
        if (status != null) {
            hql.append(" and status = :status");
            params.put("status", status);
        }
        if (locationId != null) {
            hql.append(" and locationId = :locationId");
            params.put("locationId", locationId);
        }

        hql.append(" order by hostname asc");

        return find(hql.toString(), params).page(Page.of(pageIndex, pageSize));
    }
}
