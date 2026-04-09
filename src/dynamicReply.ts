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

const SAD = ['难过', '崩溃', '烦', '累', '焦虑', '不想干'];
const DEEP = ['离世', '去世', '想死', '活不下去', '自杀'];
const WORK = ['代码', 'bug', '报错', '上线', '重构', '开发', '测试', '需求'];
const ENCOURAGE = ['加油', '鼓励', '打气', '坚持'];
const HELLO = ['你好', '在吗', 'hi', 'hello'];
const SHARP = ['狠话', '直接点', '骂醒'];
const CITY = ['城市', '标准', '环境'];
const NAME = ['标签', '昵称', '起名'];

export const CODE_ANALYSIS_KEYWORDS = ['分析代码', '诊断', '检查代码', '有没有错'];

type Intent = 'deep' | 'sad' | 'work' | 'encourage' | 'hello' | 'sharp' | 'city' | 'name' | 'unknown';

function intent(text: string): Intent {
  const t = text.toLowerCase();
  if (SHARP.some((k) => t.includes(k))) return 'sharp';
  if (CITY.some((k) => t.includes(k))) return 'city';
  if (NAME.some((k) => t.includes(k))) return 'name';
  if (DEEP.some((k) => t.includes(k))) return 'deep';
  if (SAD.some((k) => t.includes(k))) return 'sad';
  if (ENCOURAGE.some((k) => t.includes(k))) return 'encourage';
  if (WORK.some((k) => t.includes(k))) return 'work';
  if (HELLO.some((k) => t.includes(k))) return 'hello';
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
    default:
      return ['说重点，我帮你拆。', '给我现状、目标、阻塞。', '继续，我在听。'][Math.floor(Math.random() * 3)];
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
