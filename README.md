# Felix App Specs

Felix Apps 各アプリの画面仕様書・画面遷移図・データモデルを管理するリポジトリ。

公開URL: <https://kotaroblog.github.io/app-specs/>

## ディレクトリ構成

```
app-specs/
├── index.html              # アプリ一覧ポータル
├── assets/
│   └── css/style.css       # 共通スタイル（モバイル対応・ダークモード対応）
├── _template/              # 新規アプリ用テンプレート
│   ├── index.html
│   └── screens/_screen-template.html
├── workoutdiary/
│   ├── index.html          # アプリトップ
│   ├── flow.html           # 画面遷移図（Mermaid）
│   ├── data-model.html     # データモデル（SwiftData）
│   └── screens/            # 画面ごとの仕様書
├── studystopwatch/
├── dailytips/
└── bookspark/
```

## 新しい画面仕様書を追加する手順

1. `_template/screens/_screen-template.html` をコピー
2. 配置先: `[アプリ名]/screens/[画面ID].html`
3. アプリの `index.html` の「画面仕様書」セクションにカードを追加
4. `git push` → 自動でGitHub Pagesに反映（数十秒〜2分）

## 編集ワークフロー

- **Web Claude**でartifactとしてHTML生成 → ダウンロード → 配置
- もしくは **Claude Code** に直接「[アプリ名]/screens/[画面名].html を作って」と指示

## 注意

- 検索エンジン除外: 全ページに `<meta name="robots" content="noindex, nofollow">` を設定
- 認証: なし（URLを知っている人なら誰でも閲覧可能）
- 機密情報（APIキー、課金ロジック詳細、サーバー連携の認証フロー）は記載しない
