# Amplify Hosting IAMロール設定手順（2025年版）

## 概要
Amplify Hosting（SSR）からLambda関数を起動し、AppSync Eventsを発行するために、IAMロールをアタッチする手順です。

**重要**: 2025年2月にAWSがAmplify Hosting用のIAMロールサポートを正式に発表しました。

## 前提条件
- AWS CLIがインストール済み、または AWSコンソールへのアクセス権限
- Lambda関数名: `osborn-ai-worker`（環境変数 `LAMBDA_FUNCTION_NAME` で確認）
- Amplify アプリID（AWSコンソールで確認）
- AppSync Events API（リージョン: ap-northeast-1）

---

## 方法1: AWS CLIで設定（推奨）

### 1. IAMポリシーを作成

```bash
# 環境変数を設定
export AWS_REGION="ap-northeast-1"
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export LAMBDA_FUNCTION_NAME="osborn-ai-worker"
export APPSYNC_API_ID="your-appsync-api-id"  # AppSync API IDに置き換えてください

# ポリシーJSONを作成（Lambda + AppSync Events）
cat > amplify-service-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowLambdaInvoke",
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": "arn:aws:lambda:ap-northeast-1:*:function:osborn-ai-worker"
    },
    {
      "Sid": "AllowAppSyncEvents",
      "Effect": "Allow",
      "Action": [
        "appsync:EventPublish",
        "appsync:EventConnect",
        "appsync:EventSubscribe"
      ],
      "Resource": "arn:aws:appsync:ap-northeast-1:*:apis/*/events/*"
    }
  ]
}
EOF

# ポリシーを作成
aws iam create-policy \
  --policy-name AmplifyServicePolicy \
  --policy-document file://amplify-service-policy.json
```

### 2. IAMロールを作成

```bash
# 信頼ポリシーを作成（amplify.amazonaws.comとlambda.amazonaws.comの両方を許可）
cat > amplify-trust-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "amplify.amazonaws.com",
          "lambda.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# ロールを作成
aws iam create-role \
  --role-name AmplifyHostingSSRRole \
  --assume-role-policy-document file://amplify-trust-policy.json \
  --description "Role for Amplify Hosting SSR to invoke Lambda and publish AppSync Events"

# ポリシーをロールにアタッチ
aws iam attach-role-policy \
  --role-name AmplifyHostingSSRRole \
  --policy-arn arn:aws:iam::${AWS_ACCOUNT_ID}:policy/AmplifyServicePolicy
```

### 3. Amplify Hostingにロールをアタッチ

```bash
# Amplify アプリIDを設定
export AMPLIFY_APP_ID="your-app-id"  # AWSコンソールで確認

# サービスロールを更新
aws amplify update-app \
  --app-id ${AMPLIFY_APP_ID} \
  --iam-service-role-arn arn:aws:iam::${AWS_ACCOUNT_ID}:role/AmplifyHostingSSRRole
```

### 4. 環境変数を設定

Amplify Consoleで以下の環境変数を設定してください：

```bash
# AWS CLIで環境変数を設定する場合
aws amplify update-app \
  --app-id ${AMPLIFY_APP_ID} \
  --environment-variables \
    APPSYNC_REGION=ap-northeast-1 \
    LAMBDA_FUNCTION_NAME=osborn-ai-worker
```

または、Amplify Console → アプリ → 環境変数で手動設定：
- `APPSYNC_REGION`: `ap-northeast-1` (**必須** - AWS SDKが使用するリージョン)
- `LAMBDA_FUNCTION_NAME`: `osborn-ai-worker`
- `APPSYNC_EVENTS_URL`: AppSync Events APIのURL
- その他（DATABASE_URL、OPENAI_API_KEYなど）

**重要**:
- Amplifyでは`AWS_`プレフィックスの環境変数は予約されているため使用できません
- 代わりに`APPSYNC_REGION`を設定してください

### 5. 再デプロイ

```bash
# 最新のコミットを再デプロイ
aws amplify start-job \
  --app-id ${AMPLIFY_APP_ID} \
  --branch-name main \
  --job-type RELEASE
```

---

## 方法2: AWSコンソールで設定

### 1. IAMポリシーを作成

1. **IAMコンソール** → **ポリシー** → **ポリシーを作成**
2. JSONタブを選択して以下を貼り付け：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowLambdaInvoke",
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": "arn:aws:lambda:ap-northeast-1:*:function:osborn-ai-worker"
    },
    {
      "Sid": "AllowAppSyncEvents",
      "Effect": "Allow",
      "Action": [
        "appsync:EventPublish",
        "appsync:EventConnect",
        "appsync:EventSubscribe"
      ],
      "Resource": "arn:aws:appsync:ap-northeast-1:*:apis/*/events/*"
    }
  ]
}
```

3. **次へ** → ポリシー名: `AmplifyServicePolicy` → **ポリシーを作成**

### 2. IAMロールを作成

1. **IAMコンソール** → **ロール** → **ロールを作成**
2. **信頼されたエンティティタイプ**: AWSのサービス
3. **ユースケース**: Amplify を検索して選択
4. **次へ**
5. **許可ポリシー**: 先ほど作成した `AmplifyServicePolicy` を選択
6. **次へ**
7. **ロール名**: `AmplifyHostingSSRRole`
8. **ロールを作成**

#### 信頼ポリシーの更新

ロール作成後、信頼ポリシーを更新してLambda@Edgeからもアクセスできるようにします：

1. 作成したロール `AmplifyHostingSSRRole` を開く
2. **信頼関係** タブ → **信頼ポリシーを編集**
3. 以下のJSONに置き換え：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "amplify.amazonaws.com",
          "lambda.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

4. **ポリシーを更新**

### 3. Amplify Hostingにロールをアタッチ

1. **Amplify コンソール** → 対象のアプリを選択
2. **ホスティング** → **ビルド設定**
3. **サービスロール** セクションで **編集**
4. 作成した `AmplifyHostingSSRRole` を選択
5. **保存**

### 4. 環境変数を設定

1. **Amplify コンソール** → アプリ → **環境変数**
2. 以下の環境変数を追加：

| キー | 値 | 説明 |
|------|-----|------|
| `APPSYNC_REGION` | `ap-northeast-1` | **必須** - AWS SDKが使用するリージョン |
| `LAMBDA_FUNCTION_NAME` | `osborn-ai-worker` | 起動するLambda関数名 |
| `APPSYNC_EVENTS_URL` | `https://...` | AppSync Events APIのURL |

**注意**: `AWS_`プレフィックスは予約されているため、`AWS_REGION`は使用できません。

3. **保存**

### 5. 再デプロイ

1. Amplify コンソールの **ホスティング環境**
2. main ブランチの **再デプロイ** をクリック

---

## 確認方法

デプロイ完了後、以下で確認：

1. オズボーンのチェックリストでAI生成を実行
2. Amplify のログで「Lambda起動エラー」が出ないことを確認
3. Lambda関数（CloudWatch Logs）でイベントが受信されていることを確認

---

## トラブルシューティング

### エラー: "Could not load credentials from any providers"

**原因**:
- `APPSYNC_REGION`環境変数が設定されていない
- IAMロールがAmplify Hostingにアタッチされていない
- 信頼ポリシーに`lambda.amazonaws.com`が含まれていない

**解決策**:
1. Amplify Console → 環境変数で`APPSYNC_REGION`が設定されているか確認
   - **注意**: `AWS_REGION`は予約語のため使用不可、必ず`APPSYNC_REGION`を使用
2. Amplify Console → ビルド設定 → サービスロールが設定されているか確認
3. IAMコンソールでロールの信頼ポリシーに`lambda.amazonaws.com`が含まれているか確認
4. 再デプロイ

### エラー: "User is not authorized to perform: iam:PassRole"

実行ユーザーに `iam:PassRole` 権限が必要です：

```bash
aws iam attach-user-policy \
  --user-name your-user-name \
  --policy-arn arn:aws:iam::aws:policy/IAMFullAccess
```

### エラー: "Lambda起動エラー: AccessDeniedException"

IAMロールに`lambda:InvokeFunction`権限がない可能性があります。

1. IAMコンソール → ロール → `AmplifyHostingSSRRole` を開く
2. 許可ポリシーに `AmplifyServicePolicy` がアタッチされているか確認
3. ポリシーの内容を確認

### エラー: "AppSync Events発行エラー: 403 Forbidden"

IAMロールにAppSync Events権限がない可能性があります。

1. IAMポリシー `AmplifyServicePolicy` に以下の権限が含まれているか確認：
   - `appsync:EventPublish`
   - `appsync:EventConnect`
   - `appsync:EventSubscribe`

### Amplify アプリIDの確認方法

```bash
aws amplify list-apps --query 'apps[*].[name,appId]' --output table
```

または AWSコンソール → Amplify → アプリ概要の「アプリARN」に含まれています。

---

## 参考資料

- [Amplify Hosting IAM roles for SSR applications](https://aws.amazon.com/about-aws/whats-new/2025/02/amplify-hosting-iam-roles-ssr-applications/)
- [Deploying server-side rendered applications with Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html)
- [IAM permission with NextJS - GitHub Issue](https://github.com/aws-amplify/amplify-hosting/issues/3205)
