# Personal App Specs

個人開発アプリの画面仕様書・機能仕様書・各種設計書を管理するリポジトリ。

公開URL: <https://kotaroblog.github.io/app-specs-personal/>

関連リポジトリ: [app-specs-felix](https://github.com/kotaroblog/app-specs-felix)（フェリックス共同開発）

## 対象アプリ

### リリース済
- WorkoutDiary（筋トレ記録）
- StudyStopwatch（学習タイマー）
- PieceZen（ジグソーパズル）
- CHROMATIC（色記憶パズル）

### 開発中
- BookSpark（読書メモ）
- RoutineReel（ルーティン動画）

### 企画中
- ITパスポート対策
- ポーカーレッスン -プリフロップ-
- BlockPuzzle

## ディレクトリ構成

```
app-specs-personal/
├── index.html              # ポータル（アプリ一覧）
├── assets/css/style.css    # 共通スタイル（モバイル対応・ダークモード対応）
├── _template/              # 仕様書テンプレ集
│   ├── index.html                          # アプリトップ
│   ├── _flow-template.html                 # 画面遷移図
│   ├── _data-model-template.html           # データモデル
│   ├── _error-design-template.html         # エラー設計
│   ├── _logging-template.html              # ロギング方針
│   ├── _aso-template.html                  # ASOキーワード戦略
│   ├── _glossary-template.html             # 用語集・ドメイン辞書
│   ├── screens/_screen-template.html       # 画面仕様書
│   └── features/_feature-template.html     # 機能仕様書
├── workoutdiary/
│   ├── index.html
│   ├── flow.html
│   ├── data-model.html
│   ├── screens/
│   └── features/
└── （他アプリも同構成）
```

## 仕様書の種類

| 種類 | スコープ | ファイル |
|------|---------|---------|
| 画面一覧 | アプリトップ | `[app]/index.html` |
| 画面仕様書 | 1画面ごと | `[app]/screens/[画面ID].html` |
| 機能仕様書 | 画面横断の機能 | `[app]/features/[機能ID].html` |
| 画面遷移図 | アプリ全体 | `[app]/flow.html` |
| データモデル | アプリ全体 | `[app]/data-model.html` |
| エラー設計 | アプリ全体 | `[app]/error-design.html` |
| ロギング方針 | アプリ全体 | `[app]/logging.html` |
| ASOキーワード戦略 | アプリ全体 | `[app]/aso.html` |
| 用語集・ドメイン辞書 | アプリ全体 | `[app]/glossary.html` |

各仕様書には**変更履歴**セクションを設置。バージョン・日付・変更内容を追記する。

## 仕様書を追加する手順

1. 該当テンプレを `_template/` からコピー
2. 配置先パスへ保存
3. アプリの `index.html` のカードリストに追加
4. `git push` → GitHub Pagesに自動反映（30秒〜2分）

## 編集ワークフロー

- **Web Claude** で artifact として HTML 生成 → ダウンロード → 配置
- もしくは **Claude Code** に「[アプリ名]/screens/[画面名].html を作って」と指示

## 注意事項

- 検索エンジン除外: 全ページに `<meta name="robots" content="noindex, nofollow">` 設定済み
- 認証なし（URL を知っている人なら閲覧可）
- **機密情報を書かない**: APIキー、課金実装の内部ロジック詳細、サーバー認証フロー詳細
