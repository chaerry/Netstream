import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  GitBranch,
  Network,
  Phone,
  Layers,
  BarChart3,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface ModuleDetails {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  features: string[];
}

const moduleDirectory: Record<string, ModuleDetails> = {
  gis: {
    title: 'GIS Telecom Mapping Module',
    subtitle: 'Outside Plant (OSP), Fiber Cables, Trenches & Manholes',
    description: 'Integrated GIS mapping combining logical and physical inventory with geodatabase layers (Google, OpenStreetMap, ESRI).',
    icon: <MapPin className="w-8 h-8 text-emerald-400" />,
    accent: 'emerald',
    features: [
      'Interactive geo-map with trench, duct, and fiber cable visualization',
      'Manhole and splice box spatial coordinate drilldown',
      'Automated Bill of Materials (BOM) for planned civil routes',
      'Real-time path measurement and elevation calculations',
    ]
  },
  'leased-line': {
    title: 'Leased Line Management Module',
    subtitle: 'Third-Party Leased Capacity & Commercial Register',
    description: 'Consolidated commercial registry and contract auditing for leased transmission circuits from partner operators.',
    icon: <GitBranch className="w-8 h-8 text-purple-400" />,
    accent: 'purple',
    features: [
      'Single consolidated register of partner operator leased lines',
      'Automated invoice reconciliation and SLA penalty auditing',
      'Elimination of redundant circuits and dark fiber cost optimization',
      'Direct mapping into core network inventory topology',
    ]
  },
  ipam: {
    title: 'IP Address Management (IPAM)',
    subtitle: 'IPv4 & IPv6 Subnetting, Ranges & Live Auto-Discovery',
    description: 'Comprehensive registration and discovery of all IP address blocks, VRF domains, and interface assignments.',
    icon: <Network className="w-8 h-8 text-amber-400" />,
    accent: 'amber',
    features: [
      'Hierarchical IPv4 / IPv6 range and subnet allocation tree',
      'Automated subnet conflict detection and IP pool reservations',
      'Bulkloader spreadsheet upload and network sync',
      'Interface and customer service IP binding audits',
    ]
  },
  telephony: {
    title: 'Telephone Number Module',
    subtitle: 'E.164, Geographic, Non-Geo & MSISDN Number Inventory',
    description: 'Management and regulatory tracking of national telephone number plans and number porting registries.',
    icon: <Phone className="w-8 h-8 text-rose-400" />,
    accent: 'rose',
    features: [
      'Support for international E.164 and local numbering plans',
      'Number porting lifecycle tracking (Inward/Outward)',
      'Freephone, premium, and private PBX block allocations',
      'Automated discovery from live Softswitch & IMS core elements',
    ]
  },
  integration: {
    title: 'Integration Module',
    subtitle: 'NMS/EMS Auto-Reconciliation & Northbound BSS/OSS REST APIs',
    description: 'Eliminates data silos by connecting multi-vendor EMS systems with northbound billing and alarm correlation feeds.',
    icon: <Layers className="w-8 h-8 text-blue-400" />,
    accent: 'blue',
    features: [
      'Multi-vendor mediation (SNMP, Netconf, TL1, RESTful APIs, TMF)',
      'Scheduled automated inventory auto-reconciliation',
      'Northbound REST APIs for CRM, Billing, and Trouble Ticketing',
      'Enriched alarm and event stream correlation',
    ]
  },
  reporting: {
    title: 'Reporting & Dashboard Module',
    subtitle: 'Executive Business Intelligence & Custom Report Builder',
    description: 'Interactive analytics, capacity utilization dashboards, and automated scheduled distribution.',
    icon: <BarChart3 className="w-8 h-8 text-indigo-400" />,
    accent: 'indigo',
    features: [
      'Custom report template builder with drag-and-drop data sources',
      'Multi-layer KPI dashboard widgets (Physical, Virtual, Services)',
      'Automated scheduled report distribution (PDF, Excel, CSV)',
      'Role-based reporting visibility rights management',
    ]
  },
  impact: {
    title: 'Impact Analysis Module',
    subtitle: 'Fault Impact Isolation & Single Point of Failure (SPOF) Detection',
    description: 'Detects and alerts customer service disruptions from planned maintenance and unexpected fiber outages.',
    icon: <AlertTriangle className="w-8 h-8 text-orange-400" />,
    accent: 'orange',
    features: [
      'Single Point of Failure (SPOF) topology risk mitigation',
      'Real-time customer service outage impact blast radius detection',
      'Automated customer notification engine with SLA tracking',
      'Planned maintenance scheduling with risk impact simulation',
    ]
  },
};

export const PlaceholderModulePage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const moduleInfo = moduleDirectory[moduleId || ''] || {
    title: 'Module Under Construction',
    subtitle: 'Future Telecom Capability',
    description: 'This module is scheduled for implementation in upcoming phases.',
    icon: <Sparkles className="w-8 h-8 text-cyan-400" />,
    accent: 'cyan',
    features: ['Specification active in proposal document']
  };

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-8">
      {/* Blueprint Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden shadow-2xl space-y-6">
        <div className="flex items-start justify-between">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            {moduleInfo.icon}
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Architecture Blueprint Ready</span>
          </span>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {moduleInfo.title}
          </h1>
          <h2 className="text-sm font-semibold text-cyan-400 mt-1">
            {moduleInfo.subtitle}
          </h2>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed max-w-2xl">
            {moduleInfo.description}
          </p>
        </div>

        {/* Feature Highlights from Proposal */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Planned Technical Scope & Capabilities:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {moduleInfo.features.map((feat, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <Link
            to="/inventory"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-xl hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Inventory Module</span>
          </Link>
          <span className="text-xs text-slate-500 font-mono">Netstre@m S2C v1.0</span>
        </div>
      </div>
    </div>
  );
};
