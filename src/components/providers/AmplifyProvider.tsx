"use client";

import { Amplify } from "aws-amplify";

// コンポーネント外で即座に設定を初期化
if (typeof window !== "undefined") {
  Amplify.configure({
    API: {
      Events: {
        endpoint: process.env.NEXT_PUBLIC_APPSYNC_EVENTS_URL!,
        region: process.env.NEXT_PUBLIC_APPSYNC_REGION!,
        defaultAuthMode: "apiKey" as const,
        apiKey: process.env.NEXT_PUBLIC_APPSYNC_API_KEY!,
      },
    },
  });
}

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
