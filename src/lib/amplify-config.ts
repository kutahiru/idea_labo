/**
 * AWS Amplify設定
 */
import { Amplify } from "aws-amplify";

// Amplifyの設定を初期化
export function configureAmplify() {
  Amplify.configure({
    API: {
      Events: {
        endpoint: process.env.NEXT_PUBLIC_APPSYNC_EVENTS_URL!,
        region: process.env.NEXT_PUBLIC_APPSYNC_REGION!,
        defaultAuthMode: "apiKey",
        apiKey: process.env.NEXT_PUBLIC_APPSYNC_API_KEY!,
      },
    },
  });
}
