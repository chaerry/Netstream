package id.co.netstream.inventory.domain.enums;

public enum CircuitTechnology {
    EPL,            // Ethernet Private Line (Port-based dedicated)
    EVPL,           // Ethernet Virtual Private Line (VLAN-tagged)
    DIA,            // Dedicated Internet Access
    DARK_FIBER,     // Unlit fiber strand lease
    DWDM_LAMBDA,    // Dense Wavelength Division Multiplexing optical lambda
    SDH_VC4         // Synchronous Digital Hierarchy / Sonet VC4 circuit
}
