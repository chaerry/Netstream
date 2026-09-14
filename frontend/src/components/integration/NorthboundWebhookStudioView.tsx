import React, { useState } from 'react';
import {
  Webhook,
  Code2,
  Send,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  Layers,
  Server,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { WebhookSubscription, WebhookLog } from '../../types/integration';
import { integrationApi } from '../../api/integrationApi';

interface NorthboundWebhookStudioViewProps {
  webhooks: WebhookSubscription[];
  webhookLogs: WebhookLog[];
  onOpenCreateModal: () => void;
  isLoading: boolean;
}

export const NorthboundWebhookStudioView: React.FC<NorthboundWebhookStudioViewProps> = ({
  webhooks,
  webhookLogs,
  onOpenCreateModal,
  isLoading,
}) => {
  const [selectedTmfEndpoint, setSelectedTmfEndpoint] = useState<string>('TMF638');
  const [tmfResponseJson, setTmfResponseJson] = useState<string>('');
  const [isQueryingTmf, setIsQueryingTmf] = useState<boolean>(false);

  const handleRunTmfQuery = async (endpoint: string) => {
    setIsQueryingTmf(true);
    try {
      if (endpoint === 'TMF638') {
        const data = await integrationApi.getTmfServices();
        setTmfResponseJson(JSON.stringify(data, null, 2));
      } else if (endpoint === 'TMF639') {
        const data = await integrationApi.getTmfResources();
        setTmfResponseJson(JSON.stringify(data, null, 2));
      } else {
        const alarms = await integrationApi.getAlarms();
        setTmfResponseJson(JSON.stringify(alarms.slice(0, 2), null, 2));
      }
    } catch (e: any) {
      setTmfResponseJson(JSON.stringify({ error: e.message || 'Failed to fetch' }, null, 2));
    } finally {
      setIsQueryingTmf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Webhook className="w-5 h-5 text-emerald-400" />
            Northbound BSS/OSS Open APIs & Webhooks Hub
          </h2>
          <p className="text-sm text-slate-400">
            TM Forum standards-compliant REST endpoints (TMF638, TMF639, TMF642) and HMAC-signed outbound notification webhooks.
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Webhook Subscriber
        </button>
      </div>

      {/* Grid: TMF API Sandbox & Webhook Subscribers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: TM Forum Open API Sandbox */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">TM Forum Northbound Sandbox</h3>
              </div>
              <span className="text-[11px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-mono">
                Open API v4.0
              </span>
            </div>

            {/* Endpoint Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => {
                  setSelectedTmfEndpoint('TMF638');
                  handleRunTmfQuery('TMF638');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-left ${
                  selectedTmfEndpoint === 'TMF638'
                    ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="font-bold">TMF638</div>
                <div className="text-[10px] opacity-80">Service Inventory</div>
              </button>

              <button
                onClick={() => {
                  setSelectedTmfEndpoint('TMF639');
                  handleRunTmfQuery('TMF639');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-left ${
                  selectedTmfEndpoint === 'TMF639'
                    ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="font-bold">TMF639</div>
                <div className="text-[10px] opacity-80">Resource Inventory</div>
              </button>

              <button
                onClick={() => {
                  setSelectedTmfEndpoint('TMF642');
                  handleRunTmfQuery('TMF642');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-left ${
                  selectedTmfEndpoint === 'TMF642'
                    ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="font-bold">TMF642</div>
                <div className="text-[10px] opacity-80">Alarm Management</div>
              </button>
            </div>

            {/* Path Preview */}
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center justify-between font-mono text-xs text-slate-300 mb-3">
              <span className="text-emerald-400 font-bold">GET</span>
              <span className="truncate mx-2 text-slate-400">
                {selectedTmfEndpoint === 'TMF638' && '/api/v1/tmf/serviceInventory/v4/service'}
                {selectedTmfEndpoint === 'TMF639' && '/api/v1/tmf/resourceInventory/v4/resource'}
                {selectedTmfEndpoint === 'TMF642' && '/api/v1/tmf/alarmManagement/v4/alarm'}
              </span>
              <button
                onClick={() => handleRunTmfQuery(selectedTmfEndpoint)}
                disabled={isQueryingTmf}
                className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs transition-colors font-sans"
              >
                <Play className={`w-3 h-3 ${isQueryingTmf ? 'animate-spin' : ''}`} />
                Run
              </button>
            </div>

            {/* JSON Response Terminal */}
            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs max-h-[300px] overflow-y-auto">
              <pre className="text-cyan-300 whitespace-pre-wrap">
                {tmfResponseJson || '// Click "Run" to test query and inspect Northbound TM Forum payload'}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column: Webhook Subscriptions */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Active Webhook Subscriptions ({webhooks.length})
            </h3>

            <div className="space-y-3">
              {webhooks.map((hook) => (
                <div key={hook.id} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <strong className="text-slate-100 text-sm">{hook.name}</strong>
                      <span className="text-xs text-slate-400 block font-mono mt-0.5">{hook.subscriberSystem}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono truncate mb-2 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {hook.targetUrl}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Topics: <strong className="text-slate-200">{hook.eventTopics}</strong></span>
                    <span>HMAC-SHA256: <code className="text-slate-400 font-mono">******</code></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Logs */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              Recent Dispatch Audit Logs
            </h4>
            <div className="space-y-2 text-xs">
              {webhookLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-200 font-semibold">{log.subscriptionName}</span>
                    <span className="text-slate-500 font-mono text-[11px]">[{log.eventTopic}]</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-emerald-400 font-bold">HTTP {log.responseCode}</span>
                    <span className="text-slate-400">{log.latencyMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
