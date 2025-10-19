import { useState, useEffect } from 'react';
import { Brain, Sparkles, BookOpen, Trash2, Search, Download } from 'lucide-react';
import type { Insight, SelectionData } from '../types';
import { summarizeText } from '../utils/aiSummarizer';
import { explainSimply } from '../utils/aiPrompt';
import { simplifyText } from '../utils/aiRewriter';
import { proofreadText } from '../utils/aiProofreader';
import { saveInsight, getAllInsights, deleteInsight, clearAllInsights } from '../utils/storage';
import { exportToJSON, exportToMarkdown, exportToText } from '../utils/exportVault';
import { useBackgroundHealth } from '../hooks/useBackgroundHealth';
import InsightCard from '../components/InsightCard';
import ActionPanel from '../components/ActionPanel';
import ForgePulse from '../components/ForgePulse';
import ForgeStatusStrip from '../components/ForgeStatusStrip';

type View = 'home' | 'vault' | 'processing';

function App() {
  const [view, setView] = useState<View>('home');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [_pendingAction, setPendingAction] = useState<any>(null);
  const [result, setResult] = useState<string>('');
  const [_loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Background worker health monitor
  const healthStatus = useBackgroundHealth(30000); // Check every 30 seconds

  // Load insights on mount
  useEffect(() => {
    loadInsights();
    checkPendingAction();
  }, []);

  const loadInsights = async () => {
    const stored = await getAllInsights();
    setInsights(stored);
  };

  const checkPendingAction = async () => {
    const result = await chrome.storage.local.get('echomind_pending_action');
    if (result.echomind_pending_action) {
      const pending = result.echomind_pending_action;
      
      // Only process if less than 10 seconds old
      if (Date.now() - pending.timestamp < 10000) {
        setPendingAction(pending);
        setView('processing');
        await processAction(pending.action, pending.data);
      }
      
      // Clear pending action
      await chrome.storage.local.remove('echomind_pending_action');
    }
  };

  const processAction = async (action: string, data: SelectionData) => {
    setLoading(true);
    setError('');
    setView('processing');
    
    try {
      let resultText = '';
      let insightType: Insight['type'] = 'summary';

      switch (action) {
        case 'summarize':
          resultText = await summarizeText(data.text, { type: 'tl;dr', length: 'medium' });
          insightType = 'summary';
          break;

        case 'explain':
          resultText = await explainSimply(data.text);
          insightType = 'explanation';
          break;

        case 'simplify':
          resultText = await simplifyText(data.text);
          insightType = 'rewrite';
          break;

        case 'proofread':
          resultText = await proofreadText(data.text, 'en');
          insightType = 'rewrite';
          break;

        case 'save':
          // Just save the original text without processing
          await saveInsight({
            text: data.text,
            summary: 'Saved for later',
            url: data.url,
            pageTitle: data.pageTitle,
            type: 'summary',
          });
          await loadInsights();
          resultText = '✅ Saved to Memory Vault!';
          insightType = 'summary';
          break;

        default:
          throw new Error('Unknown action');
      }

      setResult(resultText);
      setView('home'); // Switch to home view to show result

      // Auto-save to vault (except for 'save' action which already saved)
      if (action !== 'save') {
        await saveInsight({
          text: data.text,
          summary: resultText,
          url: data.url,
          pageTitle: data.pageTitle,
          type: insightType,
        });
        await loadInsights();
      }

      // Notify content script with result
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            type: 'processing_complete',
            result: resultText,
            action: action
          });
        }
      });

    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred';
      setError(errorMsg);
      setView('home'); // Show error on home view
      console.error('Processing error:', err);
      
      // Notify content script even on error
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'processing_complete' });
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInsight = async (id: string) => {
    await deleteInsight(id);
    await loadInsights();
  };

  const handleClearAll = async () => {
    if (confirm('Clear all insights? This cannot be undone.')) {
      await clearAllInsights();
      await loadInsights();
    }
  };

  const handleExport = (format: 'json' | 'markdown' | 'text') => {
    if (insights.length === 0) {
      setError('No insights to export');
      return;
    }

    switch (format) {
      case 'json':
        exportToJSON(insights);
        break;
      case 'markdown':
        exportToMarkdown(insights);
        break;
      case 'text':
        exportToText(insights);
        break;
    }

    setShowExportMenu(false);
  };

  const filteredInsights = searchQuery
    ? insights.filter(i => 
        i.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.pageTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : insights;

  return (
    <div className="w-[400px] h-[600px] bg-gradient-to-br from-cosmic-950 via-cosmic-900 to-cosmic-800 text-white flex flex-col relative">
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
            <h1 className="text-lg font-bold">EchoMind</h1>
            <p className="text-xs text-cosmic-300">Your private AI mentor</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setView('home')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              view === 'home'
                ? 'bg-cosmic-600 text-white'
                : 'bg-white/10 text-cosmic-300 hover:bg-white/20'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-1" />
            Home
          </button>
          <button
            onClick={() => setView('vault')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              view === 'vault'
                ? 'bg-cosmic-600 text-white'
                : 'bg-white/10 text-cosmic-300 hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-1" />
            Vault ({insights.length})
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto" onClick={() => setShowExportMenu(false)}>
        {view === 'home' && (
          <div className="p-4">
            {result ? (
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <h3 className="text-sm font-semibold text-cosmic-300 mb-2">Result</h3>
                  <p className="text-sm leading-relaxed">{result}</p>
                </div>
                <button
                  onClick={() => setResult('')}
                  className="w-full py-2 bg-cosmic-600 hover:bg-cosmic-700 rounded-lg text-sm font-medium transition-all"
                >
                  Clear
                </button>
              </div>
            ) : (
              <ActionPanel />
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
          </div>
        )}

        {view === 'vault' && (
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cosmic-400" />
              <input
                type="text"
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm placeholder-cosmic-400 focus:outline-none focus:ring-2 focus:ring-cosmic-500"
              />
            </div>

            {/* Action Buttons */}
            {insights.length > 0 && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="w-full py-2 bg-cosmic-600/30 hover:bg-cosmic-600/50 border border-cosmic-500/50 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  
                  {showExportMenu && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-cosmic-900 border border-cosmic-600 rounded-lg overflow-hidden shadow-xl z-10">
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full px-4 py-2 text-sm text-left hover:bg-cosmic-700 transition-colors"
                      >
                        Export as JSON
                      </button>
                      <button
                        onClick={() => handleExport('markdown')}
                        className="w-full px-4 py-2 text-sm text-left hover:bg-cosmic-700 transition-colors"
                      >
                        Export as Markdown
                      </button>
                      <button
                        onClick={() => handleExport('text')}
                        className="w-full px-4 py-2 text-sm text-left hover:bg-cosmic-700 transition-colors"
                      >
                        Export as Text
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            )}

            {/* Insights List */}
            {filteredInsights.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto text-cosmic-600 mb-3" />
                <p className="text-cosmic-400">
                  {searchQuery ? 'No insights found' : 'No insights saved yet'}
                </p>
                <p className="text-xs text-cosmic-500 mt-1">
                  {!searchQuery && 'Highlight text on any page to get started'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onDelete={handleDeleteInsight}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'processing' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-cosmic-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-cosmic-300">Processing your request...</p>
            </div>
          </div>
        )}
      </main>

      {/* Forge Status Strip */}
      <ForgeStatusStrip status={healthStatus} />

      {/* Background Worker Health Status */}
      <footer className="px-4 py-2 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="text-cosmic-400">Forge Health:</span>
          {healthStatus === 'active' && (
            <span className="text-green-400 font-medium">✅ Stable</span>
          )}
          {healthStatus === 'recovering' && (
            <span className="text-yellow-400 font-medium animate-pulse">⚡ Recovering...</span>
          )}
          {healthStatus === 'offline' && (
            <span className="text-red-400 font-medium">❌ Offline</span>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;
