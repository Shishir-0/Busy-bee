import React from 'react';
import { Mic, MicOff, Volume2, Bot, User, Radio } from 'lucide-react';

interface AudioVisualizerProps {
  isMuted: boolean;
  onToggleMute: () => void;
  activeSpeaker: 'agent' | 'merchant' | 'idle';
  isConnected: boolean;
  isLiveVoice?: boolean;
  connectionNotice?: string | null;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isMuted,
  onToggleMute,
  activeSpeaker,
  isConnected,
  isLiveVoice = false,
  connectionNotice,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-900 text-white rounded-lg border border-slate-800 shadow-xs">
      {/* Speaker State & Audio Waveform */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${
            activeSpeaker === 'agent'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 ring-2 ring-emerald-500/20'
              : activeSpeaker === 'merchant'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 ring-2 ring-blue-500/20'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {activeSpeaker === 'agent' ? (
            <Bot className="w-5 h-5 animate-pulse" />
          ) : activeSpeaker === 'merchant' ? (
            <User className="w-5 h-5" />
          ) : (
            <Radio className="w-5 h-5 text-slate-500" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">
              {activeSpeaker === 'agent'
                ? 'AI Agent Speaking'
                : activeSpeaker === 'merchant'
                ? 'Merchant Speaking'
                : isConnected && isLiveVoice
                ? 'Microphone Connected • Listening to Channel'
                : isConnected && !isLiveVoice
                ? 'Browser Audio Channel Ready (Demo Mode)'
                : 'Audio Channel Offline (Session Idle)'}
            </span>
            {isConnected && (
              <span className={`w-2 h-2 rounded-full ${isLiveVoice ? 'bg-emerald-400' : 'bg-blue-400'} animate-ping`} />
            )}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <Volume2 className="w-3 h-3 text-slate-500" />
            <span>
              {isLiveVoice ? 'LiveKit Cloud WebRTC Audio • 48kHz' : 'Browser WebRTC Audio Stream • Local Engine'}
            </span>
          </div>
        </div>

        {/* Dynamic Waveform Bars */}
        {isConnected && activeSpeaker !== 'idle' && (
          <div className="flex items-center gap-1 h-6 ml-2 px-2 py-1 bg-slate-800/80 rounded border border-slate-700">
            <span className="w-1 bg-emerald-400 rounded-full animate-audio-bar-1" />
            <span className="w-1 bg-emerald-400 rounded-full animate-audio-bar-2" />
            <span className="w-1 bg-emerald-400 rounded-full animate-audio-bar-3" />
            <span className="w-1 bg-emerald-400 rounded-full animate-audio-bar-4" />
            <span className="w-1 bg-emerald-400 rounded-full animate-audio-bar-5" />
          </div>
        )}
      </div>

      {/* Mic and Voice Controls */}
      <div className="flex items-center gap-2">
        {connectionNotice && (
          <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-1 rounded max-w-xs truncate hidden sm:inline-block">
            {connectionNotice}
          </span>
        )}
        <button
          onClick={onToggleMute}
          disabled={!isConnected}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            isMuted
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : isConnected
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              : 'bg-slate-800 text-slate-500 border border-slate-700'
          }`}
        >
          {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          <span>{isMuted ? 'Muted' : 'Mute Mic'}</span>
        </button>
      </div>
    </div>
  );
};
