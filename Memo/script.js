const PASSWORD = "papa";
const STORAGE_KEY = "single-private-memo";

const passwordForm = document.querySelector("#password-form");
const passwordInput = document.querySelector("#password");
const message = document.querySelector("#message");
const editor = document.querySelector("#editor");
const memoInput = document.querySelector("#memo");
const saveButton = document.querySelector("#save-button");
const lockButton = document.querySelector("#lock-button");
const statusText = document.querySelector("#status");

function openEditor() {
  editor.hidden = false;
  passwordInput.value = "";
  message.textContent = "";
  message.classList.remove("error");
  memoInput.value = localStorage.getItem(STORAGE_KEY) || "";
  memoInput.focus();
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

saveButton.addEventListener("click", () => {
  localStorage.setItem(STORAGE_KEY, memoInput.value);
  statusText.textContent = "保存しました";
});

memoInput.addEventListener("input", () => {
  statusText.textContent = "未保存の変更があります";
});

lockButton.addEventListener("click", lockEditor);
