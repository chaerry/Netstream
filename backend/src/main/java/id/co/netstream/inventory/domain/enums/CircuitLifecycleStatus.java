package id.co.netstream.inventory.domain.enums;

public enum CircuitLifecycleStatus {
    PLANNING,
    PROVISIONING,
    ACTIVE,
    SUSPENDED,
    DORMANT,                // Identified by OpEx Engine: zero traffic / orphaned
    PENDING_DECOMMISSION,   // Sent to Gaharu BPMN Ngin for carrier cancellation
    TERMINATED
}
