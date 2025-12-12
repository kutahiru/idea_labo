import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/api/utils", () => ({
  validateIdRequest: vi.fn(),
  apiErrors: {
    notFound: (resource: string) => {
      return NextResponse.json({ error: `${resource}が見つかりません` }, { status: 404 });
    },
    serverError: () => {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    },
  },
}));

vi.mock("@/lib/mandalart", () => ({
  getMandalartById: vi.fn(),
  getAIGenerationByMandalartId: vi.fn(),
  createMandalartAIGeneration: vi.fn(),
}));

vi.mock("@/lib/mandalart-ai-worker", () => ({
  generateMandalartIdeas: vi.fn(),
}));

vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  };
});

import { validateIdRequest } from "@/lib/api/utils";
import {
  getMandalartById,
  getAIGenerationByMandalartId,
  createMandalartAIGeneration,
} from "@/lib/mandalart";
import { generateMandalartIdeas } from "@/lib/mandalart-ai-worker";

describe("POST /api/mandalarts/[id]/ai-generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 環境変数をモック
    process.env.OPENAI_MODEL = "gpt-5-nano";
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1/ai-generate", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    if (!response) return;
    expect(response.status).toBe(401);
  });

  it("無効なIDで400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/mandalarts/invalid/ai-generate",
      {
        method: "POST",
      }
    );

    const response = await POST(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    if (!response) return;
    expect(response.status).toBe(400);
  });

  it("マンダラートが見つからない場合404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 999,
    });

    // getMandalartByIdがnullを返すようモック
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getMandalartById).mockResolvedValue(null as any);

    const request = new NextRequest("http://localhost:3000/api/mandalarts/999/ai-generate", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    if (!response) return;
    expect(response.status).toBe(404);
  });

  it("既にAI生成が処理中の場合409を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(getMandalartById).mockResolvedValue({
      id: 1,
      title: "テスト",
      themeName: "テーマ",
      description: null,
      userId: "user-123",
    });

    vi.mocked(getAIGenerationByMandalartId).mockResolvedValue({
      id: 1,
      generation_status: "processing",
      error_message: null,
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1/ai-generate", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    if (!response) return;
    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toBe("AI生成は既に実行中です");
  });

  it("既にAI生成がpendingの場合409を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(getMandalartById).mockResolvedValue({
      id: 1,
      title: "テスト",
      themeName: "テーマ",
      description: null,
      userId: "user-123",
    });

    vi.mocked(getAIGenerationByMandalartId).mockResolvedValue({
      id: 1,
      generation_status: "pending",
      error_message: null,
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1/ai-generate", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    if (!response) return;
    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toBe("AI生成は既に実行中です");
  });

  it("既にAI生成が完了している場合409を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(getMandalartById).mockResolvedValue({
      id: 1,
      title: "テスト",
      themeName: "テーマ",
      description: null,
      userId: "user-123",
    });

    vi.mocked(getAIGenerationByMandalartId).mockResolvedValue({
      id: 1,
      generation_status: "completed",
      error_message: null,
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1/ai-generate", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    if (!response) return;
    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toBe("AI生成は既に完了しています");
  });

  it("正常にAI生成を開始する（開発環境）", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(getMandalartById).mockResolvedValue({
      id: 1,
      title: "テスト",
      themeName: "テーマ",
      description: null,
      userId: "user-123",
    });

    vi.mocked(getAIGenerationByMandalartId).mockResolvedValue(null);

    vi.mocked(createMandalartAIGeneration).mockResolvedValue({
      id: 100,
    });

    vi.mocked(generateMandalartIdeas).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1/ai-generate", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    if (!response) return;
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.generationId).toBe(100);
    expect(data.status).toBe("pending");
    expect(data.message).toBe("AI生成を開始しました");

    // ローカル実行の場合、generateMandalartIdeasが呼ばれる
    expect(generateMandalartIdeas).toHaveBeenCalledWith({
      generationId: 100,
      mandalartId: 1,
      userId: "user-123",
    });

    process.env.NODE_ENV = originalNodeEnv;
  });

  it("失敗状態の既存レコードがある場合、新規生成を開始できる", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(getMandalartById).mockResolvedValue({
      id: 1,
      title: "テスト",
      themeName: "テーマ",
      description: null,
      userId: "user-123",
    });

    vi.mocked(getAIGenerationByMandalartId).mockResolvedValue({
      id: 99,
      generation_status: "failed",
      error_message: "以前のエラー",
    });

    vi.mocked(createMandalartAIGeneration).mockResolvedValue({
      id: 100,
    });

    vi.mocked(generateMandalartIdeas).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1/ai-generate", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    if (!response) return;
    expect(response.status).toBe(200);

    process.env.NODE_ENV = originalNodeEnv;
  });
});
