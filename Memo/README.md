# Memo

Password-protected single memo page backed by a GitHub file through a small API.

## Files

- `index.html`
- `style.css`
- `script.js`
- `memo.txt`
- `api/worker.js`

## Password

The password is set in `script.js`.

```js
const PASSWORD = "papa";
```

## GitHub Pages

Upload these files to the repository used for the site, then enable GitHub Pages for that branch.

This is a static page. The memo body is saved to `Memo/memo.txt` through the API worker.

The GitHub token is stored only as an API secret. It is not entered into the page.

## API

Deploy `api/worker.js` to Cloudflare Workers and set these secrets or variables:

- `GITHUB_TOKEN`: GitHub token with `yshinada/web` Contents read/write access
- `MEMO_PASSWORD`: `papa`
- `OWNER`: `yshinada`
- `REPO`: `web`
- `BRANCH`: `main`
- `MEMO_PATH`: `Memo/memo.txt`

If the Worker URL is not `https://memo-api.yshinada.workers.dev`, update `API_URL` in `script.js`.
