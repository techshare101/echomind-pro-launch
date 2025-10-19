/**
 * Local Storage Manager for Memory Vault
 * Handles persistent storage of insights
 */

import type { Insight } from '../types';

const STORAGE_KEY = 'echomind_insights';

export async function saveInsight(insight: Omit<Insight, 'id' | 'timestamp'>): Promise<Insight> {
  const newInsight: Insight = {
    ...insight,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };

  const insights = await getAllInsights();
  insights.unshift(newInsight);

  await chrome.storage.local.set({ [STORAGE_KEY]: insights });

  return newInsight;
}

export async function getAllInsights(): Promise<Insight[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

export async function deleteInsight(id: string): Promise<void> {
  const insights = await getAllInsights();
  const filtered = insights.filter(insight => insight.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
}

export async function clearAllInsights(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY);
}

export async function getInsightById(id: string): Promise<Insight | null> {
  const insights = await getAllInsights();
  return insights.find(insight => insight.id === id) || null;
}

export async function searchInsights(query: string): Promise<Insight[]> {
  const insights = await getAllInsights();
  const lowerQuery = query.toLowerCase();
  
  return insights.filter(insight =>
    insight.text.toLowerCase().includes(lowerQuery) ||
    insight.summary.toLowerCase().includes(lowerQuery) ||
    insight.pageTitle.toLowerCase().includes(lowerQuery)
  );
}
