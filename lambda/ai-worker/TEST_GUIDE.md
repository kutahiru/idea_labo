# Lambda関数 ローカルテストガイド

このガイドでは、`osborn-ai-worker` Lambda関数をローカルでテストする方法を説明します。

## 前提条件

1. **データベースが起動していること**
   ```bash
   # プロジェクトルートで実行
   docker-compose up -d
   ```

2. **環境変数が設定されていること**
   - `/app/.env.local` に以下の環境変数が設定されている必要があります：
     - `DATABASE_URL`
     - `OPENAI_API_KEY`
     - `OPENAI_MODEL`
     - `NEXT_PUBLIC_APPSYNC_EVENTS_URL`
     - `NEXT_PUBLIC_APPSYNC_API_KEY`

3. **テスト用データの準備**
   - オズボーンのチェックリストを作成（Webアプリから作成）
   - AI生成レコードを作成（「AIで自動入力」ボタンをクリック）

## テスト手順

### 1. テストデータのIDを確認

データベースで以下のクエリを実行して、テスト用のIDを確認します。

```sql
-- 最新のオズボーンのチェックリストを確認
SELECT id, user_id, title, theme_name FROM osborn_checklists ORDER BY created_at DESC LIMIT 1;

-- 最新のAI生成レコードを確認
SELECT id, target_type, target_id, generation_status FROM ai_generations WHERE target_type = 'osborn_checklist' ORDER BY created_at DESC LIMIT 1;
```

### 2. テストスクリプトのIDを更新

`lambda/osborn-ai-worker/test-local.ts` の `EVENT` オブジェクトを更新します。

```typescript
const EVENT = {
  generationId: 1,           // ai_generations.id
  osbornChecklistId: 1,      // osborn_checklists.id
  userId: "test-user-id",    // osborn_checklists.user_id
};
```

### 3. テスト実行

```bash
cd /app/lambda/osborn-ai-worker
npm run test:local
```

### 4. 結果確認

#### 成功時の出力例

```
=== Lambda関数ローカルテスト開始 ===
テストイベント: {
  "generationId": 1,
  "osbornChecklistId": 1,
  "userId": "test-user-id"
}

環境変数:
- DATABASE_URL: ✓
- OPENAI_API_KEY: ✓
- OPENAI_MODEL: gpt-5-nano
- APPSYNC_EVENTS_URL: ✓
- APPSYNC_API_KEY: ✓

Lambda起動: {"generationId":1,"osbornChecklistId":1,"userId":"test-user-id"}
AI生成ステータスを「処理中」に更新 (ID: 1)
OpenAI API呼び出し開始
OpenAI API呼び出し完了（所要時間: 27000ms）
AI生成結果をデータベースに保存開始
AI生成結果の保存完了
AI生成が正常に完了しました

=== テスト成功 ===
実行時間: 28500 ms
結果: {
  "statusCode": 200,
  "body": "{\"success\":true,\"ideas\":{...}}"
}
```

#### エラー時の確認ポイント

1. **Database connection failed**
   - `DATABASE_URL` が正しいか確認
   - Docker Compose でPostgreSQLが起動しているか確認

2. **AI応答が空です**
   - `OPENAI_API_KEY` が正しいか確認
   - OpenAI APIの利用制限に達していないか確認

3. **オズボーンのチェックリストが見つかりません**
   - `osbornChecklistId` と `userId` が正しいか確認
   - データベースにレコードが存在するか確認

4. **AppSync Events発行エラー**
   - `NEXT_PUBLIC_APPSYNC_EVENTS_URL` が正しいか確認
   - `NEXT_PUBLIC_APPSYNC_API_KEY` が正しいか確認
   - ※ ローカルテストでは、AppSync Eventsのエラーは無視しても問題ありません

### 5. データベースで結果を確認

```sql
-- AI生成の状態を確認
SELECT * FROM ai_generations WHERE id = 1;

-- 生成されたアイデアを確認
SELECT checklist_type, content 
FROM osborn_checklist_inputs 
WHERE osborn_checklist_id = 1
ORDER BY checklist_type;
```

## トラブルシューティング

### TypeScriptのコンパイルエラー

```bash
# TypeScriptを再ビルド
npm run build
```

### 環境変数が読み込まれない

テストスクリプトは `/app/.env.local` から環境変数を読み込みます。
パスが正しいか確認してください。

### OpenAI APIのタイムアウト

Lambda関数内で50秒のタイムアウトを設定していますが、
ローカルテストでは時間制限がありません。
長時間応答がない場合は、OpenAI APIの状態を確認してください。

## 次のステップ

ローカルテストが成功したら、次は実際にAWSにデプロイしてテストします。
詳細は `/app/LAMBDA_SETUP.md` を参照してください。

## 参考

- Lambda関数のコード: `lambda/osborn-ai-worker/index.ts`
- セットアップガイド: `/app/LAMBDA_SETUP.md`
- テストスクリプト: `lambda/osborn-ai-worker/test-local.ts`
