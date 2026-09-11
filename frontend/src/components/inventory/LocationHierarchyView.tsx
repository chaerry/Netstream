import React, { useState, useEffect, useCallback } from 'react';
import { LocationNode, Rack, LocationStatus } from '../../types/inventory';
import { inventoryApi } from '../../api/inventoryApi';
import { useAuth } from '../../auth/AuthContext';
import { CreateLocationModal } from './CreateLocationModal';
import { EditLocationModal } from './EditLocationModal';
import { CreateRackModal } from './CreateRackModal';
import { 
  Building2, 
  MapPin, 
  ChevronRight, 
  ChevronDown, 
  Server, 
  Layers, 
  Globe, 
  Plus, 
  RefreshCw,
  Edit3,
  Activity,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  XCircle,
  Phone,
  User,
  Navigation
} from 'lucide-react';

export const LocationHierarchyView: React.FC = () => {
  const { hasAnyRole } = useAuth();
  const [tree, setTree] = useState<LocationNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<LocationNode | null>(null);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ 'loc-root-id': true, 'loc-cgk-site': true });

  // Modals
  const [showAddLocationModal, setShowAddLocationModal] = useState<boolean>(false);
  const [targetParentNode, setTargetParentNode] = useState<LocationNode | null>(null);
  const [editingLocation, setEditingLocation] = useState<LocationNode | null>(null);
  const [showAddRackModal, setShowAddRackModal] = useState<boolean>(false);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const nodes = await inventoryApi.getLocationTree();
      setTree(nodes);
      if (nodes.length > 0) {
        setSelectedNode(prev => prev ? (findNodeById(nodes, prev.id) || nodes[0]) : nodes[0]);
      }
    } catch (e) {
      console.error('Failed to load location tree:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const findNodeById = (nodes: LocationNode[], id: string): LocationNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children && node.children.length > 0) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const handleSelectNode = async (node: LocationNode) => {
    setSelectedNode(node);
    try {
      const rackList = await inventoryApi.getRacksByLocation(node.id);
      setRacks(rackList);
    } catch (e) {
      console.error('Failed to load racks for location:', e);
    }
  };

  useEffect(() => {
    if (selectedNode) {
      inventoryApi.getRacksByLocation(selectedNode.id).then(setRacks).catch(console.error);
    }
  }, [selectedNode]);

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status?: LocationStatus) => {
    switch (status) {
      case 'PLANNED':
        return {
          label: 'PLANNED',
          desc: 'Future PoP (Feasibility Study)',
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
          dot: 'bg-blue-400',
          icon: Clock,
        };
      case 'UNDER_CONSTRUCTION':
        return {
          label: 'UNDER CONSTRUCTION',
          desc: 'Fit-out & Power Staging',
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          icon: Wrench,
        };
      case 'MAINTENANCE':
        return {
          label: 'MAINTENANCE',
          desc: 'Facility Maintenance / Upgrade',
          bg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
          dot: 'bg-purple-400',
          icon: AlertTriangle,
        };
      case 'INACTIVE':
        return {
          label: 'INACTIVE',
          desc: 'Decommissioned / Off-line',
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
          icon: XCircle,
        };
      case 'ACTIVE':
      default:
        return {
          label: 'ACTIVE',
          desc: 'Operational & Live',
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
        };
    }
  };

  const renderTreeNode = (node: LocationNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id];
    const isSelected = selectedNode?.id === node.id;
    const statusCfg = getStatusBadge(node.status);

    return (
      <div key={node.id} className="space-y-1">
        <div
          onClick={() => handleSelectNode(node)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
            isSelected
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-glow-cyan'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="p-0.5 text-slate-400 hover:text-white"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-3.5" />
          )}

          {node.type === 'COUNTRY' ? (
            <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
          ) : node.type === 'SITE' ? (
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : node.type === 'BUILDING' ? (
            <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
          ) : (
            <Layers className="w-4 h-4 text-amber-400 shrink-0" />
          )}

          <span className="truncate">{node.name}</span>

          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {/* Status dot */}
            <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} title={statusCfg.label} />
            <span className="text-[9px] font-mono text-slate-500 uppercase">
              {node.type}
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Tree Explorer */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Digital Twin Hierarchy</span>
          </h3>

          {hasAnyRole(['inventory-admin', 'inventory-operator']) && (
            <button
              onClick={() => {
                setTargetParentNode(null);
                setShowAddLocationModal(true);
              }}
              title="Add New Location Node"
              className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-lg hover:bg-cyan-600 hover:text-white transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Location</span>
            </button>
          )}
        </div>

        <div className="space-y-1 overflow-y-auto max-h-[520px]">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
              Loading Digital Twin Tree...
            </div>
          ) : (
            tree.map((node) => renderTreeNode(node))
          )}
        </div>
      </div>

      {/* Right Node Details & Racks */}
      <div className="md:col-span-2 glass-panel p-6 rounded-2xl space-y-6">
        {selectedNode ? (
          <>
            {/* Header with Badges & Edit Button */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono font-bold border border-cyan-500/20">
                    {selectedNode.type}
                  </span>

                  {/* Status Badge */}
                  {(() => {
                    const st = getStatusBadge(selectedNode.status);
                    const StatusIcon = st.icon;
                    return (
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border flex items-center gap-1 ${st.bg}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{st.label}</span>
                      </span>
                    );
                  })()}
                </div>

                <h3 className="text-xl font-bold text-white mt-1.5">{selectedNode.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Code: {selectedNode.code}</p>
              </div>

              <div className="flex items-center gap-2">
                {hasAnyRole(['inventory-admin', 'inventory-operator']) && (
                  <>
                    <button
                      onClick={() => setEditingLocation(selectedNode)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-xl hover:bg-amber-950 hover:border-amber-400 transition-all"
                      title="Modify Location Name, Status & Properties"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Location</span>
                    </button>

                    <button
                      onClick={() => {
                        setTargetParentNode(selectedNode);
                        setShowAddLocationModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-semibold rounded-xl hover:bg-cyan-950 hover:border-cyan-400 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Child Node</span>
                    </button>
                  </>
                )}

                {selectedNode.latitude && (
                  <div className="text-right text-xs font-mono text-slate-400 pl-3 border-l border-slate-800 hidden sm:block">
                    <p>Lat: {selectedNode.latitude}</p>
                    <p>Lng: {selectedNode.longitude}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400" /> Operational Status
                </span>
                <p className="text-xs font-bold text-white mt-1">
                  {getStatusBadge(selectedNode.status).desc}
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block flex items-center gap-1">
                  <User className="w-3 h-3 text-purple-400" /> Facility Contact
                </span>
                <p className="text-xs font-bold text-white mt-1">
                  {selectedNode.contactPerson || 'NOC Site Manager'}
                </p>
                {selectedNode.contactPhone && (
                  <p className="text-[10px] text-slate-400 font-mono">{selectedNode.contactPhone}</p>
                )}
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block flex items-center gap-1">
                  <Server className="w-3 h-3 text-emerald-400" /> Equipment Racks
                </span>
                <p className="text-xs font-bold text-cyan-300 font-mono mt-1">
                  {racks.length} Racks Provisioned
                </p>
              </div>
            </div>

            {selectedNode.address && (
              <div className="text-xs text-slate-300 space-y-1">
                <span className="text-slate-500 uppercase font-semibold text-[10px] flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-cyan-400" /> Physical Address:
                </span>
                <p className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">{selectedNode.address}</p>
              </div>
            )}

            {/* Racks in this location */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>Installed Equipment Racks in {selectedNode.name}</span>
                </h4>

                {hasAnyRole(['inventory-admin', 'inventory-operator']) && (
                  <button
                    onClick={() => setShowAddRackModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-xl hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Commission Rack</span>
                  </button>
                )}
              </div>

              {racks.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 space-y-2">
                  <Server className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No equipment racks bound to this location yet.</p>
                  {hasAnyRole(['inventory-admin', 'inventory-operator']) && (
                    <button
                      onClick={() => setShowAddRackModal(true)}
                      className="px-3 py-1 text-xs text-cyan-400 hover:underline font-mono"
                    >
                      + Commission a 42U Rack here
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {racks.map((rack) => (
                    <div key={rack.id} className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-xs font-mono">{rack.rackNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                          {rack.status || 'ACTIVE'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Height: {rack.heightUnits}U • Power: {rack.currentPowerWatt || 0}W / {rack.maxPowerWatt || 6000}W
                      </p>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${Math.min(100, ((rack.occupiedUnits || 0) / (rack.heightUnits || 42)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-20 text-center text-slate-500 text-xs">
            Select a location node in the tree to view properties and equipment racks.
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateLocationModal
        isOpen={showAddLocationModal}
        parentNode={targetParentNode}
        allLocations={tree}
        onClose={() => {
          setShowAddLocationModal(false);
          setTargetParentNode(null);
        }}
        onSuccess={() => {
          setShowAddLocationModal(false);
          setTargetParentNode(null);
          fetchTree();
        }}
      />

      <EditLocationModal
        location={editingLocation}
        allLocations={tree}
        onClose={() => setEditingLocation(null)}
        onSuccess={() => {
          setEditingLocation(null);
          fetchTree();
        }}
      />

      <CreateRackModal
        isOpen={showAddRackModal}
        preselectedLocation={selectedNode}
        allLocations={tree}
        onClose={() => setShowAddRackModal(false)}
        onSuccess={async () => {
          setShowAddRackModal(false);
          if (selectedNode) {
            const updated = await inventoryApi.getRacksByLocation(selectedNode.id);
            setRacks(updated);
          }
        }}
      />
    </div>
  );
};

