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
 */
export async function publishEvent({ namespace, channel, data }: PublishEventParams) {
  try {
    // channelにnamespaceを含める
    const fullChannel = `${namespace}${channel}`;
    const appsyncUrl = process.env.APPSYNC_EVENTS_URL;
    console.log("📡 AppSync Events発行:", {
      fullChannel,
      data,
      appsyncUrl,
      awsRegion: process.env.AWS_REGION,
      appsyncRegion: process.env.APPSYNC_REGION
    });

    if (!appsyncUrl) {
      throw new Error("APPSYNC_EVENTS_URL is not set");
    }

    // IAM署名付きリクエストを作成
    // 第3引数以降はイベントデータのみ（namespaceは不要）
    const request = await PublishRequest.signed(
      appsyncUrl,
      fullChannel,
      data
    );

    console.log("📤 リクエストURL:", request.url);

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

    return { success: true };
  } catch (error) {
    console.error("publishEvent エラー:", error);
    throw error;
  }
}
