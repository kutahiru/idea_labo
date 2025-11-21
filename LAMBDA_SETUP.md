# Lambda関数セットアップガイド

オズボーンのチェックリストのAI生成機能を、AWS Lambda関数で実装するためのセットアップ手順です。

## 概要

OpenAI API呼び出しが27秒かかるため、AWS Amplify HostingのLambdaタイムアウト制限（28-30秒）を回避するために、専用のLambda関数を使用します。

### アーキテクチャ

```
1. ユーザーが「AIで自動入力」クリック
   ↓
2. POST /api/osborn-checklists/[id]/ai-generate
   → AI生成レコード作成（status: pending）
   → Lambda関数を非同期起動
   → 即座にレスポンス返却 ✅ タイムアウト回避
   ↓
3. Lambda関数（最大180秒実行可能）
   → OpenAI API呼び出し（27秒）
   → DB保存
   → AppSync Eventsで通知
   ↓
4. フロントでイベント受信
   → データ再取得
   → トースト表示
```

## セットアップ手順

### 1. Lambda関数のデプロイ

詳細は `lambda/osborn-ai-worker/README.md` を参照してください。

簡易手順：
```bash
cd lambda/osborn-ai-worker
npm install
npm run build
npm run package
```

生成された `function.zip` をAWSコンソールからアップロードします。

**重要な設定:**
- **タイムアウト**: 180秒（3分）
- **メモリ**: 512 MB
- **ランタイム**: Node.js 20.x
- **環境変数**: README.md参照

### 2. 環境変数の設定

#### 2-1. ローカル開発用（`.env.local`）

```bash
# Lambda関数名
LAMBDA_FUNCTION_NAME=osborn-ai-worker

# AWSリージョン
AWS_REGION=ap-northeast-1

# AWS認証情報（ローカル開発時のみ）
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

#### 2-2. Amplify Hosting用

AWSコンソール → **Amplify** → **アプリ** → **環境変数** で以下を追加：

| 変数名 | 値 |
|--------|-----|
| `LAMBDA_FUNCTION_NAME` | `osborn-ai-worker` |
| `AWS_REGION` | `ap-northeast-1` |

**注意**: Amplify HostingからLambda関数を呼び出すため、IAM権限の設定が必要です（次のステップ）。

### 3. IAM権限の設定

Amplify HostingのサービスロールにLambda呼び出し権限を追加します。

#### 3-1. Amplify HostingのサービスロールARNを確認

AWSコンソール → **Amplify** → **アプリ** → **アプリ設定** → **一般**
→ **サービスロール** のARNをコピー

#### 3-2. Lambda関数にリソースベースポリシーを追加

AWSコンソール → **Lambda** → `osborn-ai-worker` → **設定** → **アクセス権限** → **リソースベースのポリシーステートメント** → **ステートメントを追加**

以下の設定で追加：
- **ステートメントID**: `AllowAmplifyInvoke`
- **プリンシパル**: Amplifyのサービスロール ARN
- **アクション**: `lambda:InvokeFunction`
- **ソース ARN**: （空欄でOK）

JSONで直接編集する場合：
```json
{
  "Sid": "AllowAmplifyInvoke",
  "Effect": "Allow",
  "Principal": {
    "AWS": "arn:aws:iam::ACCOUNT_ID:role/amplify-xxxxx"
  },
  "Action": "lambda:InvokeFunction",
  "Resource": "arn:aws:lambda:ap-northeast-1:ACCOUNT_ID:function:osborn-ai-worker"
}
```

**または**、Amplifyのサービスロールに `AWSLambdaRole` ポリシーをアタッチする方法もあります。

### 4. 動作確認

#### 4-1. ローカルでの確認

```bash
npm run dev
```

1. ブラウザでオズボーンのチェックリスト詳細ページを開く
2. 「AIで自動入力」ボタンをクリック
3. CloudWatch Logsでログを確認:
   - ロググループ: `/aws/lambda/osborn-ai-worker`
   - 処理状況を確認

#### 4-2. 本番環境での確認

Amplify Hostingにデプロイ後、同様の手順でテストします。

## トラブルシューティング

### Lambda起動エラー: AccessDeniedException

**原因**: Amplify HostingからLambda関数を呼び出す権限がない

**解決策**:
1. Lambda関数のリソースベースポリシーを確認
2. AmplifyのサービスロールにLambda呼び出し権限があるか確認

### Lambda実行エラー: Database connection failed

**原因**: Lambda関数がVPC内のRDSに接続できない

**解決策**:
1. Lambda関数のVPC設定を確認（RDSと同じVPC・サブネット）
2. セキュリティグループでRDS（5432ポート）への接続を許可
3. NAT Gateway経由でインターネット接続できることを確認（AppSync Events通知用）

### タイムアウトエラー

**原因**: 180秒以内に処理が完了しない

**解決策**:
1. OpenAI APIのタイムアウト設定を確認
2. プロンプトを簡略化
3. Lambda関数のメモリを増やす（メモリに比例してCPU性能も向上）

### AppSync Events通知が届かない

**原因**: Lambda関数からAppSync Eventsに接続できない、またはIAM権限が不足

**解決策**:
1. Lambda関数の環境変数（`APPSYNC_EVENTS_URL`）を確認
2. Lambda関数のIAMロールにAppSync Events発行権限があるか確認（`appsync:EventPublish`）
3. Lambda関数がインターネットに接続できるか確認（VPC内の場合はNAT Gateway必要）
4. CloudWatch Logsでエラーメッセージを確認

**Lambda関数のIAMロールに追加すべきポリシー例**:
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

## ファイル構成

```
/app
├── lambda/
│   └── osborn-ai-worker/
│       ├── index.ts              # Lambda handler
│       ├── package.json          # 依存関係
│       ├── tsconfig.json         # TypeScript設定
│       └── README.md             # デプロイ手順
├── src/
│   └── app/
│       └── api/
│           └── osborn-checklists/
│               └── [id]/
│                   └── ai-generate/
│                       └── route.ts  # Lambda呼び出し
└── LAMBDA_SETUP.md                   # このファイル
```

## 参考リンク

- [AWS Lambda ドキュメント](https://docs.aws.amazon.com/lambda/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [AWS Amplify Hosting](https://docs.aws.amazon.com/amplify/)
