import React from 'react';
import { Bot, User, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TranscriptTurn } from '../../types/negotiation';
import { formatTime } from '../../utils/formatters';

interface LiveTranscriptProps {
  turns: TranscriptTurn[];
  onViewEvidence?: (evidenceId: string) => void;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({ turns, onViewEvidence }) => {
  return (
    <div className="bg-white rounded-lg border border-canvas-border shadow-xs overflow-hidden flex flex-col h-[520px]">
      {/* Header */}
      <div className="bg-slate-50 border-b border-canvas-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
            Live Spoken Transcript & Turn Extraction
          </h3>
        </div>
        <span className="text-[11px] font-mono text-ink-muted">
          {turns.length} Turns Recorded
        </span>
      </div>

      {/* Transcript Turns Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {turns.map((turn) => {
          const isAgent = turn.speaker === 'agent';
          const isSystem = turn.speaker === 'system';

          if (isSystem) {
            return (
              <div
                key={turn.id}
                className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-md text-xs text-amber-950 flex items-start gap-2.5"
              >
                <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-[11px] text-amber-900 uppercase tracking-wide">
                    {turn.speakerName} • {formatTime(turn.timestamp)}
                  </div>
                  <p className="leading-relaxed">{turn.text}</p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={turn.id}
              className={`flex gap-3 text-xs ${
                isAgent ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              {/* Speaker Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isAgent
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}
              >
                {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-lg p-3 border space-y-1.5 ${
                  isAgent
                    ? 'bg-slate-50 border-slate-200 text-ink-primary'
                    : 'bg-blue-50/60 border-blue-200 text-ink-primary'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[11px]">
                  <span className="font-semibold text-ink-primary">{turn.speakerName}</span>
                  <span className="font-mono text-ink-muted text-[10px]">
                    {formatTime(turn.timestamp)}
                  </span>
                </div>

                <p className="text-xs leading-relaxed">{turn.text}</p>

                {/* Evidence Extraction Tag */}
                {turn.extractedEvidenceId && (
                  <div className="pt-1 flex items-center justify-between border-t border-slate-200/60 text-[11px]">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium font-mono text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      EVIDENCE EXTRACTED [{turn.id}]
                    </span>
                    {onViewEvidence && (
                      <button
                        onClick={() => onViewEvidence(turn.extractedEvidenceId!)}
                        className="text-procure-700 hover:text-procure-900 font-semibold inline-flex items-center gap-0.5 hover:underline"
                      >
                        Inspect Ledger <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
