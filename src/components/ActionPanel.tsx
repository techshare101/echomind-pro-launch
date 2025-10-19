import { Sparkles, Lightbulb, FileText, Zap } from 'lucide-react';

function ActionPanel() {
  return (
    <div className="space-y-4">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-cosmic-600 to-cosmic-700 rounded-lg p-4 border border-cosmic-500">
        <h2 className="text-lg font-bold mb-2">Welcome to EchoMind</h2>
        <p className="text-sm text-cosmic-200 leading-relaxed">
          Your private AI mentor that works entirely offline. Highlight any text on a webpage to get started.
        </p>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-cosmic-400 uppercase tracking-wider">Features</h3>
        
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Summarize</h4>
              <p className="text-xs text-cosmic-300 mt-1">
                Get instant summaries of any text, powered by Chrome's built-in AI
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Explain</h4>
              <p className="text-xs text-cosmic-300 mt-1">
                Get simple explanations and examples for complex concepts
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Simplify</h4>
              <p className="text-xs text-cosmic-300 mt-1">
                Rewrite text in simpler terms or different tones
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-cosmic-800/50 rounded-lg p-4 border border-cosmic-700">
        <div className="flex items-start gap-2">
          <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold mb-2">Quick Start</h3>
            <ol className="text-xs text-cosmic-300 space-y-1">
              <li>1. Highlight text on any webpage</li>
              <li>2. Click the action you want</li>
              <li>3. View results instantly</li>
              <li>4. All insights auto-saved to your Vault</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="text-center text-xs text-cosmic-500">
        <p>🔒 100% Private • All processing happens locally on your device</p>
      </div>
    </div>
  );
}

export default ActionPanel;
