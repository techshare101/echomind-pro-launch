# 🤖 EchoMind Pro v2.0.1 — Automated Testing Setup

**Goal:** Automate the 30-test suite for continuous integration and regression testing

---

## 🎯 Testing Strategy

### **Test Pyramid**
```
         /\
        /  \  E2E Tests (5)
       /____\
      /      \  Integration Tests (10)
     /________\
    /          \  Unit Tests (15)
   /____________\
```

### **Test Coverage Goals**
- Unit Tests: 80%+ coverage
- Integration Tests: Key user flows
- E2E Tests: Critical paths only

---

## 🛠️ Tech Stack

### **Testing Frameworks**
```json
{
  "unit": "Jest",
  "integration": "Jest + Chrome Extension Testing Library",
  "e2e": "Playwright or Puppeteer",
  "assertions": "Jest matchers",
  "mocking": "Jest mocks"
}
```

### **CI/CD**
```
GitHub Actions (recommended)
- Runs on every push
- Runs on every PR
- Scheduled daily runs
```

---

## 📦 Installation

### **Step 1: Install Dependencies**

```bash
cd c:\Users\valen\Development\echomind

# Install testing dependencies
npm install --save-dev \
  jest \
  @types/jest \
  @types/chrome \
  playwright \
  @playwright/test \
  chrome-launcher \
  puppeteer
```

### **Step 2: Configure Jest**

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/lib/universalSummarizer.ts' // Exclude API calls from coverage
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

---

## 🧪 Test Structure

### **Directory Layout**
```
echomind/
├── src/
│   ├── popup/
│   │   ├── settings.js
│   │   ├── dashboard.js
│   │   └── popup.js
│   ├── background.ts
│   └── lib/
│       └── universalSummarizer.ts
├── tests/
│   ├── unit/
│   │   ├── detectProvider.test.ts
│   │   ├── storage.test.ts
│   │   └── utils.test.ts
│   ├── integration/
│   │   ├── settings.test.ts
│   │   ├── dashboard.test.ts
│   │   └── popup.test.ts
│   ├── e2e/
│   │   ├── summarize.spec.ts
│   │   ├── provider-switch.spec.ts
│   │   └── vault.spec.ts
│   ├── setup.ts
│   └── mocks/
│       ├── chrome.ts
│       └── api-responses.ts
└── jest.config.js
```

---

## 📝 Unit Tests (15 tests)

### **Test 1: Provider Detection**

Create `tests/unit/detectProvider.test.ts`:

```typescript
import { detectProvider } from '../../src/lib/universalSummarizer';

describe('detectProvider', () => {
  test('detects OpenRouter key', () => {
    expect(detectProvider('sk-or-v1-abc123')).toBe('openrouter');
  });

  test('detects OpenAI key', () => {
    expect(detectProvider('sk-proj-abc123')).toBe('openai');
    expect(detectProvider('sk-abc123')).toBe('openai');
  });

  test('detects Claude key', () => {
    expect(detectProvider('sk-ant-abc123')).toBe('anthropic');
  });

  test('detects Mistral key', () => {
    expect(detectProvider('mistral-abc123')).toBe('mistral');
  });

  test('detects Gemini key', () => {
    expect(detectProvider('AIzaAbc123')).toBe('gemini');
  });

  test('returns unknown for invalid key', () => {
    expect(detectProvider('invalid-key')).toBe('unknown');
  });

  test('returns unknown for empty key', () => {
    expect(detectProvider('')).toBe('unknown');
  });
});
```

### **Test 2: Storage Operations**

Create `tests/unit/storage.test.ts`:

```typescript
import { chrome } from '../mocks/chrome';

describe('Storage Operations', () => {
  beforeEach(() => {
    // Clear storage before each test
    chrome.storage.local.clear();
  });

  test('saves API key to storage', async () => {
    await chrome.storage.local.set({ openaiKey: 'sk-test-123' });
    const result = await chrome.storage.local.get(['openaiKey']);
    expect(result.openaiKey).toBe('sk-test-123');
  });

  test('saves enableCloud to storage', async () => {
    await chrome.storage.local.set({ enableCloud: true });
    const result = await chrome.storage.local.get(['enableCloud']);
    expect(result.enableCloud).toBe(true);
  });

  test('saves providerDisplay to storage', async () => {
    await chrome.storage.local.set({ providerDisplay: 'OpenRouter' });
    const result = await chrome.storage.local.get(['providerDisplay']);
    expect(result.providerDisplay).toBe('OpenRouter');
  });

  test('retrieves multiple keys at once', async () => {
    await chrome.storage.local.set({
      openaiKey: 'sk-test-123',
      enableCloud: true,
      providerDisplay: 'OpenRouter'
    });
    const result = await chrome.storage.local.get(['openaiKey', 'enableCloud', 'providerDisplay']);
    expect(result).toEqual({
      openaiKey: 'sk-test-123',
      enableCloud: true,
      providerDisplay: 'OpenRouter'
    });
  });

  test('handles missing keys gracefully', async () => {
    const result = await chrome.storage.local.get(['nonExistentKey']);
    expect(result.nonExistentKey).toBeUndefined();
  });
});
```

---

## 🔗 Integration Tests (10 tests)

### **Test 3: Settings Page Flow**

Create `tests/integration/settings.test.ts`:

```typescript
import { chrome } from '../mocks/chrome';

describe('Settings Page Integration', () => {
  beforeEach(() => {
    // Load settings.html
    document.body.innerHTML = `
      <input id="openai-key" type="password" />
      <input id="enable-cloud" type="checkbox" />
      <button id="saveSettings">Save</button>
      <div id="provider-detect"></div>
    `;
    
    // Import settings.js logic
    require('../../src/popup/settings.js');
  });

  test('detects provider on key input', () => {
    const keyInput = document.getElementById('openai-key') as HTMLInputElement;
    const providerDetect = document.getElementById('provider-detect');
    
    keyInput.value = 'sk-or-v1-test';
    keyInput.dispatchEvent(new Event('input'));
    
    expect(providerDetect?.textContent).toContain('OpenRouter');
  });

  test('saves settings on button click', async () => {
    const keyInput = document.getElementById('openai-key') as HTMLInputElement;
    const cloudToggle = document.getElementById('enable-cloud') as HTMLInputElement;
    const saveBtn = document.getElementById('saveSettings');
    
    keyInput.value = 'sk-or-v1-test';
    cloudToggle.checked = true;
    
    saveBtn?.click();
    
    // Wait for async save
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result = await chrome.storage.local.get(['openaiKey', 'enableCloud']);
    expect(result.openaiKey).toBe('sk-or-v1-test');
    expect(result.enableCloud).toBe(true);
  });

  test('validates key format before saving', async () => {
    const keyInput = document.getElementById('openai-key') as HTMLInputElement;
    const saveBtn = document.getElementById('saveSettings');
    
    keyInput.value = 'invalid-key-format';
    saveBtn?.click();
    
    // Should show error, not save
    const result = await chrome.storage.local.get(['openaiKey']);
    expect(result.openaiKey).toBeUndefined();
  });
});
```

### **Test 4: Dashboard Real-Time Sync**

Create `tests/integration/dashboard.test.ts`:

```typescript
import { chrome } from '../mocks/chrome';

describe('Dashboard Real-Time Sync', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="mode-status">Checking...</div>
      <div id="byok-banner">
        <div id="banner-title"></div>
        <div id="banner-subtitle"></div>
      </div>
    `;
    
    require('../../src/popup/dashboard.js');
  });

  test('updates mode status when storage changes', async () => {
    const modeStatus = document.getElementById('mode-status');
    
    // Simulate storage change
    await chrome.storage.local.set({
      openaiKey: 'sk-or-v1-test',
      enableCloud: true,
      providerDisplay: 'OpenRouter'
    });
    
    // Trigger storage change listener
    chrome.storage.onChanged.dispatch({
      openaiKey: { newValue: 'sk-or-v1-test' },
      enableCloud: { newValue: true }
    });
    
    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(modeStatus?.textContent).toContain('OpenRouter');
  });

  test('updates BYOK banner when provider changes', async () => {
    const bannerTitle = document.getElementById('banner-title');
    const bannerSubtitle = document.getElementById('banner-subtitle');
    
    await chrome.storage.local.set({
      openaiKey: 'sk-ant-test',
      enableCloud: true,
      providerDisplay: 'Anthropic (Claude)'
    });
    
    chrome.storage.onChanged.dispatch({
      providerDisplay: { newValue: 'Anthropic (Claude)' }
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(bannerSubtitle?.textContent).toContain('Claude');
  });
});
```

---

## 🌐 E2E Tests (5 tests)

### **Test 5: Complete Summarization Flow**

Create `tests/e2e/summarize.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('EchoMind Pro E2E', () => {
  test.beforeEach(async ({ page, context }) => {
    // Load extension
    const extensionPath = path.join(__dirname, '../../dist');
    await context.addInitScript(() => {
      // Mock chrome.storage for testing
      (window as any).chrome = {
        storage: {
          local: {
            get: async (keys: string[]) => ({
              openaiKey: 'sk-or-v1-test',
              enableCloud: true
            }),
            set: async (items: any) => {},
            onChanged: { addListener: () => {} }
          }
        },
        runtime: {
          sendMessage: async (msg: any) => ({ success: true, result: 'Test summary' })
        }
      };
    });
  });

  test('complete summarization flow', async ({ page }) => {
    // Navigate to test page
    await page.goto('https://example.com');
    
    // Highlight text
    await page.evaluate(() => {
      const text = document.querySelector('p');
      if (text) {
        const range = document.createRange();
        range.selectNodeContents(text);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    });
    
    // Right-click (context menu)
    await page.mouse.click(100, 100, { button: 'right' });
    
    // Click "EchoMind: Summarize"
    await page.click('text=EchoMind: Summarize');
    
    // Wait for popup
    await page.waitForSelector('#summaryBox');
    
    // Verify summary appears
    const summary = await page.textContent('#summaryBox');
    expect(summary).toContain('Test summary');
  });

  test('provider switching', async ({ page }) => {
    // Open settings
    await page.goto('chrome-extension://[extension-id]/src/popup/settings.html');
    
    // Enter OpenRouter key
    await page.fill('#openai-key', 'sk-or-v1-test');
    
    // Verify detection
    await expect(page.locator('#provider-detect')).toContainText('OpenRouter');
    
    // Save
    await page.click('#saveSettings');
    
    // Navigate to dashboard
    await page.goto('chrome-extension://[extension-id]/src/popup/dashboard.html');
    
    // Verify mode status
    await expect(page.locator('#mode-status')).toContainText('OpenRouter');
  });

  test('memory vault saves summaries', async ({ page }) => {
    // Perform summarization
    await page.goto('https://example.com');
    // ... (summarization steps)
    
    // Open dashboard
    await page.goto('chrome-extension://[extension-id]/src/popup/dashboard.html');
    
    // Check vault
    const vaultBox = await page.textContent('#vaultBox');
    expect(vaultBox).toContain('SUMMARY');
    expect(vaultBox).toContain('Test summary');
  });
});
```

---

## 🔄 CI/CD Setup (GitHub Actions)

Create `.github/workflows/test.yml`:

```yaml
name: Test EchoMind Pro

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Generate coverage report
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json
    
    - name: Build extension
      run: npm run build
    
    - name: Archive build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist/
```

---

## 📊 Test Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

---

## 🎯 Test Coverage Goals

### **Current Coverage (Target)**
```
File                          | % Stmts | % Branch | % Funcs | % Lines
------------------------------|---------|----------|---------|--------
All files                     |   80.00 |    75.00 |   80.00 |   80.00
 src/lib                      |   85.00 |    80.00 |   85.00 |   85.00
  universalSummarizer.ts      |   85.00 |    80.00 |   85.00 |   85.00
 src/popup                    |   75.00 |    70.00 |   75.00 |   75.00
  settings.js                 |   80.00 |    75.00 |   80.00 |   80.00
  dashboard.js                |   75.00 |    70.00 |   75.00 |   75.00
  popup.js                    |   70.00 |    65.00 |   70.00 |   70.00
 src                          |   80.00 |    75.00 |   80.00 |   80.00
  background.ts               |   80.00 |    75.00 |   80.00 |   80.00
```

---

## 🐛 Mock Setup

Create `tests/mocks/chrome.ts`:

```typescript
export const chrome = {
  storage: {
    local: {
      data: {} as any,
      get: async (keys: string | string[]) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        const result: any = {};
        keysArray.forEach(key => {
          if (chrome.storage.local.data[key] !== undefined) {
            result[key] = chrome.storage.local.data[key];
          }
        });
        return result;
      },
      set: async (items: any) => {
        Object.assign(chrome.storage.local.data, items);
      },
      remove: async (keys: string | string[]) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        keysArray.forEach(key => {
          delete chrome.storage.local.data[key];
        });
      },
      clear: async () => {
        chrome.storage.local.data = {};
      },
      onChanged: {
        listeners: [] as any[],
        addListener: (callback: any) => {
          chrome.storage.local.onChanged.listeners.push(callback);
        },
        dispatch: (changes: any) => {
          chrome.storage.local.onChanged.listeners.forEach(listener => {
            listener(changes);
          });
        }
      }
    }
  },
  runtime: {
    sendMessage: async (message: any) => {
      return { success: true, result: 'Mock response' };
    },
    onMessage: {
      addListener: (callback: any) => {}
    }
  }
};

// Make available globally
(global as any).chrome = chrome;
```

---

## 📋 Testing Checklist

### **Setup**
- [ ] Install Jest
- [ ] Install Playwright
- [ ] Configure jest.config.js
- [ ] Create test directory structure
- [ ] Set up Chrome mocks

### **Unit Tests**
- [ ] Provider detection (7 tests)
- [ ] Storage operations (5 tests)
- [ ] Utility functions (3 tests)

### **Integration Tests**
- [ ] Settings page flow (3 tests)
- [ ] Dashboard sync (2 tests)
- [ ] Popup actions (3 tests)
- [ ] Background worker (2 tests)

### **E2E Tests**
- [ ] Complete summarization (1 test)
- [ ] Provider switching (1 test)
- [ ] Memory vault (1 test)
- [ ] Edge cases (2 tests)

### **CI/CD**
- [ ] GitHub Actions workflow
- [ ] Automated test runs
- [ ] Coverage reporting
- [ ] Build verification

---

**Automated testing setup ready! Next: Final summary →**
