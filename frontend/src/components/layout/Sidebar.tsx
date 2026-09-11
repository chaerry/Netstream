import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Server,
  Cable,
  Layers,
  MapPin,
  GitBranch,
  Network,
  Phone,
  BarChart3,
  AlertTriangle,
  Radio,
  Cpu,
  Route,
  Calculator,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Boxes,
  Radar,
  FileSpreadsheet
} from 'lucide-react';

interface SubMenu {
  id: string;
  name: string;
  tabKey: string;
  icon: React.ReactNode;
}

interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon: React.ReactNode;
  isImplemented: boolean;
  badge?: string;
  subMenus?: SubMenu[];
}

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'physical',
  setActiveTab,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const location = useLocation();
  const isInventoryRoute = location.pathname.startsWith('/inventory');
  const isIpamRoute = location.pathname.startsWith('/ipam');
  const currentIpamTab = new URLSearchParams(location.search).get('tab') || 'subnets';

  const menuItems: MenuItem[] = [
    {
      id: 'inventory',
      name: 'Inventory Module',
      path: '/inventory',
      icon: <Server className="w-5 h-5 text-cyan-400" />,
      isImplemented: true,
      badge: 'PROD',
      subMenus: [
        { id: 'physical', name: 'Physical Hardware & Racks', tabKey: 'physical', icon: <Server className="w-4 h-4" /> },
        { id: 'cables', name: 'Optical Cables & Cores', tabKey: 'cables', icon: <Cable className="w-4 h-4" /> },
        { id: 'logical', name: 'Logical & Virtual (VNE)', tabKey: 'logical', icon: <Cpu className="w-4 h-4" /> },
        { id: 'services', name: 'Services & Resource Map', tabKey: 'services', icon: <Route className="w-4 h-4" /> },
        { id: 'planning', name: 'Planning & Cost Engine', tabKey: 'planning', icon: <Calculator className="w-4 h-4" /> },
        { id: 'locations', name: 'Location Digital Twin', tabKey: 'locations', icon: <Building2 className="w-4 h-4" /> },
      ]
    },
    {
      id: 'gis',
      name: 'GIS Module',
      path: '/gis',
      icon: <MapPin className="w-5 h-5 text-emerald-400" />,
      isImplemented: true,
      badge: 'PROD',
    },
    {
      id: 'leased-line',
      name: 'Leased Line Module',
      path: '/placeholder/leased-line',
      icon: <GitBranch className="w-5 h-5 text-purple-400" />,
      isImplemented: false,
      badge: 'Placeholder',
    },
    {
      id: 'ipam',
      name: 'IP Management',
      path: '/ipam',
      icon: <Network className="w-5 h-5 text-amber-400" />,
      isImplemented: true,
      badge: 'PROD',
      subMenus: [
        { id: 'ipam-subnets', name: 'Subnets & Hierarchy', tabKey: 'subnets', icon: <Network className="w-4 h-4" /> },
        { id: 'ipam-addresses', name: 'IP Address Register', tabKey: 'addresses', icon: <Boxes className="w-4 h-4" /> },
        { id: 'ipam-vrfs', name: 'VRF Routing Domains', tabKey: 'vrfs', icon: <Layers className="w-4 h-4" /> },
        { id: 'ipam-discovery', name: 'Network Discovery', tabKey: 'discovery', icon: <Radar className="w-4 h-4" /> },
        { id: 'ipam-bulkloader', name: 'Bulkloader Spreadsheet', tabKey: 'bulkloader', icon: <FileSpreadsheet className="w-4 h-4" /> },
      ]
    },
    {
      id: 'telephony',
      name: 'Telephone Number',
      path: '/telephony',
      icon: <Phone className="w-5 h-5 text-rose-400" />,
      isImplemented: true,
      badge: 'PROD',
    },
    {
      id: 'integration',
      name: 'Integration Module',
      path: '/placeholder/integration',
      icon: <Layers className="w-5 h-5 text-blue-400" />,
      isImplemented: false,
      badge: 'Placeholder',
    },
    {
      id: 'reporting',
      name: 'Reporting & Dashboard',
      path: '/placeholder/reporting',
      icon: <BarChart3 className="w-5 h-5 text-indigo-400" />,
      isImplemented: false,
      badge: 'Placeholder',
    },
    {
      id: 'impact',
      name: 'Impact Analysis',
      path: '/placeholder/impact',
      icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      isImplemented: false,
      badge: 'Placeholder',
    },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen bg-[#0d131f] text-slate-300 flex flex-col border-r border-slate-800/80 shadow-2xl shrink-0 z-40 transition-all duration-300 ease-in-out select-none relative ${isCollapsed ? 'w-20' : 'w-72'
        }`}
    >
      {/* Floating Edge Toggle Button at the sidebar border */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand sidebar (show labels)" : "Collapse sidebar (icons only)"}
          aria-label={isCollapsed ? "Expand navigation sidebar" : "Collapse navigation sidebar"}
          className="absolute -right-3 top-6 z-50 w-6 h-6 rounded-full bg-[#0d131f] border border-slate-700/90 text-slate-400 hover:text-cyan-300 hover:border-cyan-400 flex items-center justify-center shadow-lg shadow-black/60 transition-all hover:scale-110 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          )}
        </button>
      )}

      {/* Brand Header with Integrated Toggle */}
      <div className={`border-b border-slate-800/80 flex items-center transition-all ${isCollapsed ? 'p-3 justify-center flex-col gap-2' : 'p-4 justify-between'}`}>
        <Link to="/inventory" className={`flex items-center gap-3 group min-w-0 ${isCollapsed ? 'justify-center' : 'flex-1'}`} title="Netstream Telecom Inventory">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30 shrink-0 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 overflow-hidden">
              <h1 className="font-extrabold text-base tracking-wide text-white flex items-center gap-1.5 truncate">
                <span>netstre@m</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono border border-cyan-500/30">
                  S2C
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-mono truncate">Telecom Inventory Suite</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation List - Independent Smooth Scrolling Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 custom-scrollbar">
        <div>
          {!isCollapsed && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
              Telecom OSS Modules
            </p>
          )}

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.id === 'inventory' && isInventoryRoute);

              return (
                <div key={item.id} className="space-y-1 group relative">
                  <Link
                    to={item.path}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center rounded-xl text-xs font-semibold transition-all duration-150 ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                      } ${isActive
                        ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                        : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <span className="shrink-0 flex items-center justify-center">{item.icon}</span>
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${item.badge === 'PROD'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border border-slate-700/60'
                              }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.subMenus && (
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${(item.id === 'inventory' && isInventoryRoute) || (item.id === 'ipam' && isIpamRoute) ? 'rotate-180' : ''
                              }`}
                          />
                        )}
                      </div>
                    )}
                  </Link>

                  {/* Collapsed Hover Floating Tooltip */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-xl bg-slate-900/95 text-slate-200 text-xs font-semibold border border-slate-800 shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${item.badge === 'PROD'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Sub-menu items for Inventory Module */}
                  {item.id === 'inventory' && isInventoryRoute && item.subMenus && !isCollapsed && (
                    <div className="pl-3 pr-1 py-1 space-y-0.5 border-l border-slate-800/80 ml-5 my-1">
                      {item.subMenus.map((sub) => {
                        const isSubActive = activeTab === sub.tabKey;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => setActiveTab && setActiveTab(sub.tabKey)}
                            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSubActive
                              ? 'bg-cyan-500/15 text-cyan-300 font-semibold shadow-sm border border-cyan-500/20'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                              }`}
                          >
                            <span className={`shrink-0 ${isSubActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                              {sub.icon}
                            </span>
                            <span className="truncate">{sub.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Sub-menu items for IPAM Module */}
                  {item.id === 'ipam' && isIpamRoute && item.subMenus && !isCollapsed && (
                    <div className="pl-3 pr-1 py-1 space-y-0.5 border-l border-slate-800/80 ml-5 my-1">
                      {item.subMenus.map((sub) => {
                        const isSubActive = currentIpamTab === sub.tabKey;
                        return (
                          <Link
                            key={sub.id}
                            to={`/ipam?tab=${sub.tabKey}`}
                            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSubActive
                              ? 'bg-amber-500/15 text-amber-300 font-semibold shadow-sm border border-amber-500/20'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                              }`}
                          >
                            <span className={`shrink-0 ${isSubActive ? 'text-amber-400' : 'text-slate-500'}`}>
                              {sub.icon}
                            </span>
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info & Expand Shortcut */}
      <div className="p-3 border-t border-slate-800/80 text-center">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-500 text-center">
            <p className="font-mono text-cyan-400 font-bold text-[10px]">VC4 S2C Model</p>
            <p className="text-[9px] text-slate-400">Production v1.0</p>
          </div>
        ) : onToggleCollapse ? (
          <button
            onClick={onToggleCollapse}
            title="Click to expand sidebar"
            className="w-full p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-[10px] text-cyan-400 font-mono font-bold flex items-center justify-center transition-all group"
          >
            <span>S2C</span>
          </button>
        ) : (
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] text-cyan-400 font-mono font-bold flex items-center justify-center">
            S2C
          </div>
        )}
      </div>
    </aside>
  );
};
