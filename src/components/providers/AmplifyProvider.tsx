"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { Amplify } from "aws-amplify";
import { useSession } from "next-auth/react";

// Amplify設定完了状態を管理するContext
const AmplifyConfigContext = createContext({ isConfigured: false });

export const useAmplifyConfig = () => useContext(AmplifyConfigContext);

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const configureAmplify = async () => {
      // ログインしていない場合は設定しない
      if (status !== "authenticated" || !session) {
        setIsConfigured(false);
        return;
      }

      // 既に設定済みの場合は再実行しない
      if (isConfigured) {
        return;
      }

      try {
        // サーバーから一時認証情報を取得
        const response = await fetch("/api/auth/cognito-credentials");

        if (!response.ok) {
          console.error("Failed to get Cognito credentials");
          setIsConfigured(false);
          return;
        }

        const credentials = await response.json();
        console.log("Cognito認証情報を取得:", {
          identityId: credentials.identityId,
          hasAccessKey: !!credentials.accessKeyId,
          hasSecretKey: !!credentials.secretAccessKey,
          hasSessionToken: !!credentials.sessionToken,
          expiration: credentials.expiration,
        });

        // Amplifyを設定（IAM認証モード）
        Amplify.configure({
          API: {
            Events: {
              endpoint: process.env.NEXT_PUBLIC_APPSYNC_EVENTS_URL!,
              region: process.env.NEXT_PUBLIC_APPSYNC_REGION!,
              defaultAuthMode: "iam",
            },
          },
        }, {
          Auth: {
            credentialsProvider: {
              getCredentialsAndIdentityId: async () => ({
                credentials: {
                  accessKeyId: credentials.accessKeyId,
                  secretAccessKey: credentials.secretAccessKey,
                  sessionToken: credentials.sessionToken,
                  expiration: new Date(credentials.expiration),
                },
                identityId: credentials.identityId,
              }),
              clearCredentialsAndIdentityId: () => {
                // クリーンアップ処理（必要に応じて）
              },
            },
          },
        });

        setIsConfigured(true);
      } catch (error) {
        console.error("Amplify configuration error:", error);
        setIsConfigured(false);
      }
    };

    configureAmplify();
  }, [session, status]);

  return (
    <AmplifyConfigContext.Provider value={{ isConfigured }}>
      {children}
    </AmplifyConfigContext.Provider>
  );
}
