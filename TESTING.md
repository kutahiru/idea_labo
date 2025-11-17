# テスト実行ガイド

このドキュメントでは、「アイデア研究所」プロジェクトのテスト実行方法について説明します。

## テスト技術スタック

- **テストランナー**: Vitest 3.2.4
- **DOM環境**: happy-dom 15.x
- **Reactテスト**: @testing-library/react 16.x
- **アサーション拡張**: @testing-library/jest-dom 6.x

## テストコマンド

### 基本的なテスト実行

```bash
# すべてのテストを実行
npm test

# watchモードでテストを実行（ファイル変更時に自動再実行）
npm test -- --watch

# 特定のテストファイルのみ実行
npm test -- src/lib/idea.test.ts
```

### カバレッジレポート

```bash
# カバレッジレポートを生成
npm run test:coverage
```

カバレッジレポートは以下の形式で出力されます：
- ターミナル出力: テキスト形式
- HTMLレポート: `coverage/index.html`

## テストカバレッジ

### 現在の実装状況

#### ✅ 高優先度（実装済み）

1. **バリデーションロジック** (100% カバレッジ)
   - `src/schemas/idea.test.ts`: アイデアのバリデーション
   - `src/schemas/brainwriting.test.ts`: ブレインライティングのバリデーション

2. **APIユーティリティ** (100% カバレッジ)
   - `src/lib/api/utils.test.ts`: 認証チェック、エラーレスポンス、IDバリデーション

3. **データベース操作** (100% カバレッジ)
   - `src/lib/idea.test.ts`: アイデアのCRUD操作、所有者チェック

### テスト結果サマリー

```
Test Files  56 passed (56)
Tests  535 passed (535)
  - APIルート: 30ファイル
  - lib/hooks/utils: 17ファイル
  - Reactコンポーネント: 9ファイル (95テスト)
```

#### カバレッジハイライト

| モジュール | カバレッジ | 説明 |
|----------|----------|------|
| `lib/api/utils.ts` | 100% | 認証・エラーハンドリング (14テスト) |
| `lib/client-utils.ts` | **100%** | クライアントユーティリティ (5テスト, 2/2関数) |
| `lib/token.ts` | **100%** | トークン・URL生成ユーティリティ (20テスト, 6/6関数) |
| `lib/x-post.ts` | **100%** | X(Twitter)投稿ユーティリティ (9テスト, 3/3関数) |
| `lib/idea.ts` | 100% | アイデアデータアクセス層 (7テスト) |
| `lib/idea-category.ts` | 100% | アイデアカテゴリデータアクセス層 (7テスト) |
| `lib/user.ts` | **100%** | ユーザーデータアクセス層 (3テスト, 2/2関数) |
| `schemas/idea.ts` | 100% | アイデアバリデーション (12テスト) |
| `schemas/idea-category.ts` | **100%** | アイデアカテゴリバリデーション (8テスト) |
| `schemas/brainwriting.ts` | 100% | ブレインライティングバリデーション (13テスト) |
| `schemas/mandalart.ts` | **100%** | マンダラートバリデーション (13テスト) |
| `schemas/osborn-checklist.ts` | **100%** | オズボーンのチェックリストバリデーション (9テスト) |
| `schemas/user.ts` | **100%** | ユーザーバリデーション (5テスト) |
| `schemas/idea-framework.ts` | 100% | 共通フレームワークバリデーション |
| `lib/brainwriting.ts` | **100%** | ブレインライティング主要機能 (54テスト, 29/29関数) |
| `lib/mandalart.ts` | **100%** | マンダラート主要機能 (14テスト, 10/10関数) |
| `lib/osborn-checklist.ts` | **100%** | オズボーンのチェックリスト主要機能 (14テスト, 10/10関数) |
| `utils/date.ts` | **100%** | 日付フォーマットユーティリティ (4テスト, 1/1関数) |
| `utils/brainwriting.ts` | **100%** | ブレインライティングユーティリティ (18テスト, 5/5関数) |
| `hooks/useSearch.ts` | **100%** | 検索フィルタリングフック (9テスト) |
| `hooks/useAutoRefreshOnFocus.ts` | **100%** | 自動リフレッシュフック (8テスト) |
| `hooks/useInfiniteScroll.ts` | **100%** | 無限スクロールフック (7テスト) |
| `components/ideas/*` | **100%** | アイデア管理コンポーネント (56テスト, 5ファイル) |
| `components/idea-categories/*` | **100%** | アイデアカテゴリコンポーネント (39テスト, 4ファイル) |

## テストの構造

```
src/
├── test/
│   ├── setup.ts                  # グローバルテストセットアップ
│   └── db-mock.ts                # データベースモックヘルパー
├── schemas/
│   ├── idea.test.ts              # アイデアバリデーションテスト (12テスト)
│   ├── idea-category.test.ts     # アイデアカテゴリバリデーションテスト (8テスト)
│   ├── brainwriting.test.ts      # ブレインライティングバリデーションテスト (13テスト)
│   ├── mandalart.test.ts         # マンダラートバリデーションテスト (13テスト)
│   ├── osborn-checklist.test.ts  # オズボーンのチェックリストバリデーションテスト (9テスト)
│   └── user.test.ts              # ユーザーバリデーションテスト (5テスト)
└── lib/
    ├── api/
    │   └── utils.test.ts         # APIユーティリティテスト (14テスト)
    ├── client-utils.test.ts      # クライアントユーティリティテスト (5テスト, 100%カバレッジ)
    ├── token.test.ts             # トークン・URL生成テスト (20テスト, 100%カバレッジ)
    ├── x-post.test.ts            # X投稿ユーティリティテスト (9テスト, 100%カバレッジ)
    ├── idea.test.ts              # アイデアデータアクセステスト (7テスト)
    ├── idea-category.test.ts     # アイデアカテゴリデータアクセステスト (7テスト)
    ├── user.test.ts              # ユーザーデータアクセステスト (3テスト, 100%カバレッジ)
    ├── brainwriting.test.ts      # ブレインライティングデータアクセステスト (54テスト, 100%カバレッジ)
    ├── mandalart.test.ts         # マンダラートデータアクセステスト (14テスト, 100%カバレッジ)
    └── osborn-checklist.test.ts  # オズボーンのチェックリストデータアクセステスト (14テスト, 100%カバレッジ)
└── utils/
    ├── date.test.ts              # 日付フォーマットテスト (4テスト, 100%カバレッジ)
    └── brainwriting.test.ts      # ブレインライティングユーティリティテスト (18テスト, 100%カバレッジ)
└── hooks/
    ├── useSearch.test.ts         # 検索フィルタリングフックテスト (9テスト, 100%カバレッジ)
    ├── useAutoRefreshOnFocus.test.ts  # 自動リフレッシュフックテスト (8テスト, 100%カバレッジ)
    └── useInfiniteScroll.test.ts # 無限スクロールフックテスト (7テスト, 100%カバレッジ)
```

### brainwriting.test.ts の詳細

`lib/brainwriting.ts` の包括的なテストカバレッジを実現（54テスト）:

#### 基本CRUD操作 (9テスト)
- `getBrainwritingsByUserId`: 一覧取得
- `createBrainwriting`: 作成（XPOST版/TEAM版）
- `updateBrainwriting`: 更新
- `deleteBrainwriting`: 削除
- `getBrainwritingById`: 詳細取得

#### 参加・状態管理 (11テスト)
- `checkJoinStatus`: 参加状態チェック（2テストケース）
- `checkUserCount`: 参加人数チェック（2テストケース）
- `joinBrainwriting`: 参加処理（5テストケース：成功、既参加、満員、ロック中、TEAM版参加不可）
- `checkTeamJoinable`: チーム版参加可否チェック（3テストケース）

#### シート・入力操作 (11テスト)
- `getBrainwritingSheetById`: シート取得
- `getBrainwritingSheetWithBrainwriting`: シートとブレインライティング結合取得
- `getBrainwritingSheetsByBrainwritingId`: シート一覧取得
- `upsertBrainwritingInput`: 入力データの作成/更新（3テストケース）
- `getBrainwritingInputsBySheetId`: シート別入力データ取得
- `getBrainwritingInputsByBrainwritingId`: ブレインライティング別入力データ取得

#### ロック・セッション管理 (7テスト)
- `checkSheetLockStatus`: ロック状態チェック（4テストケース：未ロック、他者ロック、期限切れ、自身ロック）
- `unlockSheet`: ロック解除
- `clearAbandonedSessions`: 放棄されたセッションのクリーンアップ（2テストケース）

#### 詳細取得・公開管理 (13テスト)
- `getBrainwritingDetailById`: 詳細情報取得（2テストケース）
- `getBrainwritingDetailForBrainwritingUser`: 参加者用詳細取得（3テストケース）
- `getBrainwritingResultsById`: 結果公開用取得（3テストケース：公開、非公開、不在）
- `getBrainwritingTeamByBrainwritingId`: チーム用情報取得（2テストケース）
- `getBrainwritingByToken`: トークンによる取得（2テストケース）
- `getBrainwritingByIdInternal`: 権限チェックなし取得

#### チーム版専用機能 (4テスト)
- `createSheetsForTeam`: シート一括作成
- `rotateSheetToNextUser`: シートローテーション（3テストケース）

#### 設定更新 (2テスト)
- `updateBrainwritingIsInviteActive`: 招待URL有効化
- `updateBrainwritingIsResultsPublic`: 結果公開設定

#### ユーザー管理 (1テスト)
- `getBrainwritingUsersByBrainwritingId`: 参加者一覧取得

### mandalart.test.ts の詳細

`lib/mandalart.ts` の全関数をカバー（14テスト、10/10関数）:

#### 基本CRUD操作 (5テスト)
- `getMandalartsByUserId`: 一覧取得
- `createMandalart`: 作成
- `updateMandalart`: 更新
- `deleteMandalart`: 削除
- `getMandalartById`: 詳細取得

#### 入力データ操作 (4テスト)
- `getMandalartInputsByMandalartId`: 入力データ一覧取得
- `upsertMandalartInput`: 入力データの作成/更新（3テストケース：新規作成、更新、権限エラー）

#### 詳細取得・公開管理 (5テスト)
- `getMandalartDetailById`: 詳細情報取得（2テストケース：成功、不在）
- `getMandalartDetailByToken`: 公開トークンでの詳細取得（2テストケース：成功、不在/非公開）
- `updateMandalartIsResultsPublic`: 結果公開設定

### osborn-checklist.test.ts の詳細

`lib/osborn-checklist.ts` の全関数をカバー（14テスト、10/10関数）:

#### 基本CRUD操作 (5テスト)
- `getOsbornChecklistsByUserId`: 一覧取得
- `createOsbornChecklist`: 作成
- `updateOsbornChecklist`: 更新
- `deleteOsbornChecklist`: 削除
- `getOsbornChecklistById`: 詳細取得

#### 入力データ操作 (4テスト)
- `getOsbornChecklistInputsByOsbornChecklistId`: 入力データ一覧取得
- `upsertOsbornChecklistInput`: 入力データの作成/更新（3テストケース：新規作成、更新、権限エラー）

#### 詳細取得・公開管理 (5テスト)
- `getOsbornChecklistDetailById`: 詳細情報取得（2テストケース：成功、不在）
- `getOsbornChecklistDetailByToken`: 公開トークンでの詳細取得（2テストケース：成功、不在/非公開）
- `updateOsbornChecklistIsResultsPublic`: 結果公開設定

### user.test.ts の詳細

`lib/user.ts` の全関数をカバー（3テスト、2/2関数）:

#### ユーザー情報取得 (2テスト)
- `getUserById`: ユーザー情報取得（2テストケース：成功、不在）

#### ユーザー情報更新 (1テスト)
- `updateUser`: ユーザー情報更新

### client-utils.test.ts の詳細

`lib/client-utils.ts` の全関数をカバー（5テスト、2/2関数）:

#### JSON安全パース (2テスト)
- `parseJsonSafe`: 正常パース、エラー時デフォルト値返却

#### JSONパース (3テスト)
- `parseJson`: 正常パース、エラー時例外スロー、カスタムエラーメッセージ

### x-post.test.ts の詳細

`lib/x-post.ts` の全関数をカバー（9テスト、3/3関数）:

#### ブレインライティングX投稿 (5テスト)
- `postBrainwritingToX`: 作成者投稿、参加者投稿、残りユーザー数0、残りユーザー数1以上、30文字超えテーマ切り詰め

#### マンダラートX投稿 (2テスト)
- `postMandalartToX`: 通常投稿、30文字超えテーマ切り詰め

#### オズボーンのチェックリストX投稿 (2テスト)
- `postOsbornChecklistToX`: 通常投稿、30文字超えテーマ切り詰め

### token.test.ts の詳細

`lib/token.ts` の全関数をカバー（20テスト、6/6関数）:

#### トークン生成 (4テスト)
- `generateToken`: 32文字16進数生成、ユニーク性確認
- `generateInviteToken`: 32文字16進数生成、ユニーク性確認

#### 招待URL生成 (4テスト)
- `generateInviteUrl`: デフォルトURL、カスタムURL、null/undefined/空文字エラー
- `generateInviteData`: トークンとURL両方生成

#### マンダラート公開URL生成 (5テスト)
- `generateMandalartPublicUrl`: デフォルトURL、カスタムURL、null/undefined/空文字エラー

#### オズボーン公開URL生成 (5テスト)
- `generateOsbornChecklistPublicUrl`: デフォルトURL、カスタムURL、null/undefined/空文字エラー

### schemas/idea-category.test.ts の詳細

`schemas/idea-category.ts` のバリデーションテスト（8テスト）:

#### name (4テスト)
- 正常値受け入れ、空文字拒否、100文字超過拒否、100文字受け入れ

#### description (4テスト)
- null受け入れ、空文字受け入れ、500文字超過拒否、500文字受け入れ

### schemas/mandalart.test.ts の詳細

`schemas/mandalart.ts` のバリデーションテスト（13テスト）:

#### mandalartInputSchema (13テスト)
- mandalartId: 正の整数、0拒否、負数拒否
- sectionRowIndex/columnIndex: 0-2範囲チェック
- rowIndex/columnIndex: 0-2範囲チェック
- content: 空文字、30文字、31文字超過拒否
- インデックス組み合わせ: すべて0、すべて2

### schemas/osborn-checklist.test.ts の詳細

`schemas/osborn-checklist.ts` の定数バリデーションテスト（9テスト）:

#### OSBORN_CHECKLIST_TYPES (2テスト)
- 9つのタイプ定義確認、各タイプの値確認

#### OSBORN_CHECKLIST_NAMES (2テスト)
- すべてのタイプに名前定義、正しい日本語名

#### OSBORN_CHECKLIST_DESCRIPTIONS (3テスト)
- すべてのタイプに説明定義、各説明に例含む、転用の説明確認

#### マッピング整合性 (2テスト)
- TYPES/NAMES/DESCRIPTIONSのキー一致、すべてに対応確認

### schemas/user.test.ts の詳細

`schemas/user.ts` のバリデーションテスト（5テスト）:

#### name (5テスト)
- 正常値受け入れ、空文字拒否、100文字超過拒否、100文字受け入れ、1文字受け入れ

### utils/date.test.ts の詳細

`utils/date.ts` の日付フォーマット関数テスト（4テスト、1/1関数）:

#### formatDate (4テスト)
- Date型受け入れ、string型受け入れ、年月日時分含有確認、異なる日付で異なる結果

### utils/brainwriting.test.ts の詳細

`utils/brainwriting.ts` のブレインライティングユーティリティテスト（18テスト、5/5関数）:

#### 定数・ラベル (5テスト)
- `USAGE_SCOPE`: 定数値確認（xpost, team）
- `USAGE_SCOPE_LABELS`: ラベルマッピング確認
- `getUsageScopeLabel`: ラベル取得（2テストケース：xpost、team）

#### ユーザーソート (4テスト)
- `sortUsersByFirstRow`: 1行目ユーザーを先頭にソート、入力なし時元配列返却、ユーザー不在時元配列返却、最初のユーザーが1行目の場合順序不変

#### データ変換 (5テスト)
- `convertToRowData`: 入力データ→行データ変換、常に6行返却、不足行にデフォルト名設定、空入力時空アイデア、row_indexでソート、nullコンテンツ→空文字変換

#### API通信 (4テスト)
- `handleBrainwritingDataChange`: 正しいリクエスト送信、成功時ログ出力、APIエラー時アラート、ネットワークエラー時アラート

### hooks/useSearch.test.ts の詳細

`hooks/useSearch.ts` の検索フィルタリングフックテスト（9テスト）:

#### 基本機能 (9テスト)
- 初期状態で全データ返却
- 検索語でフィルタリング
- 複数フィールド検索
- 大文字小文字区別なし検索
- 空白のみの検索語で全データ返却
- 一致なしで空配列返却
- 検索語クリアで全データ復帰
- データ変更時の再フィルタリング
- 指定フィールドのみ検索対象

### hooks/useAutoRefreshOnFocus.test.ts の詳細

`hooks/useAutoRefreshOnFocus.ts` の自動リフレッシュフックテスト（8テスト）:

#### sessionStorage管理 (4テスト)
- 初回実行時にpathname保存
- pathname変更時にrefresh呼び出し
- pathname不変時はrefresh不実行
- sessionStorage空時はrefresh不実行

#### visibilitychange対応 (3テスト)
- visible時にrefresh呼び出し
- hidden時はrefresh不実行
- アンマウント時のイベントリスナークリーンアップ

#### その他 (1テスト)
- pathname変更時の新しいpathname保存

### hooks/useInfiniteScroll.test.ts の詳細

`hooks/useInfiniteScroll.ts` の無限スクロールフックテスト（7テスト）:

#### 基本機能 (6テスト)
- 初期表示で指定件数表示
- 全データ≤表示件数でhasMore=false
- hasMore=false時は追加読み込みなし
- allData変更時のリセット
- observerRef提供
- isIntersecting=false時は読み込まない

#### カスタム設定 (1テスト)
- カスタムitemsPerPage動作確認

## テストの書き方

### 基本構造

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('テストスイート名', () => {
  beforeEach(() => {
    // 各テスト前の初期化
    vi.clearAllMocks()
  })

  it('テストケースの説明', () => {
    // Arrange: テストデータの準備
    const input = { /* ... */ }

    // Act: テスト対象の実行
    const result = someFunction(input)

    // Assert: 結果の検証
    expect(result).toBe(expected)
  })
})
```

### モックの使用例

```typescript
// モジュールのモック
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}))

// 関数のモック
vi.mocked(db.select).mockReturnValue(mockChain)
```

## 次のステップ

### 中優先度のテスト

1. **Reactコンポーネント** ✅ 実装済み
   - フォームコンポーネント（IdeaModal）
   - 一覧表示コンポーネント（IdeaIndex）
   - ボタンコンポーネント（CreateIdeaButton）
   - ページコンポーネント（IdeaPageClient）
   - 行コンポーネント（IdeaIndexRow）

2. **ユーティリティ関数** ✅ 実装済み
   - 日付処理（formatDate）
   - トークン生成（generateToken系）

### 低優先度のテスト（今後実装予定）

1. **E2Eテスト** (Playwright)
   - ユーザーフロー
   - ブラウザ間の互換性

## トラブルシューティング

### よくある問題

#### 問題: テストが遅い
**解決策**: 特定のテストファイルのみを実行する
```bash
npm test -- src/lib/idea.test.ts
```

#### 問題: モックが正しく動作しない
**解決策**: `beforeEach` で `vi.clearAllMocks()` を呼び出す

#### 問題: カバレッジレポートが生成されない
**解決策**: `@vitest/coverage-v8` がインストールされているか確認
```bash
npm install --save-dev @vitest/coverage-v8@3.2.4
```

## 参考リンク

- [Vitest 公式ドキュメント](https://vitest.dev/)
- [Testing Library 公式ドキュメント](https://testing-library.com/)
- [jest-dom マッチャー一覧](https://github.com/testing-library/jest-dom#custom-matchers)

## APIルートテスト

### 実装済みAPIルートテスト (9ファイル)

主要なCRUD操作のテストを実装しました:

#### アイデアAPI
- `src/app/api/ideas/route.test.ts` (7テスト)
- `src/app/api/ideas/[id]/route.test.ts` (13テスト)

#### アイデアカテゴリAPI
- `src/app/api/idea-categories/route.test.ts` (8テスト)
- `src/app/api/idea-categories/[id]/route.test.ts` (11テスト)

#### ユーザーAPI
- `src/app/api/users/me/route.test.ts` (10テスト)

#### ブレインライティングAPI
- `src/app/api/brainwritings/route.test.ts` (7テスト)
- `src/app/api/brainwritings/[id]/route.test.ts` (14テスト)

#### マンダラートAPI
- `src/app/api/mandalarts/route.test.ts` (4テスト)

#### オズボーンのチェックリストAPI
- `src/app/api/osborn-checklists/route.test.ts` (4テスト)

### テスト技術スタック

```typescript
- テストランナー: Vitest
- Next.js: NextRequest/NextResponse
- モック: vi.mock()
- アサーション: expect()
```

### テスト構造

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/resource", () => ({
  createResource: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  checkAuth: vi.fn(),
  apiErrors: {
    invalidData: (message: unknown) => {
      return NextResponse.json({ error: message }, { status: 400 });
    },
  },
}));

describe("POST /api/resource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });
    // テストコード...
  });
});
```

### 重要な注意事項

#### NextResponse vs Response

APIルートのテストでは、必ず`NextResponse`を使用してください。`Response`を使用すると型エラーが発生します。

```typescript
// ❌ 誤り
vi.mocked(checkAuth).mockResolvedValue({
  error: new Response(JSON.stringify({ error: "認証が必要です" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  }),
});

// ✅ 正しい
vi.mocked(checkAuth).mockResolvedValue({
  error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
});
```

#### 日付オブジェクトの比較

JSON変換時に`Date`オブジェクトは文字列に変換されるため、完全一致での比較は避けてください。

```typescript
// ❌ 誤り
expect(data).toEqual(mockData); // createdAtがDateオブジェクトの場合失敗

// ✅ 正しい
expect(data.id).toBe(mockData.id);
expect(data.title).toBe(mockData.title);
// または
expect(typeof data.createdAt).toBe('string');
```

### カバレッジ目標

- [x] アイデアCRUD
- [x] アイデアカテゴリCRUD
- [x] ユーザー情報取得/更新
- [x] ブレインライティング基本CRUD
- [x] マンダラート作成
- [x] オズボーンのチェックリスト作成
- [ ] ブレインライティング参加/開始/ロック管理
- [ ] マンダラート/オズボーンの完全CRUD
- [ ] 入力データ更新API
- [ ] 公開結果取得API

### テスト実行方法

```bash
# 全APIルートテスト
npm test -- src/app/api

# 特定のAPIテスト
npm test -- src/app/api/ideas/route.test.ts

# カバレッジ付き
npm test -- --coverage src/app/api
```

## Reactコンポーネントテスト

### 実装済みコンポーネントテスト (9ファイル, 95テスト)

アイデア管理機能とアイデアカテゴリ管理機能のコンポーネントテストを実装しました:

#### src/components/ideas/ (56テスト)

1. **IdeaIndexRow.test.tsx** (8テスト)
   - アイデア情報の表示
   - 優先度ラベルの表示（高/中/低）
   - 説明がnullの場合のプレースホルダー
   - 編集・削除ボタンのクリックイベント
   - ボタンの表示/非表示制御

2. **IdeaModal.test.tsx** (15テスト)
   - 作成/編集モードの切り替え
   - フォーム入力とsubmit
   - バリデーション（必須項目、文字数制限）
   - カテゴリ選択フィールドの表示/非表示
   - 初期データの表示（編集モード）
   - モーダルの開閉動作
   - 送信中の状態管理

3. **CreateIdeaButton.test.tsx** (6テスト)
   - ボタンの表示とクリック
   - モーダルの開閉
   - カテゴリAPI取得
   - エラーハンドリング（APIエラー、ネットワークエラー）
   - カテゴリのキャッシュ機能
   - 読み込み中のボタン無効化

4. **IdeaIndex.test.tsx** (13テスト)
   - アイデア一覧の表示
   - 検索機能（フィルタリング、結果数表示）
   - ソート機能（降順/昇順/解除）
   - 空データ時のメッセージ表示
   - 編集・削除ボタンの動作
   - 無限スクロール機能

5. **IdeaPageClient.test.tsx** (14テスト)
   - ページ全体の表示
   - 新規作成フロー（モーダル表示、データ送信）
   - 編集フロー（モーダル表示、初期データ、更新）
   - 削除処理
   - モーダル操作（開閉、キャンセル、編集データのクリア）
   - データのリフレッシュ

#### src/components/idea-categories/ (39テスト)

1. **IdeaCategoryIndexRow.test.tsx** (7テスト)
   - カテゴリ情報の表示
   - 説明がnullの場合のプレースホルダー
   - アイデア一覧リンクの表示と遷移先
   - 編集・削除ボタンのクリックイベント
   - ボタンの表示/非表示制御

2. **IdeaCategoryModal.test.tsx** (11テスト)
   - 作成/編集モードの切り替え
   - フォーム入力とsubmit
   - バリデーション（必須項目、文字数制限）
   - 初期データの表示（編集モード）
   - モーダルの開閉動作
   - 送信中の状態管理

3. **IdeaCategoryIndex.test.tsx** (9テスト)
   - カテゴリ一覧の表示
   - 検索機能（フィルタリング、結果数表示、0件時のメッセージ）
   - 編集・削除ボタンの動作
   - 無限スクロール機能（10件単位）
   - 検索中の無限スクロール無効化

4. **IdeaCategoryPageClient.test.tsx** (12テスト)
   - ページ全体の表示
   - 新規作成フロー（モーダル表示、データ送信）
   - 編集フロー（モーダル表示、初期データ、更新）
   - 削除処理
   - モーダル操作（開閉、キャンセル、編集データのクリア）
   - データのリフレッシュ

### テスト技術スタック

```typescript
- テストランナー: Vitest 3.2.4
- DOM環境: happy-dom 15.x
- Reactテスト: @testing-library/react 16.x
- ユーザーイベント: @testing-library/user-event 14.x
- アサーション拡張: @testing-library/jest-dom 6.x
```

### コンポーネントテストの書き方

#### 基本構造

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyComponent from "./MyComponent";

// モック設定
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("MyComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("コンポーネントが表示される", () => {
    render(<MyComponent />);
    expect(screen.getByText("テキスト")).toBeInTheDocument();
  });

  it("ユーザーインタラクションが動作する", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole("button", { name: "クリック" });
    await user.click(button);

    expect(screen.getByText("クリックされました")).toBeInTheDocument();
  });
});
```

#### framer-motionのモック

framer-motionを使用しているコンポーネントでは、以下のようにモックします:

```typescript
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));
```

#### Next.js Routerのモック

```typescript
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: mockRefresh,
  }),
  usePathname: () => "/current-path",
}));
```

#### カスタムフックのモック

```typescript
const mockSubmit = vi.fn();

vi.mock("@/hooks/useResourceSubmit", () => ({
  useResourceSubmit: (options: { onSuccess?: () => void }) => {
    return async (data: unknown) => {
      await mockSubmit(data);
      if (options.onSuccess) {
        options.onSuccess();
      }
    };
  },
}));
```

#### IntersectionObserverのモック

無限スクロールなどでIntersectionObserverを使用する場合:

```typescript
class IntersectionObserverMock {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
```

### テスト実行方法

```bash
# 全コンポーネントテスト
npm test -- src/components

# 特定のコンポーネントテスト
npm test -- src/components/ideas/IdeaModal.test.tsx

# watchモードで実行
npm test -- --watch src/components/ideas

# カバレッジ付き
npm test -- --coverage src/components/ideas
```

### カバレッジ目標

- [x] アイデア管理コンポーネント（ideas）
- [ ] ブレインライティングコンポーネント（brainwritings）
- [ ] マンダラートコンポーネント（mandalarts）
- [ ] オズボーンのチェックリストコンポーネント（osborn-checklists）
- [ ] 共通コンポーネント（shared）

### テストのベストプラクティス

1. **ユーザーの視点でテストする**
   - `getByRole`、`getByLabelText`を優先的に使用
   - `getByTestId`は最終手段として使用

2. **非同期処理を適切に扱う**
   - `waitFor`を使用して非同期処理の完了を待つ
   - `userEvent.setup()`を各テストで実行

3. **モックは必要最小限に**
   - 外部依存（API、Router、カスタムフック）のみモック
   - コンポーネント内のロジックはモックしない

4. **テストは独立させる**
   - `beforeEach`でモックをクリア
   - テスト間で状態を共有しない

5. **わかりやすいテスト名**
   - 日本語で具体的な動作を記述
   - 「〜の場合、〜が表示される」形式

### トラブルシューティング

#### 問題: `any`型のESLintエラー
**解決策**: 適切な型を使用する

```typescript
// ❌ 誤り
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// ✅ 正しい
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      <div {...props}>{children}</div>,
  },
}));
```

#### 問題: モーダルのテストが失敗する
**解決策**: framer-motionを適切にモックする

モーダルがframer-motionを使用している場合は、必ずモックを設定してください。

#### 問題: 非同期処理のテストがタイムアウトする
**解決策**: `waitFor`のタイムアウトを調整

```typescript
await waitFor(() => {
  expect(screen.getByText("完了")).toBeInTheDocument();
}, { timeout: 3000 }); // デフォルトは1000ms
```

