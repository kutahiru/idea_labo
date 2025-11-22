# Lambda Function URL 設定手順

## 概要
Lambda関数にHTTPSエンドポイント（Function URL）を追加して、Next.jsアプリから直接呼び出せるようにします。

**メリット**:
- 完全無料（API Gateway不要）
- 設定が簡単（数分で完了）
- IAM認証またはパブリック認証を選択可能

---

## 方法1: AWSコンソールで設定（推奨）

### 1. Lambda Function URLを作成

1. **Lambda コンソール** → 関数 `osborn-ai-worker` を開く
2. **設定** タブ → **関数 URL** → **関数 URLを作成**
3. 以下を設定：
   - **認証タイプ**: `NONE`（パブリック）
     - または `AWS_IAM`（IAM認証が必要）
   - **CORS設定**:
     - **オリジンの許可**: Amplify HostingのURL（例: `https://main.xxxxx.amplifyapp.com`）
     - **メソッドの許可**: `POST`
     - **ヘッダーの許可**: `content-type`
4. **保存**

作成されたFunction URL（例: `https://xxxxx.lambda-url.ap-northeast-1.on.aws/`）をコピー

### 2. 環境変数を設定

**Amplify Console** → アプリ → **環境変数** に追加：

| キー | 値 |
|------|-----|
| `LAMBDA_FUNCTION_URL` | `https://xxxxx.lambda-url.ap-northeast-1.on.aws/` |

**注意**: 末尾の `/` を含めてください

---

## 方法2: AWS CLIで設定

### 1. Function URLを作成

```bash
# 環境変数を設定
export LAMBDA_FUNCTION_NAME="osborn-ai-worker"
export AMPLIFY_DOMAIN="https://main.xxxxx.amplifyapp.com"  # 実際のAmplifyドメインに置き換え

# Function URLを作成（パブリック認証）
aws lambda create-function-url-config \
  --function-name ${LAMBDA_FUNCTION_NAME} \
  --auth-type NONE \
  --cors '{
    "AllowOrigins": ["'${AMPLIFY_DOMAIN}'"],
    "AllowMethods": ["POST"],
    "AllowHeaders": ["content-type"],
    "MaxAge": 86400
  }'

# Function URLを確認
aws lambda get-function-url-config \
  --function-name ${LAMBDA_FUNCTION_NAME}
```

### 2. リソースベースポリシーを追加（パブリックアクセス許可）

```bash
aws lambda add-permission \
  --function-name ${LAMBDA_FUNCTION_NAME} \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE
```

### 3. Amplify環境変数を設定

```bash
# Function URLを取得
FUNCTION_URL=$(aws lambda get-function-url-config \
  --function-name ${LAMBDA_FUNCTION_NAME} \
  --query FunctionUrl \
  --output text)

echo "Function URL: ${FUNCTION_URL}"

# Amplify環境変数に設定
export AMPLIFY_APP_ID="your-app-id"

aws amplify update-app \
  --app-id ${AMPLIFY_APP_ID} \
  --environment-variables \
    LAMBDA_FUNCTION_URL=${FUNCTION_URL}
```

---

## 方法3: IAM認証を使う場合（セキュアな方法）

### 1. Function URLを作成（IAM認証）

```bash
aws lambda create-function-url-config \
  --function-name ${LAMBDA_FUNCTION_NAME} \
  --auth-type AWS_IAM \
  --cors '{
    "AllowOrigins": ["'${AMPLIFY_DOMAIN}'"],
    "AllowMethods": ["POST"],
    "AllowHeaders": ["content-type", "authorization", "x-amz-date", "x-amz-security-token"],
    "MaxAge": 86400
  }'
```

### 2. Amplify IAMロールに権限を追加

先ほど作成した `AmplifyHostingSSRRole` に以下の権限を追加：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowInvokeFunctionUrl",
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunctionUrl"
      ],
      "Resource": "arn:aws:lambda:ap-northeast-1:*:function:osborn-ai-worker"
    }
  ]
}
```

**注意**: IAM認証を使う場合、Next.jsコードでSigV4署名が必要になり複雑です。まずは`NONE`（パブリック）で試すことを推奨します。

---

## 確認方法

### curlでテスト

```bash
curl -X POST https://xxxxx.lambda-url.ap-northeast-1.on.aws/ \
  -H "Content-Type: application/json" \
  -d '{
    "generationId": 1,
    "osbornChecklistId": 1,
    "userId": "test-user"
  }'
```

正常に動作すれば、Lambda関数が起動されます。

---

## セキュリティ対策（重要）

Function URLを`NONE`（パブリック）で公開する場合、以下の対策を実施してください：

### 1. Lambda関数内で認証チェック

Lambda関数内でペイロードを検証：
- `userId`が有効か
- `osbornChecklistId`が該当ユーザーのものか
- DBで確認

### 2. レート制限

CloudFrontやWAFでレート制限を設定（オプション）

### 3. リクエスト署名（推奨）

Next.js側で署名を生成し、Lambda側で検証：

```typescript
// Next.js側
const signature = crypto.createHmac('sha256', SECRET_KEY)
  .update(JSON.stringify(payload))
  .digest('hex');

// Lambda側で検証
const expectedSignature = crypto.createHmac('sha256', SECRET_KEY)
  .update(JSON.stringify(event.body))
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid signature');
}
```

---

## トラブルシューティング

### エラー: "403 Forbidden"

**原因**: Function URLのリソースポリシーが設定されていない

**解決策**:
```bash
aws lambda add-permission \
  --function-name osborn-ai-worker \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE
```

### エラー: "CORS error"

**原因**: CORS設定が正しくない

**解決策**:
1. Function URLのCORS設定でAmplifyドメインを許可
2. `AllowHeaders`に必要なヘッダーを追加

---

## 参考資料

- [Lambda Function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html)
- [Function URL CORS設定](https://docs.aws.amazon.com/lambda/latest/dg/urls-configuration.html#urls-cors)
