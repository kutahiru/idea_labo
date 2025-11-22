/**
 * サーバー側 AppSync Events ユーティリティ
 * API Routeからイベントを発行するために使用
 */

interface PublishEventParams {
  namespace: string;
  channel: string;
  data: unknown;
}

/**
 * AppSync Eventsにイベントを発行（API Key認証）
 * サーバー側のイベント発行専用
 * クライアント側のイベント購読はIAM認証を継続
 */
export async function publishEvent({ namespace, channel, data }: PublishEventParams) {
  try {
    // channelにnamespaceを含める
    const fullChannel = `${namespace}${channel}`;
    const appsyncUrl = process.env.APPSYNC_EVENTS_URL;
    const apiKey = process.env.APPSYNC_API_KEY;

    console.log("📡 AppSync Events発行:", {
      fullChannel,
      data,
      appsyncUrl: appsyncUrl ? "✓" : "✗",
      apiKey: apiKey ? "✓" : "✗",
    });

    if (!appsyncUrl) {
      throw new Error("APPSYNC_EVENTS_URL is not set");
    }

    if (!apiKey) {
      throw new Error("APPSYNC_API_KEY is not set");
    }

    // API Key認証でリクエスト
    const response = await fetch(appsyncUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        channel: fullChannel,
        events: [JSON.stringify(data)],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AppSync Events発行エラー:", {
        status: response.status,
        statusText: response.statusText,
        body: error,
      });
      throw new Error(`Failed to publish event: ${response.status}`);
    }

    console.log("✅ AppSync Events発行成功");
    return { success: true };
  } catch (error) {
    console.error("publishEvent エラー:", error);
    throw error;
  }
}
