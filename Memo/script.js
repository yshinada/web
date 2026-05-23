const PASSWORD = "papa";
const OWNER = "yshinada";
const REPO = "web";
const BRANCH = "main";
const MEMO_PATH = "Memo/memo.txt";
const TOKEN_STORAGE_KEY = "memo-github-token";
const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${MEMO_PATH}`;
const RAW_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${MEMO_PATH}`;

const passwordForm = document.querySelector("#password-form");
const passwordInput = document.querySelector("#password");
const message = document.querySelector("#message");
const editor = document.querySelector("#editor");
const tokenInput = document.querySelector("#github-token");
const rememberTokenInput = document.querySelector("#remember-token");
const clearTokenButton = document.querySelector("#clear-token-button");
const memoInput = document.querySelector("#memo");
const saveButton = document.querySelector("#save-button");
const lockButton = document.querySelector("#lock-button");
const statusText = document.querySelector("#status");

tokenInput.value = localStorage.getItem(TOKEN_STORAGE_KEY) || "";

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

async function loadMemo() {
  statusText.textContent = "読み込み中です";

  const response = await fetch(`${RAW_URL}?t=${Date.now()}`);

  if (response.status === 404) {
    memoInput.value = "";
    statusText.textContent = "新しいメモです";
    return;
  }

  if (!response.ok) {
    throw new Error("メモを読み込めませんでした");
  }

  memoInput.value = await response.text();
  statusText.textContent = "GitHubのメモを読み込みました";
}

async function getMemoSha(token) {
  const response = await fetch(`${API_URL}?ref=${BRANCH}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("GitHubのファイル情報を取得できませんでした");
  }

  const file = await response.json();
  return file.sha;
}

async function saveMemo() {
  const token = tokenInput.value.trim();

  if (!token) {
    statusText.textContent = "GitHub Tokenを入力してください";
    tokenInput.focus();
    return;
  }

  saveButton.disabled = true;
  statusText.textContent = "GitHubに保存中です";

  try {
    if (rememberTokenInput.checked) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    const sha = await getMemoSha(token);
    const body = {
      branch: BRANCH,
      content: encodeBase64(memoInput.value),
      message: "Update Memo",
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(API_URL, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("GitHubへの保存に失敗しました");
    }

    statusText.textContent = "GitHubに保存しました";
  } catch (error) {
    statusText.textContent = error.message;
  } finally {
    saveButton.disabled = false;
  }
}

async function openEditor() {
  editor.hidden = false;
  passwordInput.value = "";
  message.textContent = "";
  message.classList.remove("error");
  tokenInput.value = localStorage.getItem(TOKEN_STORAGE_KEY) || tokenInput.value;

  if (tokenInput.value) {
    memoInput.focus();
  } else {
    tokenInput.focus();
  }

  try {
    await loadMemo();
  } catch (error) {
    statusText.textContent = error.message;
  }
}

function lockEditor() {
  editor.hidden = true;
  memoInput.value = "";
  statusText.textContent = "";
  passwordInput.focus();
}

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (passwordInput.value === PASSWORD) {
    openEditor();
    return;
  }

  message.textContent = "パスワードが違います";
  message.classList.add("error");
  passwordInput.select();
});

saveButton.addEventListener("click", saveMemo);

clearTokenButton.addEventListener("click", () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  tokenInput.value = "";
  statusText.textContent = "保存したTokenを削除しました";
  tokenInput.focus();
});

memoInput.addEventListener("input", () => {
  statusText.textContent = "未保存の変更があります";
});

lockButton.addEventListener("click", lockEditor);
