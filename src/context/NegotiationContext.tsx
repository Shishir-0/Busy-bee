import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  NegotiationMandate,
  MerchantSession,
  MerchantOffer,
  EvidenceItem,
  PolicyViolation,
  DealRecommendation,
  TranscriptTurn,
} from '../types/negotiation';
import { apiClient, DataSourceMode } from '../services/api';

interface NegotiationContextType {
  mode: DataSourceMode;
  setMode: (mode: DataSourceMode) => void;
  activeMandate: NegotiationMandate | null;
  setActiveMandate: (mandate: NegotiationMandate) => void;
  mandates: NegotiationMandate[];
  sessions: MerchantSession[];
  offers: MerchantOffer[];
  evidence: EvidenceItem[];
  violations: PolicyViolation[];
  recommendation: DealRecommendation | null;
  activeSession: MerchantSession | null;
  setActiveSession: (session: MerchantSession | null) => void;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  createNegotiation: (
    payload: Omit<NegotiationMandate, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ) => Promise<NegotiationMandate>;
  approveRecommendation: (reviewedBy: string, comments: string) => Promise<void>;
  simulateNewTurn: (
    speaker: 'merchant' | 'agent',
    text: string,
    extractedTerm?: {
      key: any;
      field: string;
      value: string | number;
      status: any;
    }
  ) => void;
  transcriptTurns: TranscriptTurn[];
}

const NegotiationContext = createContext<NegotiationContextType | undefined>(undefined);

export const NegotiationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<DataSourceMode>(apiClient.getMode());
  const [mandates, setMandates] = useState<NegotiationMandate[]>([]);
  const [activeMandate, setActiveMandate] = useState<NegotiationMandate | null>(null);
  const [sessions, setSessions] = useState<MerchantSession[]>([]);
  const [offers, setOffers] = useState<MerchantOffer[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [violations, setViolations] = useState<PolicyViolation[]>([]);
  const [recommendation, setRecommendation] = useState<DealRecommendation | null>(null);
  const [activeSession, setActiveSession] = useState<MerchantSession | null>(null);
  const [transcriptTurns, setTranscriptTurns] = useState<TranscriptTurn[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const setMode = (newMode: DataSourceMode) => {
    apiClient.setMode(newMode);
    setModeState(newMode);
  };

  const loadMandates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await apiClient.listNegotiations();
      setMandates(list);
      if (list.length > 0 && !activeMandate) {
        setActiveMandate(list[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load negotiations');
    } finally {
      setIsLoading(false);
    }
  }, [activeMandate]);

  const refreshData = useCallback(async () => {
    if (!activeMandate) return;
    setIsLoading(true);
    setError(null);
    try {
      const [sessList, offList, evList, vioList, rec] = await Promise.all([
        apiClient.listSessions(activeMandate.id),
        apiClient.listOffers(activeMandate.id),
        apiClient.listEvidence(activeMandate.id),
        apiClient.listViolations(activeMandate.id),
        apiClient.getRecommendation(activeMandate.id),
      ]);

      setSessions(sessList);
      setOffers(offList);
      setEvidence(evList);
      setViolations(vioList);
      setRecommendation(rec);

      if (sessList.length > 0 && !activeSession) {
        const active = sessList.find((s) => s.status === 'active') || sessList[0];
        setActiveSession(active);
        setTranscriptTurns(apiClient.getTranscriptTurns(active.id));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to refresh negotiation details');
    } finally {
      setIsLoading(false);
    }
  }, [activeMandate, activeSession]);

  useEffect(() => {
    loadMandates();
  }, [mode, loadMandates]);

  useEffect(() => {
    if (activeMandate) {
      refreshData();
    }
  }, [activeMandate, refreshData]);

  const createNegotiation = async (
    payload: Omit<NegotiationMandate, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<NegotiationMandate> => {
    setIsLoading(true);
    try {
      const created = await apiClient.createNegotiation(payload);
      setMandates((prev) => [created, ...prev]);
      setActiveMandate(created);
      return created;
    } finally {
      setIsLoading(false);
    }
  };

  const approveRecommendation = async (reviewedBy: string, comments: string) => {
    if (!activeMandate) return;
    const updated = await apiClient.approveRecommendation(activeMandate.id, reviewedBy, comments);
    setRecommendation(updated);
  };

  const simulateNewTurn = (
    speaker: 'merchant' | 'agent',
    text: string,
    extractedTerm?: {
      key: any;
      field: string;
      value: string | number;
      status: any;
    }
  ) => {
    if (!activeSession || !activeMandate) return;

    const turnId = `turn-live-${Date.now()}`;
    let evidenceId: string | undefined = undefined;

    if (extractedTerm) {
      evidenceId = `ev-live-${Date.now()}`;
      const newEv: EvidenceItem = {
        id: evidenceId,
        negotiationId: activeMandate.id,
        sessionId: activeSession.id,
        sourceTurnId: turnId,
        timestamp: new Date().toISOString(),
        speaker,
        speakerLabel: speaker === 'merchant' ? activeSession.merchantName : 'The Negotiator (AI Agent)',
        transcriptExcerpt: text,
        termKey: extractedTerm.key,
        extractedField: extractedTerm.field,
        extractedValue: extractedTerm.value,
        verificationStatus: extractedTerm.status,
        notes: 'Captured in live session and verified against transcript.',
      };
      setEvidence((prev) => [newEv, ...prev]);
    }

    const newTurn: TranscriptTurn = {
      id: turnId,
      sessionId: activeSession.id,
      speaker,
      speakerName: speaker === 'merchant' ? activeSession.merchantName : 'The Negotiator (AI Agent)',
      text,
      timestamp: new Date().toISOString(),
      extractedEvidenceId: evidenceId,
    };

    setTranscriptTurns((prev) => [...prev, newTurn]);
  };

  return (
    <NegotiationContext.Provider
      value={{
        mode,
        setMode,
        activeMandate,
        setActiveMandate,
        mandates,
        sessions,
        offers,
        evidence,
        violations,
        recommendation,
        activeSession,
        setActiveSession,
        isLoading,
        error,
        refreshData,
        createNegotiation,
        approveRecommendation,
        simulateNewTurn,
        transcriptTurns,
      }}
    >
      {children}
    </NegotiationContext.Provider>
  );
};

export const useNegotiation = (): NegotiationContextType => {
  const context = useContext(NegotiationContext);
  if (!context) {
    throw new Error('useNegotiation must be used within a NegotiationProvider');
  }
  return context;
};
