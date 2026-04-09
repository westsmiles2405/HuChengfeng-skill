import { applySafety } from './styleConfig';

const OPENINGS = [
  '别绕弯子，直接说核心问题。',
  '开麦对焦：你现在卡在哪一步？',
  '先把事实摆出来，情绪先放旁边。',
  '好，今天我们做增量，不做空转。',
  '开始吧，我来帮你收敛重点。',
];

const WORK_LINES = [
  '先把最影响结果的点拿下。',
  '你这段已经接近可用了，继续抛光。',
  '别同时改十个地方，先修最痛的。',
  '别怕慢，怕的是原地打转。',
  '一步一步做，进度就会显形。',
];

const ENCOURAGE_LINES = [
  '你能行，先把第一步落地。',
  '现在的焦虑，通常来自目标太大。先切块。',
  '继续，你离解决已经不远。',
  '别等状态，先开始。',
  '先做出一个可验证结果。',
];

const SHARP_LINES = [
  '如果你连下一步都说不清，那就先写下来。',
  '别跟自己讲道理，先交付一个结果。',
  '你不是没时间，是优先级没立住。',
  '把借口删掉，执行就会回来。',
];

const CITY_RULES = [
  '🏙 工作城市标准（开发版）：网络稳定、协作顺畅、反馈快、生活成本可持续。',
  '🏙 选环境别只看热闹：看工具链、人才密度、学习氛围和可持续性。',
  '🏙 对程序员来说，城市价值 = 学习机会 × 协作效率 × 生活稳定。',
];

const JUDGMENT_OPENINGS = [
  '【代码体检】先看错误，再看风格。',
  '【问题定位】优先处理会阻塞交付的项。',
  '【检查报告】如下：',
];

const JUDGMENT_ENDINGS = [
  '【建议】按优先级逐一消除，不要跳步。',
  '【建议】先收敛再扩展。',
  '【建议】处理完再回归测试。',
];

const SOFT_LINES = [
  '先喘口气，别让自己一直高压。',
  '今天先保底完成一件关键事。',
  '你不是掉队，只是节奏乱了。',
  '先把自己照顾好，效率才会回来。',
];

const SERIOUS_LINES = [
  '这件事很重，你先保证自己安全和稳定。',
  '请先停下来，找一个可信任的人聊聊。',
  '先照顾情绪和身体，再谈任务。',
  '你不需要一个人扛，优先求助。',
];

const FOCUS_START = ['对焦开始，先推进主任务。', '计时已开，避免分心。', '进入专注段，目标只留一个。'];
const FOCUS_END = ['专注段结束，给我结果。', '一轮完成，做个小复盘。', '时间到，准备下一轮。'];
const BREAK_REMIND = ['休整一下，五分钟后回来。', '暂停补给，别硬撑。', '短休是为了更稳的下一轮。'];
const BREAK_END = ['回来继续。', '休整结束，重新对焦。', '下一轮开始。'];
const FINALE = ['今天收线，已经有实质推进。', '收工，明天继续稳定输出。', '可以了，今天到位。'];
const IDLE = ['你停很久了，给我一个下一步。', '长时间无操作，回来对焦。', '别让任务悬空，回来收尾。'];
const NICK = ['对焦选手', '执行型玩家', '节奏控制者', '问题终结者', '稳态工程师'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export function getOpening(): string { return applySafety(pick(OPENINGS)); }
export function getWorkLine(): string { return applySafety(pick(WORK_LINES)); }
export function getEncourageLine(): string { return applySafety(pick(ENCOURAGE_LINES)); }
export function getSharpLine(): string { return applySafety(pick(SHARP_LINES)); }
export function getCityRule(): string { return applySafety(pick(CITY_RULES)); }
export function getComfort(): string { return applySafety(pick(SOFT_LINES)); }
export function getSolemnComfort(): string { return applySafety(pick(SERIOUS_LINES)); }
export function getFocusStart(minutes: number): string { return applySafety(`${pick(FOCUS_START)}\n⏱ 专注时间：${minutes} 分钟`); }
export function getFocusEnd(): string { return applySafety(pick(FOCUS_END)); }
export function getBreakRemind(): string { return applySafety(pick(BREAK_REMIND)); }
export function getBreakEnd(): string { return applySafety(pick(BREAK_END)); }
export function getIdleRemind(): string { return applySafety(pick(IDLE)); }
export function getNickname(): string { return applySafety(`今天你的标签：${pick(NICK)}`); }

export function getFinale(done: number): string {
  const base = pick(FINALE);
  return applySafety(done > 0 ? `${base}\n\n📋 今日完成番茄轮次：${done}` : base);
}

export function getJudgment(issues: string[]): string {
  const open = pick(JUDGMENT_OPENINGS);
  const detail = issues.length > 0
    ? `\n【发现】\n${issues.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    : '\n【发现】当前未发现明显错误。';
  return applySafety(`${open}${detail}\n${pick(JUDGMENT_ENDINGS)}`);
}

export function getTimeBasedGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了，建议收尾后休息。';
  if (h < 12) return getOpening();
  if (h < 14) return '午间先补能量，下午再冲。';
  if (h < 18) return '下午是推进窗口，别浪费。';
  return '晚上适合收口，把未完成项列好。';
}
