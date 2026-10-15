import React from 'react';
import {
  ShieldAlert,
  Radio,
  BookOpen,
  GitCompare,
  Award,
  Store,
  Layers,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { useNegotiation } from '../../context/NegotiationContext';

export type ActiveTab = 
  | 'command-centre' 
  | 'new-mandate' 
  | 'session' 
  | 'evidence' 
  | 'offers' 
  | 'recommendation' 
  | 'merchant';

interface NavigationProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const {
    mode,
    setMode,
    activeMandate,
    mandates,
    setActiveMandate,
    activeSession,
    refreshData,
    isLoading,
  } = useNegotiation();

  const isSessionReallyActive = Boolean(activeSession && activeSession.status === 'active');

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ElementType; badge?: string | number }> = [
    { id: 'command-centre', label: 'Command Centre', icon: Layers },
    {
      id: 'session',
      label: 'Active Session',
      icon: Radio,
      badge: isSessionReallyActive ? (mode === 'live' ? 'Live' : 'Demo') : undefined,
    },
    { id: 'evidence', label: 'Evidence Ledger', icon: BookOpen },
    { id: 'offers', label: 'Offer Comparison', icon: GitCompare },
    { id: 'recommendation', label: 'Deal Decision', icon: Award },
    { id: 'merchant', label: 'Merchant Browser', icon: Store },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-canvas-border shadow-xs">
      {/* Top Banner: Verification & Integrity Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${mode === 'live' ? 'bg-blue-400' : 'bg-emerald-400'} animate-pulse`}></span>
          <span className="font-medium tracking-wide">THE NEGOTIATOR</span>
          <span className="text-slate-400">• Proof-First Procurement AI</span>
          <span className="hidden md:inline-block text-slate-500">|</span>
          <span className="hidden md:inline-block text-slate-400 font-mono text-[11px]">
            {mode === 'live'
              ? 'LIVE BACKEND API • Express & MongoDB (No PSTN Outbound)'
              : 'SIMULATION / DEMO DATA • Scenario Replay (No PSTN Outbound)'}
          </span>
        </div>

        {/* Data Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-md p-0.5 border border-slate-700">
            <button
              onClick={() => setMode('simulation')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                mode === 'simulation'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Deterministic verification fixtures & scenario replay"
            >
              SIMULATION / DEMO DATA
            </button>
            <button
              onClick={() => setMode('live')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                mode === 'live'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Connect to live Express backend API"
            >
              LIVE BACKEND API
            </button>
          </div>

          <button
            onClick={() => refreshData()}
            disabled={isLoading}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 disabled:opacity-50"
            title="Refresh persisted state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Brand and Mandate Selector */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => onSelectTab('command-centre')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-procure-800 flex items-center justify-center text-white shadow-xs">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-semibold text-ink-primary leading-tight text-sm tracking-tight flex items-center gap-1.5">
                The Negotiator
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                  v1.0
                </span>
              </div>
              <div className="text-[11px] text-ink-muted leading-none">Guard • Evidence • Decision</div>
            </div>
          </div>

          {/* Active Mandate Badge / Dropdown */}
          {mandates.length > 0 && (
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200">
              <span className="text-xs text-ink-muted">Mandate:</span>
              <select
                value={activeMandate?.id || ''}
                onChange={(e) => {
                  const found = mandates.find((m) => m.id === e.target.value);
                  if (found) setActiveMandate(found);
                }}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded px-2 py-1 text-ink-primary hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-procure-600"
              >
                {mandates.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} (Cap: ₹{m.maxBudget.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tab Navigation Items */}
        <nav className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-procure-50 text-procure-800 border border-procure-200 shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-procure-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-600 text-white uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => onSelectTab('new-mandate')}
            className={`flex items-center gap-1 ml-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs ${
              currentTab === 'new-mandate'
                ? 'bg-procure-800 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Mandate</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
