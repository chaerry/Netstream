package id.co.netstream.integration.domain.enums;

public enum ReconciliationStatus {
    PENDING_REVIEW,
    AUTO_RESOLVED,
    MANUALLY_SYNCED,
    REJECTED_ROGUE,
    ESCALATED_BPMN
}
