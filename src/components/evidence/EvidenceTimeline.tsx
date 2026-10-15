import React, { useState } from 'react';
import { EvidenceItem } from '../../types/negotiation';
import { StatusBadge } from '../common/StatusBadge';
import { EvidenceDetailModal } from './EvidenceDetailModal';
import { formatTime, formatDate } from '../../utils/formatters';
import { Search, Filter, ExternalLink, ShieldCheck, User, Quote } from 'lucide-react';

interface EvidenceTimelineProps {
  items: EvidenceItem[];
}

export const EvidenceTimeline: React.FC<EvidenceTimelineProps> = ({ items }) => {
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectItem, setInspectItem] = useState<EvidenceItem | null>(null);

  const filteredItems = items.filter((item) => {
    if (selectedTerm !== 'all' && item.termKey !== selectedTerm) return false;
    if (selectedStatus !== 'all' && item.verificationStatus !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText = item.transcriptExcerpt.toLowerCase().includes(q);
      const matchSpeaker = item.speakerLabel.toLowerCase().includes(q);
      const matchField = item.extractedField.toLowerCase().includes(q);
      const matchVal = String(item.extractedValue).toLowerCase().includes(q);
      if (!matchText && !matchSpeaker && !matchField && !matchVal) return false;
    }
    return true;
  });

  const terms: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Terms' },
    { id: 'price', label: 'Price' },
    { id: 'shipping', label: 'Shipping / Freight' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'warranty', label: 'Warranty' },
    { id: 'taxes', label: 'Taxes' },
  ];

  const statuses: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Statuses' },
    { id: 'verified', label: 'Verified' },
    { id: 'partially_verified', label: 'Partially Verified' },
    { id: 'disputed', label: 'Disputed' },
    { id: 'needs_review', label: 'Needs Review' },
  ];

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-canvas-border shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transcript text, speaker, or extracted term..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-ink-primary placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-procure-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Showing <strong className="text-ink-primary font-mono">{filteredItems.length}</strong> of{' '}
              <strong className="text-ink-primary font-mono">{items.length}</strong> captured terms
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter by:
          </span>

          <div className="flex flex-wrap items-center gap-1">
            {terms.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTerm(t.id)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedTerm === t.id
                    ? 'bg-slate-900 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex flex-wrap items-center gap-1">
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedStatus === s.id
                    ? 'bg-procure-700 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Stream Table */}
      <div className="bg-white rounded-lg border border-canvas-border shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-ink-muted space-y-2">
            <Quote className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-semibold text-ink-primary text-sm">No evidence records matched</div>
            <p>Try clearing filters or search terms to inspect all captured commercial evidence.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs"
              >
                {/* Left Column: Metadata & Speaker */}
                <div className="md:w-56 flex-shrink-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.verificationStatus} />
                  </div>
                  <div className="font-mono text-[10px] text-ink-muted pt-1">
                    Turn Ref: <strong className="text-slate-700">{item.sourceTurnId}</strong>
                  </div>
                  <div className="font-mono text-[10px] text-ink-muted">
                    {formatDate(item.timestamp)} • {formatTime(item.timestamp)}
                  </div>
                  <div className="flex items-center gap-1.5 text-ink-primary font-medium text-[11px] pt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.speakerLabel}</span>
                  </div>
                </div>

                {/* Middle Column: Verbatim Excerpt */}
                <div className="flex-1 space-y-1.5">
                  <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1">
                    <Quote className="w-3 h-3 text-slate-400" />
                    Verbatim Spoken Excerpt:
                  </div>
                  <blockquote className="p-2.5 rounded bg-slate-50 border border-slate-200/80 font-mono text-[11px] text-ink-secondary leading-relaxed">
                    "{item.transcriptExcerpt}"
                  </blockquote>
                  {item.notes && (
                    <p className="text-[11px] text-slate-500 italic">
                      Note: {item.notes}
                    </p>
                  )}
                </div>

                {/* Right Column: Extracted Value & Inspect Action */}
                <div className="md:w-52 flex-shrink-0 md:text-right space-y-2">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-ink-muted">
                      {item.extractedField}
                    </div>
                    <div className="font-mono font-bold text-sm text-ink-primary mt-0.5">
                      {item.extractedValue}
                    </div>
                  </div>

                  <button
                    onClick={() => setInspectItem(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded shadow-2xs transition-colors"
                  >
                    <span>Audit Provenance</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Detail Modal */}
      <EvidenceDetailModal item={inspectItem} onClose={() => setInspectItem(null)} />
    </div>
  );
};
