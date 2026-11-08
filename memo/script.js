'use strict';
const API = 'https://api.github.com/repos/yshinada/web/contents/memo/memo.txt';
const DRAFT = 'yshinada-web-memo-draft-v1';
const $ = id => document.getElementById(id);
let token = '', sha = null, baseline = '', loaded = false, busy = false;
function status(text, error = false) { $('status').textContent = text; $('status').classList.toggle('error', error); }
function dirty() { return loaded && $('memo').value !== baseline; }
function controls() { $('save').disabled = busy || !loaded; $('reload').disabled = busy; $('count').textContent = `${Array.from($('memo').value).length.toLocaleString('ja-JP')} 文字`; }
function draft() {
  try {
    if (dirty()) localStorage.setItem(DRAFT, JSON.stringify({value:$('memo').value, baseSha:sha}));
    else localStorage.removeItem(DRAFT);
    return true;
  } catch { return false; }
}
async function request(method = 'GET', body) {
  const headers = {Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const response = await fetch(API + (method === 'GET' ? '?ref=main' : ''), {method, headers, cache:'no-store', body: body ? JSON.stringify(body) : undefined, signal:AbortSignal.timeout(20000)});
  if (!response.ok) {
    const errors = {401:'トークンが無効か期限切れです。接続設定を確認してください。',403:'GitHubの書き込み権限、または利用上限を確認してください。',404:'保存先が見つからないか、トークンのアクセス権限がありません。',409:'ほかの場所でメモが更新されています。下書きをダウンロードしてから再読み込みし、変更を統合してください。',422:'保存できませんでした。ファイルの更新状態と内容を確認してください。'};
    throw new Error(errors[response.status] || `GitHubへの接続に失敗しました（${response.status}）。`);
  }
  return response.json();
}
function encode(text) { const bytes = new TextEncoder().encode(text); let binary=''; for (const byte of bytes) binary += String.fromCharCode(byte); return btoa(binary); }
function decode(text) { return new TextDecoder().decode(Uint8Array.from(atob(text.replace(/\s/g,'')), c=>c.charCodeAt(0))); }
async function load(restore = false) {
  if (busy) return;
  if (!restore && dirty() && !confirm('未保存の下書きを破棄してGitHubから読み直しますか？')) return;
  busy = true; $('memo').disabled = true; controls(); status('GitHubから読み込み中…');
  try {
    const data = await request();
    if (data.encoding !== 'base64') throw new Error('メモが大きすぎるため読み込めません。GitHubで確認してください。');
    baseline = decode(data.content); sha = data.sha; $('memo').value = baseline; loaded = true;
    let saved;
    try { saved = restore ? JSON.parse(localStorage.getItem(DRAFT)) : null; } catch {}
    if (saved && typeof saved.value === 'string' && typeof saved.baseSha === 'string' && saved.value !== baseline) {
      $('memo').value = saved.value; sha = saved.baseSha;
      status(saved.baseSha === data.sha ? '未保存の下書きを復元しました。' : '下書きを復元しました。GitHubにも更新があります。保存前に内容を確認してください。', saved.baseSha !== data.sha);
    } else { draft(); status('GitHubのメモを読み込みました。'); }
  } catch(error) { status(error.message || '読み込みに失敗しました。再読み込みしてください。',true); }
  finally { busy = false; $('memo').disabled = !loaded; controls(); }
}
async function save() {
  if (busy || !loaded) return;
  if (!token) { $('settings').open = true; $('token').focus(); status('保存するには、GitHub接続設定でトークンを入力してください。'); return; }
  if (!dirty()) { status('変更はありません。GitHubに保存済みです。'); return; }
  const value = $('memo').value;
  if (new TextEncoder().encode(value).length > 900000) { status('メモが大きすぎます。900KB以内にしてください。',true); return; }
  busy = true; controls(); status('GitHubに保存中…');
  try {
    const data = await request('PUT',{message:'Update memo',content:encode(value),sha,branch:'main'});
    sha = data.content.sha; baseline = value; const backedUp = draft();
    status(dirty() ? (backedUp ? '送信した内容を保存しました。その後の変更は下書きに残っています。' : '送信した内容を保存しました。その後の変更はブラウザーに保存できていません。') : `GitHubに保存しました · ${new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})}`);
  } catch(error) { status((error.message || '通信に失敗しました。') + ' 入力内容は画面に残っています。',true); }
  finally { busy = false; controls(); }
}
$('memo').addEventListener('input',()=>{ const ok=draft(); controls(); if (!busy) status(ok ? (dirty() ? '下書きをブラウザーに保存しました · GitHubは未保存' : 'GitHubに保存済みです。') : '下書きをブラウザーに保存できません。画面を閉じる前にGitHubへ保存してください。',!ok); });
$('connect-form').addEventListener('submit',event=>{ event.preventDefault(); token=$('token').value.trim(); $('token').value=''; $('connection').textContent='トークン設定済み'; $('settings').open=false; status('トークンを設定しました。保存ボタンでGitHubへ送信できます。'); });
$('disconnect').addEventListener('click',()=>{ token=''; $('token').value=''; $('connection').textContent='未接続'; status('GitHub接続を解除しました。'); });
$('save').addEventListener('click',save); $('reload').addEventListener('click',()=>load());
$('download').addEventListener('click',()=>{ const url=URL.createObjectURL(new Blob([$('memo').value],{type:'text/plain;charset=utf-8'})); const a=document.createElement('a'); a.href=url; a.download='memo.txt'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); });
document.addEventListener('keydown',event=>{ if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase()==='s') {event.preventDefault();save();} });
window.addEventListener('beforeunload',event=>{ if (dirty() || busy) {event.preventDefault();event.returnValue='';} });
load(true);
