const DEFAULT_OWNER = "yshinada";
const DEFAULT_REPO = "web";
const DEFAULT_BRANCH = "main";
const DEFAULT_MEMO_PATH = "Memo/memo.txt";
const ALLOWED_ORIGIN = "https://yshinada.github.io";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Content-Type": "application/json; charset=utf-8",
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    headers: corsHeaders(origin),
    status,
  });
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function fromBase64(text) {
  const binary = atob(text.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function config(env) {
  return {
    branch: env.BRANCH || DEFAULT_BRANCH,
    memoPath: env.MEMO_PATH || DEFAULT_MEMO_PATH,
    owner: env.OWNER || DEFAULT_OWNER,
    password: env.MEMO_PASSWORD || "papa",
    repo: env.REPO || DEFAULT_REPO,
    token: env.GITHUB_TOKEN,
  };
}

function githubUrl(settings) {
  return `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${settings.memoPath}`;
}

function githubHeaders(settings) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${settings.token}`,
    "Content-Type": "application/json",
    "User-Agent": "memo-worker",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function readMemo(settings) {
  const response = await fetch(`${githubUrl(settings)}?ref=${settings.branch}`, {
    headers: githubHeaders(settings),
  });

  if (response.status === 404) {
    return { memo: "", sha: null };
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "GitHubからメモを読み込めませんでした");
  }

  const file = await response.json();
  return {
    memo: fromBase64(file.content || ""),
    sha: file.sha,
  };
}

async function writeMemo(settings, memo) {
  const current = await readMemo(settings);
  const body = {
    branch: settings.branch,
    content: toBase64(memo),
    message: "Update Memo",
  };

  if (current.sha) {
    body.sha = current.sha;
  }

  const response = await fetch(githubUrl(settings), {
    body: JSON.stringify(body),
    headers: githubHeaders(settings),
    method: "PUT",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "GitHubへ保存できませんでした");
  }
}

function checkPassword(value, settings) {
  return value === settings.password;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const settings = config(env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(origin),
        status: 204,
      });
    }

    if (!settings.token) {
      return json({ message: "APIにGITHUB_TOKENが設定されていません" }, 500, origin);
    }

    try {
      if (request.method === "GET" && url.pathname === "/memo") {
        const password = url.searchParams.get("password") || "";

        if (!checkPassword(password, settings)) {
          return json({ message: "パスワードが違います" }, 401, origin);
        }

        const data = await readMemo(settings);
        return json({ memo: data.memo }, 200, origin);
      }

      if (request.method === "POST" && url.pathname === "/memo") {
        const body = await request.json();

        if (!checkPassword(body.password || "", settings)) {
          return json({ message: "パスワードが違います" }, 401, origin);
        }

        await writeMemo(settings, body.memo || "");
        return json({ ok: true }, 200, origin);
      }

      return json({ message: "Not found" }, 404, origin);
    } catch (error) {
      return json({ message: error.message }, 500, origin);
    }
  },
};
