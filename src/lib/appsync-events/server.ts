/**
 * サーバー側 AppSync Events ユーティリティ
 * API Routeからイベントを発行するために使用
 */
import { PublishRequest } from "ob-appsync-events-request";

interface PublishEventParams {
  namespace: string;
  channel: string;
  data: unknown;
}

/**
 * AppSync Eventsにイベントを発行（IAM認証）
 * Amplify HostingのIAMロールを使用して署名
 */
export async function publishEvent({ namespace, channel, data }: PublishEventParams) {
  try {
    // channelにnamespaceを含める
    const fullChannel = `${namespace}${channel}`;
    const appsyncUrl = process.env.APPSYNC_EVENTS_URL;
    const region = process.env.APPSYNC_REGION || "ap-northeast-1";

    console.log("📡 AppSync Events発行:", {
      fullChannel,
      data,
      appsyncUrl: appsyncUrl ? "✓" : "✗",
      region,
    });

    if (!appsyncUrl) {
      throw new Error("APPSYNC_EVENTS_URL is not set");
    }

    // IAM署名付きリクエストを作成
    // リージョンを明示的に指定してIAMロールの認証情報を使用
    const request = await PublishRequest.signed(
      {
        url: appsyncUrl,
        region: region,
      },
      fullChannel,
      data
    );

    console.log("📤 AppSync Events発行リクエスト送信");

    const response = await fetch(request);

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
