package id.co.netstream.integration.repository;

import id.co.netstream.integration.domain.entity.IntegrationAlarmEntity;
import id.co.netstream.integration.domain.enums.AlarmLifecycleStatus;
import id.co.netstream.integration.domain.enums.AlarmSeverity;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class IntegrationAlarmRepository implements PanacheRepository<IntegrationAlarmEntity> {
    public Optional<IntegrationAlarmEntity> findByIdentifier(String identifier) {
        return find("alarmIdentifier", identifier).firstResultOptional();
    }

    public List<IntegrationAlarmEntity> findActiveAlarms() {
        return list("lifecycleStatus != ?1 order by severity asc, raisedAt desc", AlarmLifecycleStatus.RESOLVED);
    }

    public List<IntegrationAlarmEntity> findBySeverity(AlarmSeverity severity) {
        return list("severity = ?1 order by raisedAt desc", severity);
    }

    public List<IntegrationAlarmEntity> findByDeviceId(Long deviceId) {
        return list("deviceId = ?1 order by raisedAt desc", deviceId);
    }
}
