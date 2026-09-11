package id.co.netstream.inventory.repository;

import id.co.netstream.inventory.domain.entity.NetworkServiceEntity;
import id.co.netstream.inventory.domain.enums.ServiceStatus;
import id.co.netstream.inventory.domain.enums.ServiceType;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class NetworkServiceRepository implements PanacheRepositoryBase<NetworkServiceEntity, UUID> {

    public Optional<NetworkServiceEntity> findByServiceCode(String serviceCode) {
        return find("serviceCode", serviceCode).firstResultOptional();
    }

    public List<NetworkServiceEntity> searchServices(String search, ServiceType type, ServiceStatus status) {
        StringBuilder hql = new StringBuilder("1=1");
        Map<String, Object> params = new HashMap<>();

        if (search != null && !search.trim().isEmpty()) {
            hql.append(" and (lower(serviceCode) like :s or lower(customerName) like :s)");
            params.put("s", "%" + search.toLowerCase().trim() + "%");
        }
        if (type != null) {
            hql.append(" and serviceType = :type");
            params.put("type", type);
        }
        if (status != null) {
            hql.append(" and status = :status");
            params.put("status", status);
        }

        hql.append(" order by createdAt desc");
        return find(hql.toString(), params).list();
    }
}
