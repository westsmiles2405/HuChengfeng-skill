import * as vscode from 'vscode';
import {
  getComfort,
  getSolemnComfort,
  getEncourageLine,
  getWorkLine,
  getTimeBasedGreeting,
  getSharpLine,
  getCityRule,
  getNickname,
} from './persona';
import { fallbackReply, getIntentKeywords } from './styleConfig';

export const CODE_ANALYSIS_KEYWORDS = ['分析代码', '诊断', '检查代码', '有没有错'];

type Intent = 'deep' | 'sad' | 'work' | 'encourage' | 'hello' | 'sharp' | 'city' | 'name' | 'unknown';

function intent(text: string): Intent {
  const t = text.toLowerCase();
  const keys = getIntentKeywords();
  if (keys.sharp.some((k) => t.includes(k))) return 'sharp';
  if (keys.city.some((k) => t.includes(k))) return 'city';
  if (keys.name.some((k) => t.includes(k))) return 'name';
  if (keys.deep.some((k) => t.includes(k))) return 'deep';
  if (keys.sad.some((k) => t.includes(k))) return 'sad';
  if (keys.encourage.some((k) => t.includes(k))) return 'encourage';
  if (keys.work.some((k) => t.includes(k))) return 'work';
  if (keys.hello.some((k) => t.includes(k))) return 'hello';
  return 'unknown';
}

export function generateResponse(userMessage: string): string {
  switch (intent(userMessage)) {
    case 'deep': return getSolemnComfort();
    case 'sad': return getComfort();
    case 'work': return getWorkLine();
    case 'encourage': return getEncourageLine();
    case 'hello': return getTimeBasedGreeting();
    case 'sharp': return getSharpLine();
    case 'city': return getCityRule();
    case 'name': return getNickname();
    default: return fallbackReply();
  }
}

export function analyzeCodeProblems(): string {
  const diagnostics = vscode.languages.getDiagnostics();
  let errors = 0;
  let warnings = 0;
  const top: string[] = [];

  for (const [uri, diags] of diagnostics) {
    for (const d of diags) {
      if (d.severity === vscode.DiagnosticSeverity.Error) {
        errors++;
        if (top.length < 5) {
          top.push(`🎯 [${uri.path.split('/').pop()}:${d.range.start.line + 1}] ${d.message}`);
        }
      } else if (d.severity === vscode.DiagnosticSeverity.Warning) {
        warnings++;
      }
    }
  }

  if (errors === 0 && warnings === 0) {
    return '当前没有错误和警告，状态在线。';
  }

  const head = errors > 0
    ? `发现 ${errors} 个错误，${warnings} 个警告。先灭错误。`
    : `无错误，但有 ${warnings} 个警告。`;

  const detail = top.length > 0 ? `\n\n${top.join('\n')}` : '';
  return `${head}${detail}`;
}
