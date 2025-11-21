# Lambda関数デプロイ後の設定ガイド

AWS LambdaでLambda関数を作成した後、以下の手順で統合します。

## 📋 前提条件

- Lambda関数 `osborn-ai-worker` をAWSに作成済み
- `function.zip` (109KB) をアップロード済み

## 🔧 1. Lambda関数の環境変数を設定

AWSコンソール → **Lambda** → `osborn-ai-worker` → **設定** → **環境変数**

以下の環境変数を追加：

| キー | 値 | 取得元 |
|------|-----|--------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | RDSの接続文字列 |
| `OPENAI_API_KEY` | `sk-...` | OpenAIダッシュボード |
| `OPENAI_MODEL` | `gpt-5-nano` | 使用するモデル名 |
| `APPSYNC_EVENTS_URL` | `https://...amazonaws.com/event` | `.env.local`の`NEXT_PUBLIC_APPSYNC_EVENTS_URL` |
| `APPSYNC_API_KEY` | `da2-...` | `.env.local`の`NEXT_PUBLIC_APPSYNC_API_KEY` |

## 🔐 2. IAM権限の設定

### 2-1. Lambda実行ロールの権限

Lambda関数が以下にアクセスできるよう設定：

1. **VPC アクセス**（RDS接続用）
   - `AWSLambdaVPCAccessExecutionRole` ポリシーをアタッチ

2. **AppSync Events**（通知用）
   - カスタムポリシーを作成：
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["appsync:GraphQL"],
         "Resource": "arn:aws:appsync:ap-northeast-1:*:apis/*/types/*/fields/*"
       }
     ]
   }
   ```

### 2-2. Next.jsアプリからLambda呼び出し権限

#### ローカル開発環境の場合

`.env.local` にAWS認証情報を追加：

```bash
# AWS認証情報（ローカル開発時のみ）
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

IAMユーザーに以下のポリシーをアタッチ：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["lambda:InvokeFunction"],
      "Resource": "arn:aws:lambda:ap-northeast-1:ACCOUNT_ID:function:osborn-ai-worker"
    }
  ]
}
```

#### 本番環境（Amplify Hosting）の場合

Amplifyのサービスロールに Lambda呼び出し権限を追加：

1. **AWSコンソール** → **Amplify** → **アプリ** → **アプリ設定** → **一般**
2. **サービスロール** のARNを確認
3. **IAM** → **ロール** → Amplifyのサービスロールを開く
4. 以下のポリシーをアタッチ：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["lambda:InvokeFunction"],
      "Resource": "arn:aws:lambda:ap-northeast-1:ACCOUNT_ID:function:osborn-ai-worker"
    }
  ]
}
```

## 🌐 3. VPC設定（RDSを使用している場合）

Lambda関数がRDSに接続できるよう設定：

**設定** → **VPC** → **編集**:
- **VPC**: RDSと同じVPCを選択
- **サブネット**: プライベートサブネットを選択
- **セキュリティグループ**: RDSへの接続を許可するSGを選択

### セキュリティグループの設定

RDSのセキュリティグループで、Lambda関数のSGからポート5432への接続を許可：

- **タイプ**: PostgreSQL
- **ポート**: 5432
- **ソース**: Lambda関数のセキュリティグループ

## ✅ 4. 動作確認

### 4-1. Lambda関数の単体テスト

AWSコンソール → **Lambda** → `osborn-ai-worker` → **テスト**

テストイベントを作成：

```json
{
  "generationId": 1,
  "osbornChecklistId": 1,
  "userId": "your-actual-user-id"
}
```

**注意**: 実際のDBに存在するIDを使用してください。

### 4-2. Next.jsアプリからのテスト

1. アプリを起動：
   ```bash
   npm run dev
   ```

2. オズボーンのチェックリスト詳細ページを開く

3. 「AIで自動入力」ボタンをクリック

4. CloudWatch Logsで確認：
   - ロググループ: `/aws/lambda/osborn-ai-worker`
   - Lambda関数が起動され、AI生成が実行されることを確認

5. AppSync Eventsで通知が届くことを確認

## 🐛 トラブルシューティング

### Lambda起動エラー: AccessDeniedException

**原因**: Next.jsアプリからLambda関数を呼び出す権限がない

**解決策**:
- ローカル環境: `.env.local`の`AWS_ACCESS_KEY_ID`と`AWS_SECRET_ACCESS_KEY`を確認
- 本番環境: AmplifyのサービスロールにLambda呼び出し権限があるか確認

### Lambda実行エラー: Database connection failed

**原因**: Lambda関数がVPC内のRDSに接続できない

**解決策**:
1. Lambda関数のVPC設定を確認（RDSと同じVPC・サブネット）
2. セキュリティグループでRDS（5432ポート）への接続を許可
3. Lambda関数がインターネットに接続できるか確認（AppSync Events通知用）
   - プライベートサブネットの場合、NAT Gatewayが必要

### タイムアウトエラー

**原因**: 180秒以内に処理が完了しない

**解決策**:
1. Lambda関数のタイムアウト設定を確認（180秒）
2. OpenAI APIのタイムアウト設定を確認
3. Lambda関数のメモリを増やす（512MB → 1024MB）

### AppSync Events通知が届かない

**原因**: Lambda関数からAppSync Eventsに接続できない

**解決策**:
1. Lambda関数の環境変数（`APPSYNC_EVENTS_URL`, `APPSYNC_API_KEY`）を確認
2. Lambda関数がインターネットに接続できるか確認（VPC内の場合はNAT Gateway必要）
3. CloudWatch Logsでエラーメッセージを確認

## 📊 監視

### CloudWatch Logs

ロググループ: `/aws/lambda/osborn-ai-worker`

- Lambda起動ログ
- OpenAI API呼び出しログ（所要時間含む）
- エラーログ

### CloudWatch メトリクス

- 実行時間（Duration）
- エラー数（Errors）
- スロットリング（Throttles）

## 🎯 次のステップ

動作確認が完了したら：

1. **本番環境にデプロイ**
   - Amplify Hostingにプッシュ
   - 環境変数が正しく設定されているか確認

2. **負荷テスト**
   - 複数ユーザーで同時実行

3. **監視設定**
   - CloudWatch アラーム設定
   - エラー通知設定

## 📝 参考ドキュメント

- [Lambda関数のREADME](./README.md)
- [セットアップガイド](../../LAMBDA_SETUP.md)
- [AWS Lambda公式ドキュメント](https://docs.aws.amazon.com/lambda/)
