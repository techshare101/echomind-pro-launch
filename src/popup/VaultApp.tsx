/**
 * EchoMind v0.2.7 - Vault Edition
 * Simple, reliable popup focused on Memory Vault
 */

import { useState, useEffect } from 'react';
import { Brain, Search, Download, Trash2, Copy } from 'lucide-react';
import { useBackgroundHealth } from '../hooks/useBackgroundHealth';
import ForgePulse from '../components/ForgePulse';
import ForgeStatusStrip from '../components/ForgeStatusStrip';

interface VaultEntry {
  type: string;
  text: string;
  time: number;
}

function VaultApp() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<VaultEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const healthStatus = useBackgroundHealth(30000);

  // Load vault entries
  useEffect(() => {
    loadVaultEntries();
  }, []);

  // Filter entries when search changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEntries(entries);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredEntries(
        entries.filter(
          (e) =>
            e.text.toLowerCase().includes(query) ||
            e.type.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, entries]);

  const loadVaultEntries = async () => {
    const result = await chrome.storage.local.get(['vaultEntries']);
    const vaultEntries = result.vaultEntries || [];
    setEntries(vaultEntries.slice().reverse()); // Show newest first
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(entries.slice().reverse(), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url,
      filename: `echomind_vault_${Date.now()}.json`,
    });
  };

  const handleClearAll = async () => {
    if (confirm('Clear all vault entries? This cannot be undone.')) {
      await chrome.storage.local.set({ vaultEntries: [] });
      setEntries([]);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'summarize':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'explain':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'simplify':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'proofread':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'save':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="w-[420px] h-[600px] bg-gradient-to-br from-cosmic-950 via-cosmic-900 to-cosmic-800 text-white flex flex-col relative">
      {/* Forge Pulse Orb */}
      <div className="absolute top-3 right-3 z-50">
        <ForgePulse status={healthStatus} size={14} />
      </div>

      {/* Header */}
      <header className="p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-400 to-cosmic-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">EchoMind Vault</h1>
            <p className="text-xs text-cosmic-300">Memory & Insights</p>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="p-3 bg-black/10 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cosmic-400" />
          <input
            type="text"
            placeholder="Search vault..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder-cosmic-500 focus:outline-none focus:border-cosmic-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-3 py-2 flex gap-2 bg-black/10 border-b border-white/10">
        <button
          onClick={handleExport}
          disabled={entries.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cosmic-600 hover:bg-cosmic-500 disabled:bg-cosmic-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={handleClearAll}
          disabled={entries.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 disabled:bg-red-900/10 disabled:cursor-not-allowed border border-red-500/30 rounded-lg text-sm font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* Vault List */}
      <main className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-cosmic-400">
            <Brain className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-center">
              {entries.length === 0
                ? 'No saved insights yet.\nHighlight text and use EchoMind!'
                : 'No results match your search.'}
            </p>
          </div>
        )}

        {filteredEntries.map((entry, index) => (
          <div
            key={index}
            className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-3 transition-colors"
          >
            {/* Meta */}
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs px-2 py-1 rounded border ${getTypeColor(
                  entry.type
                )}`}
              >
                {entry.type}
              </span>
              <span className="text-xs text-cosmic-400">{formatTime(entry.time)}</span>
            </div>

            {/* Text Preview */}
            <p className="text-sm text-cosmic-100 leading-relaxed mb-2 line-clamp-3">
              {entry.text}
            </p>

            {/* Copy Button */}
            <button
              onClick={() => handleCopy(entry.text, index)}
              className="flex items-center gap-2 px-3 py-1 bg-cosmic-700 hover:bg-cosmic-600 rounded text-xs font-medium transition-colors"
            >
              <Copy className="w-3 h-3" />
              {copiedIndex === index ? 'Copied!' : 'Copy'}
            </button>
          </div>
        ))}
      </main>

      {/* Status Strip */}
      <ForgeStatusStrip status={healthStatus} />

      {/* Footer */}
      <footer className="px-4 py-2 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="text-cosmic-400">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
          <span className="text-cosmic-600">•</span>
          <span className="text-cosmic-400">Forge Health:</span>
          {healthStatus === 'active' && (
            <span className="text-green-400 font-medium">✅ Stable</span>
          )}
          {healthStatus === 'recovering' && (
            <span className="text-yellow-400 font-medium animate-pulse">
              ⚡ Recovering...
            </span>
          )}
          {healthStatus === 'offline' && (
            <span className="text-red-400 font-medium">❌ Offline</span>
          )}
        </div>
      </footer>
    </div>
  );
}

export default VaultApp;
