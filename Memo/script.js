const PASSWORD = "papa";
const API_URL = "https://memo-api.yshinada.workers.dev";

const passwordForm = document.querySelector("#password-form");
const passwordInput = document.querySelector("#password");
const message = document.querySelector("#message");
const editor = document.querySelector("#editor");
const memoInput = document.querySelector("#memo");
const saveButton = document.querySelector("#save-button");
const lockButton = document.querySelector("#lock-button");
const statusText = document.querySelector("#status");

let currentPassword = "";

async function requestMemo(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "APIへの接続に失敗しました");
  }

  return data;
}

async function loadMemo() {
  statusText.textContent = "読み込み中です";

  const data = await requestMemo(`/memo?password=${encodeURIComponent(currentPassword)}`);
  memoInput.value = data.memo || "";
  statusText.textContent = "GitHubのメモを読み込みました";
}

async function saveMemo() {
  saveButton.disabled = true;
  statusText.textContent = "GitHubに保存中です";

  try {
    await requestMemo("/memo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memo: memoInput.value,
        password: currentPassword,
      }),
    });

    statusText.textContent = "GitHubに保存しました";
  } catch (error) {
    statusText.textContent = error.message;
  } finally {
    saveButton.disabled = false;
  }
}

async function openEditor() {
  currentPassword = passwordInput.value;
  editor.hidden = false;
  passwordInput.value = "";
  message.textContent = "";
  message.classList.remove("error");
  memoInput.focus();

  try {
    await loadMemo();
  } catch (error) {
    statusText.textContent = error.message;
  }
}

function lockEditor() {
  currentPassword = "";
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

memoInput.addEventListener("input", () => {
  statusText.textContent = "未保存の変更があります";
});

lockButton.addEventListener("click", lockEditor);
