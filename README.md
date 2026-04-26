# Yuji Software 公開サイト

個人開発プログラムの配布用サイトです。

## ファイル

- `index.html`: サイト本体
- `style.css`: デザイン
- `script.js`: 公開プログラム一覧
- `assets/hero-software-workspace.png`: ヒーロー画像

## プログラム情報の変更

`script.js` の `programs` 配列を編集します。

```js
{
  name: "アプリ名",
  platform: "mac",
  version: "v1.0.0",
  summary: "説明文",
  tags: ["macOS", "時計"],
  download: "https://example.com/download.zip"
}
```

`download: "#"` は仮リンクです。実際の ZIP / DMG / EXE のURLに差し替えてください。

## ローカル確認

`index.html` をブラウザで開くと確認できます。静的サイトなので、サーバーなしでも動きます。

## WordPress.com に載せる場合

WordPress.com のプランやテーマによって、JavaScript や外部CSSの扱いが異なります。

確実に運用するなら、まずこのサイトをプレビューして内容を固め、WordPress 側では固定ページに同じ見出し・説明文・ダウンロードリンクを配置する方法が安定です。独自CSSやJavaScriptが使えるプランなら、この構成をそのまま移植できます。
