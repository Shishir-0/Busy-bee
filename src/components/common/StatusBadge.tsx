import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Clock, ShieldCheck } from 'lucide-react';

export type BadgeVariant = 
  | 'verified' 
  | 'partially_verified' 
  | 'proposed' 
  | 'unverified' 
  | 'disputed' 
  | 'needs_review'
  | 'incomplete'
  | 'active'
  | 'ended'
  | 'ready_for_review';

interface StatusBadgeProps {
  status: BadgeVariant | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const norm = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-300';
  let Icon = HelpCircle;
  let defaultLabel = status;

  if (norm === 'verified') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    Icon = CheckCircle2;
    defaultLabel = 'Verified';
  } else if (norm === 'partially_verified') {
    styles = 'bg-teal-50 text-teal-800 border-teal-200';
    Icon = ShieldCheck;
    defaultLabel = 'Partially Verified';
  } else if (norm === 'proposed' || norm === 'unverified') {
    styles = 'bg-slate-50 text-slate-700 border-slate-200';
    Icon = Clock;
    defaultLabel = norm === 'proposed' ? 'Proposed' : 'Unverified';
  } else if (norm === 'disputed' || norm === 'rejected' || norm === 'violation') {
    styles = 'bg-rose-50 text-rose-800 border-rose-200';
    Icon = XCircle;
    defaultLabel = norm === 'disputed' ? 'Disputed' : 'Rejected';
  } else if (norm === 'needs_review' || norm === 'incomplete' || norm === 'warning') {
    styles = 'bg-amber-50 text-amber-900 border-amber-300';
    Icon = AlertTriangle;
    defaultLabel = norm === 'incomplete' ? 'Incomplete' : 'Needs Review';
  } else if (norm === 'active' || norm === 'connected') {
    styles = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-medium';
    Icon = CheckCircle2;
    defaultLabel = 'Active Session';
  } else if (norm === 'ready_for_review' || norm === 'ready_for_buyer_review') {
    styles = 'bg-blue-50 text-blue-800 border-blue-200 font-medium';
    Icon = ShieldCheck;
    defaultLabel = 'Ready For Review';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${sizeClasses} ${styles} font-medium tracking-tight`}
    >
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{label || defaultLabel}</span>
    </span>
  );
};
