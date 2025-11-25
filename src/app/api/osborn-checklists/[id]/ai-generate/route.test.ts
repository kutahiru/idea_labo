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

vi.mock("@/lib/osborn-checklist", () => ({
  getOsbornChecklistById: vi.fn(),
  getAIGenerationByOsbornChecklistId: vi.fn(),
  createAIGeneration: vi.fn(),
}));

vi.mock("@/lib/osborn-ai-worker", () => ({
  generateOsbornIdeas: vi.fn(),
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

vi.mock("@/schemas/osborn-checklist", () => ({
  OSBORN_CHECKLIST_TYPES: {
    TRANSFER: "transfer",
    APPLY: "apply",
    MODIFY: "modify",
    MAGNIFY: "magnify",
    MINIFY: "minify",
    SUBSTITUTE: "substitute",
    REARRANGE: "rearrange",
    REVERSE: "reverse",
    COMBINE: "combine",
  },
}));

import { validateIdRequest } from "@/lib/api/utils";
import { getOsbornChecklistById } from "@/lib/osborn-checklist";

describe("POST /api/osborn-checklists/[id]/ai-generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 環境変数をモック
    process.env.OPENAI_MODEL = "gpt-5-nano";
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/1/ai-generate", {
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
      "http://localhost:3000/api/osborn-checklists/invalid/ai-generate",
      {
        method: "POST",
      }
    );

    const response = await POST(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    if (!response) return;
    expect(response.status).toBe(400);
  });

  it("オズボーンのチェックリストが見つからない場合404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 999,
    });

    // getOsbornChecklistByIdがnullを返すようモック
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getOsbornChecklistById).mockResolvedValue(null as any);

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/999/ai-generate", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    if (!response) return;
    expect(response.status).toBe(404);
  });
});
