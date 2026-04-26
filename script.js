const programs = [
  {
    name: "YsClock",
    platform: "mac",
    version: "v1.0.0",
    icon: "YC",
    color: "#0d6f8f",
    summary: "デスクトップに置きやすい、シンプルなアナログ時計アプリです。",
    tags: ["macOS", "時計", "ユーティリティ"],
    download: "#"
  },
  {
    name: "YsBatteryMonitor",
    platform: "mac",
    version: "v1.0.0",
    icon: "YB",
    color: "#4f7f63",
    summary: "バッテリー状態を見やすく確認するための軽量モニターです。",
    tags: ["macOS", "バッテリー", "常駐"],
    download: "#"
  },
  {
    name: "Sapporo Nishi Weather",
    platform: "windows",
    version: "v1.0.0",
    icon: "SW",
    color: "#b86434",
    summary: "札幌市西区の天気を素早く確認できるWindows向けツールです。",
    tags: ["Windows", "天気", "地域情報"],
    download: "#"
  }
];

const list = document.querySelector("#program-list");
const filterButtons = document.querySelectorAll(".filter");
const year = document.querySelector("#year");

function createProgramCard(program) {
  const card = document.createElement("article");
  card.className = "program-card";
  card.dataset.platform = program.platform;
  card.innerHTML = `
    <div class="program-icon" style="--icon-bg: ${program.color}">${program.icon}</div>
    <div class="program-meta">
      <span class="pill">${program.platform === "mac" ? "Mac" : "Windows"}</span>
      <span class="pill">${program.version}</span>
    </div>
    <h3>${program.name}</h3>
    <p>${program.summary}</p>
    <div class="tag-row">
      ${program.tags.map((tag) => `<span class="pill">${tag}</span>`).join("")}
    </div>
    <div class="card-actions">
      <a class="button primary" href="${program.download}">ダウンロード</a>
      <a class="button secondary" href="#support">問い合わせ</a>
    </div>
  `;
  return card;
}

function renderPrograms(filter = "all") {
  list.replaceChildren();
  programs
    .filter((program) => filter === "all" || program.platform === filter)
    .forEach((program) => list.appendChild(createProgramCard(program)));
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderPrograms(button.dataset.filter);
  });
});

year.textContent = new Date().getFullYear();
renderPrograms();
