import React, { useState, useMemo } from 'react';
import { Calculator, Network, Binary, Layers, Info, Check, Copy } from 'lucide-react';

export const SubnetCalculatorView: React.FC = () => {
  const [ipInput, setIpInput] = useState<string>('10.240.10.0');
  const [cidrPrefix, setCidrPrefix] = useState<number>(24);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // IPv4 calculations
  const calc = useMemo(() => {
    const rawIp = ipInput.trim();
    const octets = rawIp.split('.').map(o => parseInt(o, 10));

    if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) {
      return null;
    }

    const ipInt = ((octets[0] << 24) >>> 0) + ((octets[1] << 16) >>> 0) + ((octets[2] << 8) >>> 0) + (octets[3] >>> 0);
    const maskInt = cidrPrefix === 0 ? 0 : ((0xFFFFFFFF << (32 - cidrPrefix)) >>> 0);
    const wildcardInt = (~maskInt) >>> 0;
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;

    const intToIp = (num: number) => [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255
    ].join('.');

    const intToBinary = (num: number) => {
      const parts = [
        ((num >>> 24) & 255).toString(2).padStart(8, '0'),
        ((num >>> 16) & 255).toString(2).padStart(8, '0'),
        ((num >>> 8) & 255).toString(2).padStart(8, '0'),
        (num & 255).toString(2).padStart(8, '0')
      ];
      return parts.join('.');
    };

    const totalIps = Math.pow(2, 32 - cidrPrefix);
    const usableHosts = cidrPrefix >= 31 ? (cidrPrefix === 31 ? 2 : 1) : Math.max(0, totalIps - 2);
    const firstUsableInt = cidrPrefix >= 31 ? networkInt : networkInt + 1;
    const lastUsableInt = cidrPrefix >= 31 ? broadcastInt : broadcastInt - 1;

    let rfcClass = 'Public Global Internet';
    if (octets[0] === 10) rfcClass = 'RFC 1918 Private (10.0.0.0/8)';
    else if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) rfcClass = 'RFC 1918 Private (172.16.0.0/12)';
    else if (octets[0] === 192 && octets[1] === 168) rfcClass = 'RFC 1918 Private (192.168.0.0/16)';
    else if (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) rfcClass = 'RFC 6598 Carrier-Grade NAT (CGNAT 100.64.0.0/10)';
    else if (octets[0] === 127) rfcClass = 'RFC 1122 Loopback (127.0.0.0/8)';
    else if (octets[0] === 169 && octets[1] === 254) rfcClass = 'RFC 3927 Link-Local (169.254.0.0/16)';

    // Subnet splits (e.g. next smaller prefixes)
    const splits = [cidrPrefix + 1, cidrPrefix + 2].filter(p => p <= 30).map(targetPrefix => {
      const count = Math.pow(2, targetPrefix - cidrPrefix);
      const subTotal = Math.pow(2, 32 - targetPrefix);
      return {
        targetPrefix,
        count,
        subTotal,
        usable: Math.max(0, subTotal - 2)
      };
    });

    return {
      networkAddress: intToIp(networkInt),
      netmask: intToIp(maskInt),
      wildcard: intToIp(wildcardInt),
      broadcast: intToIp(broadcastInt),
      firstUsable: intToIp(firstUsableInt),
      lastUsable: intToIp(lastUsableInt),
      totalIps,
      usableHosts,
      binaryIp: intToBinary(ipInt),
      binaryMask: intToBinary(maskInt),
      rfcClass,
      splits
    };
  }, [ipInput, cidrPrefix]);

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Input Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>Telco CIDR & Subnet Calculator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live mathematical breakdown of network boundaries, broadcast vectors, binary masks, and address ranges
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[
              { label: 'Jakarta PE /24', ip: '10.240.10.0', cidr: 24 },
              { label: 'CGNAT /18', ip: '100.64.0.0', cidr: 18 },
              { label: 'Core /30 P2P', ip: '10.240.99.0', cidr: 30 },
              { label: 'Loopback /32', ip: '10.240.0.1', cidr: 32 }
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => {
                  setIpInput(preset.ip);
                  setCidrPrefix(preset.cidr);
                }}
                className="px-2.5 py-1 text-[11px] font-mono rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              IP Network / Host Address
            </label>
            <input
              type="text"
              value={ipInput}
              onChange={e => setIpInput(e.target.value)}
              placeholder="e.g. 10.240.10.0"
              className="glass-input w-full h-10 px-3.5 rounded-xl font-mono text-white text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
              <span>Subnet Mask Prefix (CIDR)</span>
              <span className="font-mono text-cyan-400 font-bold text-sm">/{cidrPrefix}</span>
            </div>
            <input
              type="range"
              min={8}
              max={32}
              value={cidrPrefix}
              onChange={e => setCidrPrefix(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>/8 (16.7M)</span>
              <span>/16 (65.5K)</span>
              <span>/24 (256)</span>
              <span>/28 (16)</span>
              <span>/30 (4 P2P)</span>
              <span>/32 (Host)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculated Results */}
      {calc ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Calculation Details */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Calculated Subnet Properties</span>
            </h4>

            <div className="space-y-2.5 text-xs font-mono">
              {[
                { label: 'Network Address', value: calc.networkAddress, copy: true },
                { label: 'Subnet Mask', value: `${calc.netmask} (/${cidrPrefix})`, copy: true },
                { label: 'Wildcard Mask', value: calc.wildcard, copy: false },
                { label: 'Broadcast Address', value: calc.broadcast, copy: true },
                { label: 'First Usable Host', value: calc.firstUsable, copy: true },
                { label: 'Last Usable Host', value: calc.lastUsable, copy: true },
                { label: 'Usable Host Range', value: `${calc.firstUsable} → ${calc.lastUsable}`, copy: false },
                { label: 'Total IP Addresses', value: calc.totalIps.toLocaleString(), copy: false },
                { label: 'Usable Hosts', value: calc.usableHosts.toLocaleString(), copy: false },
                { label: 'RFC Classification', value: calc.rfcClass, copy: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{item.value}</span>
                    {item.copy && (
                      <button
                        onClick={() => handleCopy(item.label, item.value.split(' ')[0])}
                        className="p-1 rounded text-slate-500 hover:text-cyan-300 transition-colors"
                        title="Copy"
                      >
                        {copiedField === item.label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Binary & Subnet Tree Visualizer */}
          <div className="space-y-4">
            {/* Binary Bit Breakdown */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Binary className="w-4 h-4 text-purple-400" />
                <span>32-Bit Binary Octet Alignment</span>
              </h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">IP Address Octets (Binary)</span>
                  <span className="text-cyan-300 font-bold tracking-widest block break-all">{calc.binaryIp}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Netmask Prefix Bits ({cidrPrefix} Ones)</span>
                  <span className="text-amber-300 font-bold tracking-widest block break-all">{calc.binaryMask}</span>
                </div>
              </div>
            </div>

            {/* Subnet Hierarchical Splitter */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Sub-Subnet Partitioning Tree</span>
              </h4>

              <p className="text-xs text-slate-400">
                Split current <strong className="text-white">/{cidrPrefix}</strong> into smaller subnets:
              </p>

              <div className="space-y-2">
                {calc.splits.map(split => (
                  <div key={split.targetPrefix} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-white font-bold block">
                        /{split.targetPrefix} Subnets ({split.count} Subnets)
                      </span>
                      <span className="text-slate-500 text-[11px] block">
                        Each subnet: {split.subTotal} Total IPs ({split.usable} Usable Hosts)
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold text-[10px]">
                      {split.count}x /{split.targetPrefix}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-rose-400 rounded-2xl border border-rose-500/30">
          Invalid IPv4 Address entered. Please enter 4 valid octets (0-255).
        </div>
      )}
    </div>
  );
};
