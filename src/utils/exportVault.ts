/**
 * Vault Export/Import Utilities
 * Backup and restore insights
 */

import type { Insight } from '../types';

export function exportToJSON(insights: Insight[]): void {
  const dataStr = JSON.stringify(insights, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  downloadFile(blob, `echomind_vault_${getTimestamp()}.json`);
}

export function exportToText(insights: Insight[]): void {
  let textContent = '# EchoMind Memory Vault Export\n\n';
  textContent += `Exported: ${new Date().toLocaleString()}\n`;
  textContent += `Total Insights: ${insights.length}\n\n`;
  textContent += '---\n\n';

  insights.forEach((insight, index) => {
    textContent += `## Insight ${index + 1}\n\n`;
    textContent += `**Source:** ${insight.pageTitle}\n`;
    textContent += `**URL:** ${insight.url}\n`;
    textContent += `**Date:** ${new Date(insight.timestamp).toLocaleString()}\n`;
    textContent += `**Type:** ${insight.type}\n\n`;
    textContent += `**Original Text:**\n${insight.text}\n\n`;
    textContent += `**Insight:**\n${insight.summary}\n\n`;
    textContent += '---\n\n';
  });

  const blob = new Blob([textContent], { type: 'text/plain' });
  downloadFile(blob, `echomind_vault_${getTimestamp()}.txt`);
}

export function exportToMarkdown(insights: Insight[]): void {
  let mdContent = '# 🧠 EchoMind Memory Vault\n\n';
  mdContent += `**Exported:** ${new Date().toLocaleString()}  \n`;
  mdContent += `**Total Insights:** ${insights.length}\n\n`;
  mdContent += '---\n\n';

  insights.forEach((insight, index) => {
    const icon = getTypeIcon(insight.type);
    mdContent += `## ${icon} Insight ${index + 1}\n\n`;
    mdContent += `- **Source:** [${insight.pageTitle}](${insight.url})\n`;
    mdContent += `- **Date:** ${new Date(insight.timestamp).toLocaleString()}\n`;
    mdContent += `- **Type:** ${insight.type}\n\n`;
    mdContent += `### Original Text\n\n`;
    mdContent += `> ${insight.text.replace(/\n/g, '\n> ')}\n\n`;
    mdContent += `### Insight\n\n`;
    mdContent += `${insight.summary}\n\n`;
    mdContent += '---\n\n';
  });

  const blob = new Blob([mdContent], { type: 'text/markdown' });
  downloadFile(blob, `echomind_vault_${getTimestamp()}.md`);
}

export function exportToCSV(insights: Insight[]): void {
  let csv = 'ID,Timestamp,Type,Page Title,URL,Original Text,Insight\n';

  insights.forEach((insight) => {
    const row = [
      insight.id,
      new Date(insight.timestamp).toISOString(),
      insight.type,
      escapeCSV(insight.pageTitle),
      insight.url,
      escapeCSV(insight.text),
      escapeCSV(insight.summary),
    ].join(',');
    csv += row + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  downloadFile(blob, `echomind_vault_${getTimestamp()}.csv`);
}

export async function importFromJSON(file: File): Promise<Insight[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Validate structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid format: expected array of insights');
        }

        // Basic validation
        const validInsights = data.filter(
          (item) =>
            item.id &&
            item.text &&
            item.summary &&
            item.timestamp &&
            item.type
        );

        resolve(validInsights);
      } catch (error) {
        reject(new Error('Failed to parse JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Helper functions
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

function escapeCSV(text: string): string {
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  const escaped = text.replace(/"/g, '""');
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped}"`;
  }
  return escaped;
}

function getTypeIcon(type: Insight['type']): string {
  const icons = {
    summary: '📝',
    explanation: '💡',
    rewrite: '✏️',
    translation: '🌍',
  };
  return icons[type] || '📄';
}
