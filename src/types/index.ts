export interface Insight {
  id: string;
  text: string;
  summary: string;
  url: string;
  pageTitle: string;
  timestamp: number;
  type: 'summary' | 'explanation' | 'rewrite' | 'translation';
}

export interface SelectionData {
  text: string;
  url: string;
  pageTitle: string;
}

export type ActionType = 'summarize' | 'explain' | 'simplify' | 'translate' | 'save';

export interface Message {
  type: 'selection' | 'action' | 'result' | 'error';
  data?: any;
}
