import React, { useState } from 'react';
import { useNegotiation } from '../context/NegotiationContext';
import { Currency } from '../types/negotiation';
import { formatCurrency } from '../utils/formatters';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  Info,
  AlertCircle,
} from 'lucide-react';
import { ActiveTab } from '../components/common/Navigation';

interface MandateSetupPageProps {
  onCreated: (tab: ActiveTab) => void;
}

export const MandateSetupPage: React.FC<MandateSetupPageProps> = ({ onCreated }) => {
  const { createNegotiation } = useNegotiation();

  const [title, setTitle] = useState<string>('50 Ergonomic Task Chairs (Tech Hub)');
  const [objective, setObjective] = useState<string>(
    'Procure 50 commercial-grade ergonomic office task chairs with breathable mesh back, adjustable lumbar support, and minimum 12-month warranty.'
  );
  const [quantity, setQuantity] = useState<number>(50);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [maxBudget, setMaxBudget] = useState<number>(150000);
  const [deliveryDeadlineDays, setDeliveryDeadlineDays] = useState<number>(5);
  const [minWarrantyMonths, setMinWarrantyMonths] = useState<number>(12);
  const [targetUnitPrice, setTargetUnitPrice] = useState<number>(2600);
  const [maxUnitPrice, setMaxUnitPrice] = useState<number>(2900);
  const [specs, setSpecs] = useState<string[]>([
    'Breathable high-tensile mesh backrest',
    '3D adjustable armrests with soft PU pads',
    'BIFMA X5.1 Class 4 heavy-duty pneumatic gas lift',
    'High-density molded foam seat cushion (45kg/m³)',
  ]);
  const [newSpec, setNewSpec] = useState<string>('');
  const [concessions, setConcessions] = useState<string[]>([
    'Net 15 payment terms',
    'Standard doorstep delivery window',
  ]);
  const [newConcession, setNewConcession] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddSpec = () => {
    if (newSpec.trim()) {
      setSpecs([...specs, newSpec.trim()]);
      setNewSpec('');
    }
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleAddConcession = () => {
    if (newConcession.trim()) {
      setConcessions([...concessions, newConcession.trim()]);
      setNewConcession('');
    }
  };

  const handleRemoveConcession = (idx: number) => {
    setConcessions(concessions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!title.trim() || !objective.trim()) {
      setValidationError('Title and purchase objective are required.');
      return;
    }
    if (quantity <= 0) {
      setValidationError('Quantity must be greater than zero.');
      return;
    }
    if (maxBudget <= 0) {
      setValidationError('Maximum budget cap must be greater than zero.');
      return;
    }
    if (deliveryDeadlineDays <= 0) {
      setValidationError('Delivery deadline must be at least 1 day.');
      return;
    }
    if (minWarrantyMonths < 0) {
      setValidationError('Minimum warranty cannot be negative.');
      return;
    }
    if (maxUnitPrice * quantity > maxBudget) {
      setValidationError(
        `Warning: Max unit price (${formatCurrency(maxUnitPrice, currency)} × ${quantity} = ${formatCurrency(maxUnitPrice * quantity, currency)}) exceeds the hard budget ceiling (${formatCurrency(maxBudget, currency)}). Adjust unit price or budget.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await createNegotiation({
        title,
        objective,
        quantity,
        currency,
        maxBudget,
        deliveryDeadlineDays,
        minWarrantyMonths,
        mandatorySpecs: specs,
        authority: {
          targetUnitPrice,
          maxUnitPrice,
          permittedConcessions: concessions,
          strictBudgetCap: true,
          maxDeliveryDays: deliveryDeadlineDays,
          minWarrantyMonths,
        },
      });

      onCreated('session');
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save mandate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink-primary">
              Procurement Mandate & Negotiation Guard Setup
            </h1>
            <p className="text-xs text-ink-muted">
              Define the buyer's non-negotiable requirements, budget ceiling, and agent negotiation authority.
            </p>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-950">Validation Warning</div>
            <p className="mt-0.5 leading-relaxed">{validationError}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Objective & Volume */}
        <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 border-b pb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            1. Procurement Objective & Requirements
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-ink-secondary font-medium mb-1">
                Mandate Title / Item Description *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-procure-600"
              />
            </div>

            <div>
              <label className="block text-ink-secondary font-medium mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-procure-600"
              >
                <option value="INR">INR (₹ Indian Rupee)</option>
                <option value="USD">USD ($ US Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-ink-secondary font-medium mb-1">
                Purchase Statement & Scope
              </label>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={2}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-procure-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Non-Negotiable Hard Guardrails */}
        <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              2. Non-Negotiable Guardrails (Backend Enforced)
            </h2>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              STRICT CEILING
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-ink-secondary font-medium mb-1">
                Required Quantity (Units) *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono font-medium focus:bg-white focus:ring-1 focus:ring-procure-600"
              />
            </div>

            <div>
              <label className="block text-ink-secondary font-medium mb-1">
                Hard Budget Ceiling (Total Landed Cost) *
              </label>
              <input
                type="number"
                min="1"
                value={maxBudget}
                onChange={(e) => setMaxBudget(parseInt(e.target.value) || 0)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono font-medium focus:bg-white focus:ring-1 focus:ring-procure-600"
              />
              <span className="text-[10px] text-ink-muted mt-0.5 block">
                {formatCurrency(maxBudget, currency)} maximum all-in spend
              </span>
            </div>

            <div>
              <label className="block text-ink-secondary font-medium mb-1">
                Max Delivery Timeframe (Days) *
              </label>
              <input
                type="number"
                min="1"
                value={deliveryDeadlineDays}
                onChange={(e) => setDeliveryDeadlineDays(parseInt(e.target.value) || 0)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono font-medium focus:bg-white focus:ring-1 focus:ring-procure-600"
              />
            </div>

            <div>
              <label className="block text-ink-secondary font-medium mb-1">
                Minimum Warranty (Months) *
              </label>
              <input
                type="number"
                min="0"
                value={minWarrantyMonths}
                onChange={(e) => setMinWarrantyMonths(parseInt(e.target.value) || 0)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono font-medium focus:bg-white focus:ring-1 focus:ring-procure-600"
              />
            </div>

            <div>
              <label className="block text-ink-secondary font-medium mb-1">
                Target Unit Price
              </label>
              <input
                type="number"
                value={targetUnitPrice}
                onChange={(e) => setTargetUnitPrice(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono font-medium focus:bg-white focus:ring-1 focus:ring-procure-600"
              />
            </div>

            <div>
              <label className="block text-ink-secondary font-medium mb-1">
                Max Authorized Unit Price
              </label>
              <input
                type="number"
                value={maxUnitPrice}
                onChange={(e) => setMaxUnitPrice(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono font-medium focus:bg-white focus:ring-1 focus:ring-procure-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Mandatory Specs & Concessions */}
        <div className="bg-white rounded-xl border border-canvas-border shadow-xs p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 border-b pb-2">
            3. Mandatory Product Specifications & Permitted Concessions
          </h2>

          <div className="space-y-4 text-xs">
            {/* Specs List */}
            <div>
              <label className="block text-ink-secondary font-medium mb-1.5">
                Mandatory Technical Specifications
              </label>
              <div className="space-y-1.5">
                {specs.map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded"
                  >
                    <span className="text-ink-primary">{spec}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(i)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Add technical specification..."
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Concessions List */}
            <div>
              <label className="block text-ink-secondary font-medium mb-1.5">
                Permitted Concessions Granted to Agent
              </label>
              <div className="space-y-1.5">
                {concessions.map((conc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded"
                  >
                    <span className="text-ink-primary">{conc}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveConcession(i)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Add permitted negotiation concession..."
                  value={newConcession}
                  onChange={(e) => setNewConcession(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddConcession}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Persisting Mandate...' : 'Save Mandate & Launch Session'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
