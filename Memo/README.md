# Memo

Password-protected single memo page backed by a GitHub file.

## Files

- `index.html`
- `style.css`
- `script.js`
- `memo.txt`

## Password

The password is set in `script.js`.

```js
const PASSWORD = "papa";
```

## GitHub Pages

Upload these files to the repository used for the site, then enable GitHub Pages for that branch.

This is a static page. The memo body is saved to `Memo/memo.txt` through the GitHub Contents API.

Saving requires a GitHub token with write access to repository contents.
