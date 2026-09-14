import React, { useState } from 'react';
import { Webhook, Plus } from 'lucide-react';
import { WebhookSubscription } from '../../types/integration';

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<WebhookSubscription>) => Promise<void>;
}

export const CreateWebhookModal: React.FC<CreateWebhookModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [subscriberSystem, setSubscriberSystem] = useState('SERVICENOW_ITSM');
  const [targetUrl, setTargetUrl] = useState('https://');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'AlarmCritical',
    'AlarmMajor',
    'ReconciliationDiscrepancy',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const topicsList = [
    { id: 'AlarmCritical', label: 'Critical Telecom Alarms' },
    { id: 'AlarmMajor', label: 'Major Network Alarms' },
    { id: 'ReconciliationDiscrepancy', label: 'Configuration Drift & Discrepancies' },
    { id: 'ResourceCreated', label: 'New Inventory Hardware Provisioned' },
    { id: 'CircuitStateChanged', label: 'Leased Line Lifecycle State Transitions' },
    { id: 'DecomApproved', label: 'Circuit Decommissioning Approvals' },
  ];

  const handleToggleTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topicId));
    } else {
      setSelectedTopics([...selectedTopics, topicId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        subscriberSystem,
        targetUrl,
        eventTopics: selectedTopics.join(','),
        retryCount: 3,
        timeoutMs: 5000,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Register Northbound Webhook Subscriber</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subscriber Name</label>
            <input
              type="text"
              required
              placeholder="e.g. ServiceNow-Production-ITSM"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subscriber System Type</label>
            <select
              value={subscriberSystem}
              onChange={(e) => setSubscriberSystem(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="SERVICENOW_ITSM">ServiceNow ITSM</option>
              <option value="CRM_SALESFORCE">Salesforce CRM / BSS</option>
              <option value="BILLING_SAP">SAP / Enterprise Billing</option>
              <option value="GAHARU_BPMN">Gaharu_BPMN_NGIN Workflow Hub</option>
              <option value="GENERIC_REST">Custom Northbound REST Endpoint</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Webhook URL</label>
            <input
              type="url"
              required
              placeholder="https://servicenow.corp/api/v1/netstream-webhook"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Event Subscriptions</label>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
              {topicsList.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(t.id)}
                    onChange={() => handleToggleTopic(t.id)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? 'Registering...' : 'Register Webhook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
