# オズボーンのチェックリスト AI生成ワーカー Lambda関数

## 概要

このLambda関数は、オズボーンのチェックリストのAI自動生成を長時間実行可能な環境で処理します。

- **実行時間**: 最大3分（180秒）
- **トリガー**: Next.js API Routeから非同期起動
- **処理内容**: OpenAI APIを使用したアイデア生成 → DB保存 → AppSync Events通知
- **ビルド**: esbuild + CommonJS形式

## 技術スタック

- **言語**: TypeScript 5.x
- **モジュール形式**: CommonJS (CJS)
- **バンドラー**: esbuild
- **ランタイム**: Node.js 20.x
- **テスト**: Vitest

## デプロイ手順

### 1. 依存関係のインストールとビルド

```bash
cd lambda/osborn-ai-worker
npm install
npm run build      # esbuildでバンドル（index.js生成、CommonJS形式）
npm run typecheck  # TypeScriptの型チェック（オプション）
```

### 2. デプロイパッケージの作成

```bash
npm run package
```

**注意**: esbuildで全依存関係をバンドルするため、node_modulesは含まれません。CommonJS形式でビルドされます。

### 3. AWSコンソールでLambda関数を作成

#### 3-1. Lambda関数の作成

1. **AWSコンソール** → **Lambda** → **関数の作成**
2. 以下の設定で作成：
   - **関数名**: `osborn-ai-worker`
   - **ランタイム**: Node.js 20.x
   - **アーキテクチャ**: x86_64
   - **実行ロール**: 新しいロールを作成（デフォルト）

#### 3-2. コードのアップロード

1. 作成した関数の **コード** タブを開く
2. **アップロード元** → **.zip ファイル** を選択
3. `function.zip` をアップロード
4. **ハンドラ**: `index.handler` に設定されていることを確認

**重要**: CommonJS形式でビルドされているため:

- **ランタイム設定** → **ハンドラ** が `index.handler` であることを確認
- ファイル名は `index.js` です

#### 3-3. 環境変数の設定

**設定** タブ → **環境変数** → **編集** で以下を追加：

| キー                 | 値                                             | 説明                                       |
| -------------------- | ---------------------------------------------- | ------------------------------------------ |
| `DATABASE_URL`       | `postgresql://user:pass@host:5432/db`          | PostgreSQL接続文字列                       |
| `OPENAI_API_KEY`     | `sk-...`                                       | OpenAI APIキー                             |
| `OPENAI_MODEL`       | `gpt-5-nano`                                   | 使用するモデル                             |
| `APPSYNC_EVENTS_URL` | `https://...appsync-api...amazonaws.com/event` | AppSync EventsエンドポイントURL（IAM認証） |

#### 3-4. タイムアウトの設定

**設定** タブ → **一般設定** → **編集**:

- **タイムアウト**: 3分0秒（180秒）
- **メモリ**: 512 MB（推奨）

#### 3-5. VPC設定（RDSを使用している場合）

**設定** タブ → **VPC** → **編集**:

- データベースと同じVPCを選択
- プライベートサブネットを選択
- セキュリティグループでRDSへの接続を許可

#### 3-6. IAM権限の追加

**設定** タブ → **アクセス権限** → 実行ロールを開く:

実行ロールに以下のポリシーを追加：

- `AWSLambdaVPCAccessExecutionRole`（VPC使用時）
- カスタムポリシー（AppSync Events発行権限、IAM認証）:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "appsync:EventPublish",
      "Resource": "arn:aws:appsync:ap-northeast-1:*:apis/YOUR_APPSYNC_API_ID/*"
    }
  ]
}
```

**注意**: `YOUR_APPSYNC_API_ID` は実際のAppSync APIのIDに置き換えてください。

### 4. Lambda関数名をメモ

次のステップで使用するため、Lambda関数のARNまたは関数名をメモしてください：

- **関数名**: `osborn-ai-worker`
- **ARN**: `arn:aws:lambda:ap-northeast-1:ACCOUNT_ID:function:osborn-ai-worker`

## プログラムの遷移

Lambda関数の処理フローは以下の通りです：

```
1. Next.js API Route → Lambda関数を非同期起動
   ↓
2. Lambda Handler (index.ts:129)
   ↓
3. ステータスを「処理中」に更新
   ↓
4. オズボーンチェックリストをDBから取得
   ↓
5. OpenAI APIでアイデア生成（最大3分）
   ├─ テーマの妥当性判断
   └─ 9つの視点からアイデア生成
   ↓
6. 生成結果をDBに保存
   └─ 既存入力が空でない場合はスキップ
   ↓
7. ステータスを「完了」に更新
   ↓
8. AppSync Eventsで通知
   └─ Next.jsアプリがリアルタイムで受信
```

### エラー処理

- テーマ不適切 → ステータス「失敗」+ エラーメッセージ保存 → 通知
- API エラー → ステータス「失敗」+ エラーメッセージ保存 → 通知
- タイムアウト → Lambda自動終了（180秒）

詳細な統合手順・テスト・トラブルシューティングについては、[POST_DEPLOYMENT.md](./POST_DEPLOYMENT.md) を参照してください。
