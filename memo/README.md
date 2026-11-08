# Memo

URL: https://yshinada.github.io/web/memo/

GitHub Pagesで動くメモ帳。保存先は公開リポジトリ `yshinada/web` の `memo/memo.txt`（mainブランチ）。本文と変更履歴は公開されます。

## 使い方

ページを開くとGitHubから本文を読み込みます。編集した下書きはブラウザーに自動保存されます。「GitHubに保存」または Cmd/Ctrl+S で変更をコミットします。

初回は「GitHub接続設定」からfine-grained personal access tokenを入力します。対象はwebのみ、Contents: Read and write。トークンは画面を開いている間のメモリー内だけで保持し、ローカルストレージやGitHubへ保存しません。リロードすると再入力が必要です。

ファイルのSHAを指定して更新するため、他の端末の変更を無条件で上書きしません。競合時は下書きをダウンロードし、再読み込みした内容と統合してください。通信エラー時も入力は画面に残ります。

`api/` は旧版の参考実装です。現在のページはWorkerを使わずGitHub Contents APIを直接呼び出します。旧版のパスワード認証は使用しません。
