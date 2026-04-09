export type PersonaMode = 'neutral' | 'standard' | 'intense';

export interface StyleConfig {
  mode: PersonaMode;
  safeMode: boolean;
}

let current: StyleConfig = {
  mode: 'standard',
  safeMode: true,
};

export function updateStyleConfig(next: Partial<StyleConfig>): void {
  current = { ...current, ...next };
}

export function getStyleConfig(): StyleConfig {
  return current;
}

export interface IntentKeywords {
  sad: string[];
  deep: string[];
  work: string[];
  encourage: string[];
  hello: string[];
  sharp: string[];
  city: string[];
  name: string[];
}

const DEFAULT_KEYWORDS: IntentKeywords = {
  sad: ['难过', '崩溃', '烦', '累', '焦虑', '不想干'],
  deep: ['离世', '去世', '想死', '活不下去', '自杀'],
  work: ['代码', 'bug', '报错', '上线', '重构', '开发', '测试', '需求'],
  encourage: ['加油', '鼓励', '打气', '坚持'],
  hello: ['你好', '在吗', 'hi', 'hello'],
  sharp: ['狠话', '直接点', '骂醒'],
  city: ['城市', '标准', '环境'],
  name: ['标签', '昵称', '起名'],
};

export function getIntentKeywords(): IntentKeywords {
  if (current.mode === 'neutral') {
    return {
      ...DEFAULT_KEYWORDS,
      sharp: ['直接点', '提醒我', '推进'],
      city: ['环境', '标准', '选择'],
    };
  }

  if (current.mode === 'intense') {
    return {
      ...DEFAULT_KEYWORDS,
      work: [...DEFAULT_KEYWORDS.work, '卡住', '性能', '回归'],
      encourage: [...DEFAULT_KEYWORDS.encourage, '冲', '顶住'],
      sharp: [...DEFAULT_KEYWORDS.sharp, '硬一点'],
    };
  }

  return DEFAULT_KEYWORDS;
}

const SOFTEN_RULES: Array<[RegExp, string]> = [
  [/狠话/g, '直接建议'],
  [/别跟自己讲道理/g, '先落地一个结果'],
  [/把借口删掉/g, '先缩小范围并执行'],
];

export function applySafety(line: string): string {
  if (!current.safeMode) return line;
  return SOFTEN_RULES.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), line);
}

export function fallbackReply(): string {
  switch (current.mode) {
    case 'neutral':
      return '给我现状、目标、阻塞，我帮你拆。';
    case 'intense':
      return '说重点：现状、目标、阻塞，马上收敛。';
    default:
      return '说重点，我帮你拆。';
  }
}
