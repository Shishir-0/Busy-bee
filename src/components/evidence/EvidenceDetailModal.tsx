import React from 'react';
import { X, ShieldCheck, Clock, User, Quote, FileText } from 'lucide-react';
import { EvidenceItem } from '../../types/negotiation';
import { StatusBadge } from '../common/StatusBadge';
import { formatTime, formatDate } from '../../utils/formatters';

interface EvidenceDetailModalProps {
  item: EvidenceItem | null;
  onClose: () => void;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-canvas-border shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-white">
                Source Evidence Audit Inspection
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Turn Reference: {item.sourceTurnId} • ID: {item.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status and Provenance Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <div className="text-[10px] uppercase font-semibold text-ink-muted">Verification Status</div>
              <div className="mt-1">
                <StatusBadge status={item.verificationStatus} />
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-ink-muted">Extracted Commercial Field</div>
              <div className="mt-1 font-semibold text-ink-primary text-xs">
                {item.extractedField}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-ink-muted">Recorded Speaker</div>
              <div className="mt-1 flex items-center gap-1.5 font-medium text-ink-primary">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>{item.speakerLabel}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-ink-muted">Timestamp Recorded</div>
              <div className="mt-1 flex items-center gap-1.5 font-mono text-ink-primary">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatDate(item.timestamp)} {formatTime(item.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Extracted Value Display */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <div className="text-[10px] uppercase font-bold text-emerald-800">Verified Extracted Value</div>
            <div className="text-sm font-mono font-bold text-emerald-950 mt-0.5">
              {item.extractedValue}
            </div>
          </div>

          {/* Verbatim Transcript Excerpt */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-ink-primary flex items-center gap-1">
              <Quote className="w-3.5 h-3.5 text-slate-500" />
              Verbatim Spoken Excerpt
            </div>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-xs leading-relaxed border border-slate-800">
              "{item.transcriptExcerpt}"
            </div>
          </div>

          {/* Audit Notes */}
          {item.notes && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="text-[10px] uppercase font-semibold text-ink-muted flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Auditor & Compliance Notes
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">{item.notes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-canvas-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white shadow-xs transition-colors"
          >
            Close Audit View
          </button>
        </div>
      </div>
    </div>
  );
};
