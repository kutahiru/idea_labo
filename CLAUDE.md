# Claude Code 設定ファイル

## プロジェクト概要
「アイデア研究所」- RUNTEQ生向けのアイデア発想・管理アプリケーション

## 言語設定
- **プライマリ言語**: 日本語
- **コメント・ドキュメント**: 日本語で記述
- **変数名・関数名**: 英語（技術的な慣習に従う）

## 技術スタック

### フロントエンド
- **Framework**: Next.js 15.5.3
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **UI Library**: React 19.1.0

### バックエンド
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM 0.44.5
- **Authentication**: NextAuth.js 5.0.0-beta.29

### 開発ツール
- **Linter**: ESLint 9.x
- **Package Manager**: npm
- **Development Server**: Next.js with Turbopack

## スクリプトコマンド

### 開発
```bash
npm run dev          # 開発サーバー起動（Turbopack使用）
npm run build        # プロダクションビルド（Turbopack使用）
npm run start        # プロダクションサーバー起動
npm run lint         # ESLintチェック
```

### データベース
```bash
npm run db:generate  # Drizzleスキーマからマイグレーションファイル生成
npm run db:migrate   # マイグレーション実行
npm run db:push      # スキーマを直接データベースにプッシュ
npm run db:studio    # Drizzle Studioを起動
```

## プロジェクト構造
```
/app
├── src/
│   ├── db/
│   │   └── schema.ts        # データベーススキーマ定義
│   └── ...
├── public/                  # 静的ファイル
├── drizzle.config.ts       # Drizzle設定
├── next.config.ts          # Next.js設定
├── package.json            # 依存関係とスクリプト
└── tsconfig.json           # TypeScript設定
```

## データベーススキーマ主要テーブル
- `users` - ユーザー情報
- `accounts` - 認証アカウント（複合主キー: provider + providerAccountId）
- `brainwritings` - ブレインライティング
- `brainwriting_users` - ブレインライティング参加者
- `brainwriting_sheets` - ブレインライティングシート
- `brainwriting_inputs` - ブレインライティング入力
- `mandala_arts` - マンダラート
- `mandala_art_inputs` - マンダラート入力
- `osborn_checklists` - オズボーンのチェックリスト
- `idea_categories` - アイデアカテゴリ
- `ideas` - アイデア

## 開発ガイドライン

### コーディング規約
- **命名規則**:
  - ファイル名: kebab-case
  - 変数/関数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - コンポーネント: PascalCase

### Git 運用
- **ブランチ戦略**: GitHub Flow
- **メインブランチ**: `main`
- **現在のブランチ**: `setup/docker-environment`

### 主要機能
1. **ブレインライティング** - 複数人でのアイデア発想
2. **マンダラート** - 9×9マスでのアイデア整理
3. **オズボーンのチェックリスト** - 9つの視点からのアイデア発想
4. **アイデア管理** - カテゴリ別アイデア管理

## 注意事項
- 環境変数 `DATABASE_URL` が必要
- Dockerコンテナでの開発環境
- PostCSS、TailwindCSS設定済み
- ESLint設定済み

## 連絡先・リポジトリ
プロジェクトはRUNTEQ生の卒業制作として開発中