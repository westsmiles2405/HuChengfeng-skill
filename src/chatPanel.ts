import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { HcfStats } from './stats';

function getNonce(): string { return crypto.randomBytes(16).toString('hex'); }

interface PendingMessage {
  from: 'hcf' | 'user';
  text: string;
}

export class HcfChatPanel implements vscode.WebviewViewProvider {
  public static readonly viewType = 'hcf.chatPanel';
  private view?: vscode.WebviewView;
  private messages: PendingMessage[] = [];
  private onUserMessage?: (text: string) => void;
  private latestStats?: HcfStats;

  constructor(private readonly extensionUri: vscode.Uri) { }

  public setOnUserMessage(handler: (text: string) => void): void { this.onUserMessage = handler; }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true, localResourceRoots: [this.extensionUri] };
    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage((data: unknown) => {
      if (!data || typeof data !== 'object') return;
      const payload = data as { type?: unknown; text?: unknown };
      if (payload.type === 'userMessage' && typeof payload.text === 'string') {
        const trimmed = payload.text.trim();
        if (trimmed && trimmed.length <= 500) {
          this.messages.push({ from: 'user', text: trimmed });
          this.trimMessages();
          this.syncMessages();
          this.onUserMessage?.(trimmed);
        }
      }
    });

    this.syncMessages();
  }

  public addBotMessage(text: string): void {
    this.messages.push({ from: 'hcf', text });
    this.trimMessages();
    this.syncMessages();
  }

  public updateStats(stats: HcfStats): void {
    this.latestStats = stats;
    if (this.view) this.view.webview.postMessage({ type: 'updateStats', stats });
  }

  private trimMessages(): void {
    const MAX = 200;
    if (this.messages.length > MAX) this.messages = this.messages.slice(this.messages.length - MAX);
  }

  private syncMessages(): void {
    if (!this.view) return;
    this.view.webview.postMessage({ type: 'messages', messages: this.messages });
    if (this.latestStats) this.view.webview.postMessage({ type: 'updateStats', stats: this.latestStats });
  }

  private getHtml(): string {
    const nonce = getNonce();
    return `<!DOCTYPE html><html lang="zh-CN"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
<title>户晨风对焦室</title>
<style nonce="${nonce}">
:root{--a:#8aa8ff;--b:#3a4a6a;--bg:var(--vscode-editor-background,#1e1e2e);--fg:var(--vscode-editor-foreground,#cdd6f4)}
*{box-sizing:border-box}body{margin:0;font-family:var(--vscode-font-family,'Segoe UI',sans-serif);background:var(--bg);color:var(--fg);height:100vh;display:flex;flex-direction:column}
.header{padding:12px 16px;border-bottom:1px solid var(--a);text-align:center;color:var(--a);font-weight:600}
.header span{display:block;font-size:12px;color:#b2c2f0}
.stats{display:flex;justify-content:space-around;padding:8px 12px;border-bottom:1px solid rgba(138,168,255,.25);font-size:11px}
.stat{display:flex;flex-direction:column;align-items:center;gap:2px}.v{font-size:16px;font-weight:700;color:#bfd0ff}
#chat{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px}
.msg{max-width:90%;padding:8px 12px;border-radius:12px;font-size:13px;line-height:1.5;display:flex;gap:8px}
.msg .avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.msg .name{font-size:11px;margin-bottom:4px;font-weight:600}
.msg.hcf{align-self:flex-start;background:rgba(138,168,255,.12);border:1px solid rgba(138,168,255,.25)}
.msg.hcf .name{color:var(--a)}.msg.hcf .avatar{background:rgba(58,74,106,.3)}
.msg.user{align-self:flex-end;flex-direction:row-reverse;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18)}
.msg.user .name{text-align:right;color:#d7dde8}.msg.user .avatar{background:rgba(255,255,255,.16)}
.input{display:flex;padding:8px 12px;gap:8px;border-top:1px solid rgba(138,168,255,.25)}
#userInput{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(138,168,255,.3);color:var(--fg);border-radius:8px;padding:6px 10px;outline:none}
#sendBtn{background:var(--a);color:#1e1e2e;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-weight:600}
</style></head><body>
<div class="header">🎯 户晨风对焦室<span>直面问题 · 快速收敛 · 稳定推进</span></div>
<div class="stats"><div class="stat"><span class="v" id="p">0</span><span>🍅 番茄</span></div><div class="stat"><span class="v" id="m">0</span><span>💬 对话</span></div><div class="stat"><span class="v" id="s">0</span><span>💾 保存</span></div></div>
<div id="chat"></div><div class="input"><input id="userInput" maxlength="500" placeholder="说重点…"/><button id="sendBtn">发送</button></div>
<script nonce="${nonce}">
const vscode=acquireVsCodeApi();const chat=document.getElementById('chat');const input=document.getElementById('userInput');const btn=document.getElementById('sendBtn');
function send(){var t=input.value.trim();if(!t)return;vscode.postMessage({type:'userMessage',text:t});input.value=''}
btn.addEventListener('click',send);input.addEventListener('keydown',e=>{if(e.key==='Enter')send()});
window.addEventListener('message',e=>{var msg=e.data;if(msg.type==='messages')render(msg.messages);if(msg.type==='updateStats')stats(msg.stats)});
function stats(s){document.getElementById('p').textContent=s.todayPomodoros||0;document.getElementById('m').textContent=s.todayMessages||0;document.getElementById('s').textContent=s.todaySaves||0}
function render(msgs){chat.innerHTML='';for(var i=0;i<msgs.length;i++){var x=msgs[i];var d=document.createElement('div');d.className='msg '+x.from;var a=document.createElement('span');a.className='avatar';a.textContent=x.from==='hcf'?'🎯':'💻';var b=document.createElement('div');var n=document.createElement('div');n.className='name';n.textContent=x.from==='hcf'?'户晨风':'你';var c=document.createElement('div');c.textContent=x.text;b.appendChild(n);b.appendChild(c);d.appendChild(a);d.appendChild(b);chat.appendChild(d)}chat.scrollTop=chat.scrollHeight}
</script></body></html>`;
  }
}
