# Lambda Function URL デプロイ手順

## 実施内容

Lambda Function URL + 秘密トークン認証でLambda関数を呼び出すように変更しました。

**変更点**:
- Lambda関数: HTTPリクエスト対応 + 秘密トークン認証を追加
- Next.js: `LambdaClient`から`fetch()`（HTTP）に変更
- **追加コスト: ゼロ円**

---

## デプロイ手順

### ステップ1: 秘密トークンを生成

ターミナルで以下を実行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

出力された64文字のランダム文字列をコピーしてください。

例: `a1b2c3d4e5f6...`（64文字）

---

### ステップ2: Lambda Function URLを作成

1. **AWS Console** → **Lambda** → 関数 `osborn-ai-worker` を開く
2. **設定** タブ → **関数 URL** → **関数 URLを作成**
3. 以下を設定：
   - **認証タイプ**: `NONE`
   - **CORS設定**:
     - **オリジンを許可**: `*`（または Amplify HostingのURL）
     - **メソッドを許可**: `POST`
     - **ヘッダーを許可**: `content-type, x-api-secret`
     - **最大経過時間**: `86400`
4. **保存**

作成されたFunction URLをコピー（例: `https://xxxxx.lambda-url.ap-northeast-1.on.aws/`）

---

### ステップ3: Lambda環境変数を設定

1. **Lambda Console** → 関数 `osborn-ai-worker` → **設定** → **環境変数**
2. 環境変数を追加：

| キー | 値 |
|------|-----|
| `LAMBDA_SECRET_TOKEN` | ステップ1で生成した秘密トークン |

**注意**: 既存の環境変数（DATABASE_URL、OPENAI_API_KEY等）はそのまま残してください。

3. **保存**

---

### ステップ4: Amplify環境変数を設定

1. **Amplify Console** → アプリ → **環境変数**
2. 環境変数を追加：

| キー | 値 |
|------|-----|
| `LAMBDA_FUNCTION_URL` | ステップ2で取得したFunction URL |
| `LAMBDA_SECRET_TOKEN` | ステップ1で生成した秘密トークン（Lambda と同じ値） |

**重要**: 両方の環境変数が同じトークン値を持つ必要があります。

3. **保存**

---

### ステップ5: Lambda関数をデプロイ

Lambda関数のコードを更新しました。デプロイしてください：

```bash
cd lambda/osborn-ai-worker
npm run build  # TypeScriptをビルド
# または手動でLambdaコンソールからZipアップロード
```

**Lambda Console経由でのデプロイ**:
1. `lambda/osborn-ai-worker`フォルダをZip圧縮
2. Lambda Console → `osborn-ai-worker` → **コード**タブ → **.zip ファイルをアップロード**

---

### ステップ6: Next.jsコードをデプロイ

```bash
git add .
git commit -m "Lambda Function URL対応: HTTP呼び出し + 秘密トークン認証"
git push
```

Amplifyが自動的に再デプロイします。

---

## 動作確認

### 1. Amplify ログで確認

Amplify Console → ホスティング → ログ で以下を確認：

```
🔍 [診断] Lambda設定: {
  LAMBDA_FUNCTION_URL: '✓',
  LAMBDA_SECRET_TOKEN: '✓'
}
🔍 Lambda Function URL呼び出し開始
✅ Lambda Function URL呼び出し成功
```

### 2. Lambda ログで確認

Lambda Console → モニタリング → CloudWatch Logs で以下を確認：

```
📡 Function URL経由の呼び出し
AI生成が正常に完了しました
```

### 3. アプリケーションで確認

オズボーンのチェックリストでAI生成を実行し、正常に動作することを確認。

---

## トラブルシューティング

### エラー: "❌ LAMBDA_FUNCTION_URL環境変数が設定されていません"

**原因**: Amplify環境変数が設定されていない、または再デプロイされていない

**解決策**:
1. Amplify Console → 環境変数を確認
2. 再デプロイ

### エラー: "403 Forbidden"

**原因**:
1. 秘密トークンが一致しない
2. Lambda環境変数が設定されていない

**解決策**:
1. AmplifyとLambdaの`LAMBDA_SECRET_TOKEN`が同じ値か確認
2. 両方とも再デプロイ

### エラー: "CORS error"

**原因**: Function URLのCORS設定が正しくない

**解決策**:
1. Lambda Console → 関数URL → CORS設定を確認
2. `x-api-secret`ヘッダーが許可されているか確認

---

## セキュリティ補足

### 秘密トークンの管理

- ✅ **環境変数で管理**（推奨）
- ❌ コードにハードコードしない
- ❌ GitHubにプッシュしない

### トークンのローテーション

定期的にトークンを変更することを推奨：
1. 新しいトークンを生成
2. AmplifyとLambda両方の環境変数を更新
3. 再デプロイ

### 追加のセキュリティ対策（オプション）

Lambda関数内でさらに厳密な検証を追加：
- `userId`がDBに存在するか
- `osbornChecklistId`が該当ユーザーのものか

これらは既にLambda関数内で実装済みです。

---

## コスト

- Lambda Function URL: **無料**
- Lambda実行料金: **元々かかるコスト**（変更なし）
- OpenAI API料金: **元々かかるコスト**（変更なし）

**追加コスト: ゼロ円**
