import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { PhysicalInventoryView } from '../components/inventory/PhysicalInventoryView';
import { OpticalCablesView } from '../components/inventory/OpticalCablesView';
import { LogicalInventoryView } from '../components/inventory/LogicalInventoryView';
import { ServiceInventoryView } from '../components/inventory/ServiceInventoryView';
import { PlanningCostView } from '../components/inventory/PlanningCostView';
import { LocationHierarchyView } from '../components/inventory/LocationHierarchyView';
import { Server, Cable, Cpu, Route, Calculator, Building2 } from 'lucide-react';

interface LayoutContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const InventoryModulePage: React.FC = () => {
  const context = useOutletContext<LayoutContextType>();
  const activeTab = context?.activeTab || 'physical';
  const setActiveTab = context?.setActiveTab || (() => {});

  const tabs = [
    { id: 'physical', label: 'Physical Equipment & 42U Racks', icon: <Server className="w-4 h-4" /> },
    { id: 'cables', label: 'Optical Cables & Cores', icon: <Cable className="w-4 h-4" /> },
    { id: 'logical', label: 'Logical & Virtual (VNE)', icon: <Cpu className="w-4 h-4" /> },
    { id: 'services', label: 'Service Inventory & Topology', icon: <Route className="w-4 h-4" /> },
    { id: 'planning', label: 'Planning & Network Cost', icon: <Calculator className="w-4 h-4" /> },
    { id: 'locations', label: 'Location Digital Twin', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                PROD MODULE
              </span>
              <span className="text-xs text-slate-400 font-mono">VC4 S2C Standard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Network Inventory Management System
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Captures active & passive physical equipment, outside-plant (OSP) optical cables and core strands, logical VLANs/VRFs, NFV elements, and end-to-end services.
            </p>
          </div>
        </div>

        {/* Sub-module Navigation Pills */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'glass-card text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Render Active Sub-Module View */}
      {activeTab === 'physical' && <PhysicalInventoryView />}
      {activeTab === 'cables' && <OpticalCablesView />}
      {activeTab === 'logical' && <LogicalInventoryView />}
      {activeTab === 'services' && <ServiceInventoryView />}
      {activeTab === 'planning' && <PlanningCostView />}
      {activeTab === 'locations' && <LocationHierarchyView />}
    </div>
  );
};

