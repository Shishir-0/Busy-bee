import React, { useState, useEffect } from 'react';
import { useNegotiation } from '../context/NegotiationContext';
import { NegotiationGuardPanel } from '../components/session/NegotiationGuardPanel';
import { LiveTranscript } from '../components/session/LiveTranscript';
import { ExtractedTermsSummary } from '../components/session/ExtractedTermsSummary';
import { AudioVisualizer } from '../components/session/AudioVisualizer';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDuration } from '../utils/formatters';
import {
  Clock,
  PhoneOff,
  ShieldAlert,
  Send,
  Zap,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { ActiveTab } from '../components/common/Navigation';

interface ActiveSessionPageProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const ActiveSessionPage: React.FC<ActiveSessionPageProps> = ({ onNavigate }) => {
  const {
    activeMandate,
    activeSession,
    sessions,
    setActiveSession,
    offers,
    violations,
    simulateNewTurn,
    transcriptTurns,
  } = useNegotiation();

  const [sessionSeconds, setSessionSeconds] = useState<number>(145);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'agent' | 'merchant' | 'idle'>('idle');
  const [customSpeech, setCustomSpeech] = useState<string>('');
  const [customField, setCustomField] = useState<string>('Unit Price');
  const [customValue, setCustomValue] = useState<string>('₹2,800 / unit');

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!activeMandate) {
    return (
      <div className="text-center py-12 text-xs text-ink-muted">
        No active negotiation mandate. Please select or create one first.
      </div>
    );
  }

  const currentSession = activeSession || sessions[0];
  const currentOffer = offers.find((o) => o.sessionId === currentSession?.id) || offers[0];

  const handleSimulateStandardQuote = () => {
    setActiveSpeaker('merchant');
    simulateNewTurn(
      'merchant',
      'For your bulk order of 50 units, our wholesale desk confirms ₹2,800 per piece, with ₹2,500 doorstep logistics.',
      {
        key: 'price',
        field: 'Unit Price',
        value: '₹2,800 / unit',
        status: 'verified',
      }
    );
    setTimeout(() => {
      setActiveSpeaker('agent');
      simulateNewTurn(
        'agent',
        'Thank you. ₹2,800 unit price and ₹2,500 shipping are confirmed and within authorized budget limits.'
      );
      setTimeout(() => setActiveSpeaker('idle'), 2500);
    }, 2000);
  };

  const handleSimulateOverBudgetViolation = () => {
    setActiveSpeaker('merchant');
    simulateNewTurn(
      'merchant',
      'Due to raw material increases, we can only supply these 50 chairs at ₹3,300 per unit plus ₹8,000 express delivery.',
      {
        key: 'price',
        field: 'Unit Price (Over-Budget)',
        value: '₹3,300 / unit',
        status: 'disputed',
      }
    );
    setTimeout(() => {
      setActiveSpeaker('agent');
      simulateNewTurn(
        'agent',
        'NEGOTIATION GUARD ALERT: Proposed terms of ₹3,300/unit would result in ₹1,73,000 total expenditure, breaching the hard budget ceiling of ₹1,50,000. Counteroffer required: our authorized ceiling cannot exceed ₹2,900/unit.'
      );
      setTimeout(() => setActiveSpeaker('idle'), 2500);
    }, 2000);
  };

  const handleSimulateCustomSpeech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSpeech.trim()) return;

    setActiveSpeaker('merchant');
    simulateNewTurn('merchant', customSpeech.trim(), {
      key: 'price',
      field: customField,
      value: customValue,
      status: 'verified',
    });
    setCustomSpeech('');
    setTimeout(() => setActiveSpeaker('idle'), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Session Top Bar: Connection Lifecycle & Session Meta */}
      <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-semibold text-emerald-800 uppercase tracking-wider">
              WebRTC Audio Session • Live Channel
            </span>
            <StatusBadge status="active" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-bold text-ink-primary">
              {currentSession?.merchantName || 'Live Merchant Session'}
            </h1>
            <span className="text-xs text-ink-muted">
              Rep: {currentSession?.merchantRepName || 'Sales Desk'}
            </span>
            <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
              Room: {currentSession?.roomId}
            </span>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-md font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatDuration(sessionSeconds)}</span>
          </div>

          {sessions.length > 1 && (
            <select
              value={currentSession?.id}
              onChange={(e) => {
                const s = sessions.find((x) => x.id === e.target.value);
                if (s) setActiveSession(s);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-ink-primary font-medium"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.merchantName} ({s.status})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => onNavigate('command-centre')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-xs font-semibold transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {/* AI Disclosure Banner (Mandatory Ethical Notice) */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-lg p-3 text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs">
        <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-semibold text-amber-900 uppercase tracking-wide text-[11px]">
            AI Disclosure & Transcript Capture Notice (Consent Verified)
          </div>
          <p className="text-[11px] leading-relaxed">
            The external merchant participant is informed that they are speaking with an autonomous AI procurement agent. Spoken terms are recorded, verified against audio timestamps, and stored as tamper-evident procurement records in MongoDB.
          </p>
        </div>
      </div>

      {/* Main Workspace Split: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Audio Stream & Live Transcript */}
        <div className="lg:col-span-7 space-y-4">
          {/* Audio Visualizer & Mute Controls */}
          <AudioVisualizer
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            activeSpeaker={activeSpeaker}
            isConnected={true}
          />

          {/* Chronological Transcript Component */}
          <LiveTranscript
            turns={transcriptTurns}
            onViewEvidence={() => onNavigate('evidence')}
          />

          {/* Interactive Simulation & Test Panel (For Hackathon Judges) */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-ink-primary uppercase tracking-wider text-[11px]">
                  Interactive Audio Turn Simulator (Judge / Demo Mode)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Test Guard & Extraction
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSimulateStandardQuote}
                className="p-2.5 bg-white hover:bg-slate-100 text-left border border-slate-200 rounded text-xs transition-colors space-y-1 shadow-2xs"
              >
                <div className="font-semibold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Simulate Valid Spoken Quote
                </div>
                <p className="text-[11px] text-ink-muted">
                  Merchant quotes ₹2,800/unit and ₹2,500 shipping (within budget).
                </p>
              </button>

              <button
                type="button"
                onClick={handleSimulateOverBudgetViolation}
                className="p-2.5 bg-white hover:bg-slate-100 text-left border border-slate-200 rounded text-xs transition-colors space-y-1 shadow-2xs"
              >
                <div className="font-semibold text-rose-800 flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                  Simulate Over-Budget Violation
                </div>
                <p className="text-[11px] text-ink-muted">
                  Merchant demands ₹3,300/unit (Guard rejects and counters).
                </p>
              </button>
            </div>

            {/* Custom Spoken Turn Form */}
            <form onSubmit={handleSimulateCustomSpeech} className="pt-2 border-t border-slate-200 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Extracted Term Field (e.g. Warranty)"
                  value={customField}
                  onChange={(e) => setCustomField(e.target.value)}
                  className="p-1.5 text-xs bg-white border border-slate-300 rounded"
                />
                <input
                  type="text"
                  placeholder="Extracted Value (e.g. 18 Months)"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="p-1.5 text-xs bg-white border border-slate-300 rounded"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type simulated merchant statement..."
                  value={customSpeech}
                  onChange={(e) => setCustomSpeech(e.target.value)}
                  className="flex-1 p-2 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-procure-600"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): Negotiation Guard Panel & Terms Summary */}
        <div className="lg:col-span-5 space-y-4">
          {/* Signature Negotiation Guard Panel */}
          <NegotiationGuardPanel
            mandate={activeMandate}
            currentTerms={currentOffer?.terms}
            violations={violations}
          />

          {/* Current Extracted Terms Summary */}
          {currentOffer && (
            <ExtractedTermsSummary
              terms={currentOffer.terms}
              status={currentOffer.status}
              merchantName={currentOffer.merchantName}
            />
          )}
        </div>
      </div>
    </div>
  );
};
