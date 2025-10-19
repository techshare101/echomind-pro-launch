import { Trash2, ExternalLink, FileText, Lightbulb, RefreshCw, Languages, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import type { Insight } from '../types';
import { speak, stopSpeaking } from '../utils/tts';

interface InsightCardProps {
  insight: Insight;
  onDelete: (id: string) => void;
}

const typeIcons = {
  summary: FileText,
  explanation: Lightbulb,
  rewrite: RefreshCw,
  translation: Languages,
};

const typeColors = {
  summary: 'from-blue-500 to-cyan-500',
  explanation: 'from-yellow-500 to-orange-500',
  rewrite: 'from-purple-500 to-pink-500',
  translation: 'from-green-500 to-emerald-500',
};

function InsightCard({ insight, onDelete }: InsightCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const Icon = typeIcons[insight.type];
  const colorClass = typeColors[insight.type];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const openUrl = () => {
    chrome.tabs.create({ url: insight.url });
  };

  const handleSpeak = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      speak(insight.summary);
      setIsPlaying(true);
      // Auto-reset after speech ends
      setTimeout(() => setIsPlaying(false), insight.summary.length * 50);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden hover:border-cosmic-400 transition-all">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colorClass} p-3 flex items-start justify-between`}>
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate">{insight.pageTitle}</h3>
            <p className="text-xs opacity-90">{formatDate(insight.timestamp)}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(insight.id)}
          className="p-1 hover:bg-white/20 rounded transition-all flex-shrink-0"
          title="Delete insight"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Original Text */}
        <div>
          <p className="text-xs text-cosmic-400 mb-1">Original:</p>
          <p className="text-sm line-clamp-2 text-cosmic-200">{insight.text}</p>
        </div>

        {/* Summary */}
        <div>
          <p className="text-xs text-cosmic-400 mb-1">Insight:</p>
          <p className="text-sm leading-relaxed">{insight.summary}</p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
          <button
            onClick={openUrl}
            className="flex items-center gap-1 text-xs text-cosmic-300 hover:text-cosmic-100 transition-all"
          >
            <ExternalLink className="w-3 h-3" />
            Visit page
          </button>
          <button
            onClick={handleSpeak}
            className="flex items-center gap-1 text-xs text-cosmic-300 hover:text-cosmic-100 transition-all p-1.5 rounded-md hover:bg-white/10"
            title="Read aloud"
          >
            {isPlaying ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InsightCard;
