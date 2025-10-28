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
 * AppSync Eventsにイベントを発行
 */
export async function publishEvent({ namespace, channel, data }: PublishEventParams) {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_APPSYNC_EVENTS_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_APPSYNC_API_KEY!,
      },
      body: JSON.stringify({
        channel,
        events: [
          JSON.stringify({
            namespace,
            data,
          }),
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AppSync Events発行エラー:", error);
      throw new Error(`Failed to publish event: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("publishEvent エラー:", error);
    throw error;
  }
}
