import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { CognitoIdentityClient, GetIdCommand, GetCredentialsForIdentityCommand } from "@aws-sdk/client-cognito-identity";

/**
 * Cognito Identity Poolから一時認証情報を取得
 * ブラウザからのAppSync Events接続用
 */
export async function GET() {
  try {
    // NextAuth.jsのセッションを確認
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = new CognitoIdentityClient({
      region: process.env.NEXT_PUBLIC_APPSYNC_REGION || "ap-northeast-1",
    });

    // Cognito Identity IDを取得（未認証アクセス）
    // NextAuth.jsのセッションでAPIアクセス制御済みなので、
    // Cognitoでは未認証IDを使用（どの認証方式でも動作する）
    const getIdCommand = new GetIdCommand({
      IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID!,
      // Loginsパラメータなし = 未認証アクセス
    });

    const { IdentityId } = await client.send(getIdCommand);

    if (!IdentityId) {
      throw new Error("Failed to get Identity ID");
    }

    // 一時認証情報を取得（未認証ロールの権限を使用）
    const getCredsCommand = new GetCredentialsForIdentityCommand({
      IdentityId,
      // Loginsパラメータなし = 未認証ロール（購読のみ可能）
    });

    const { Credentials } = await client.send(getCredsCommand);

    if (!Credentials) {
      throw new Error("Failed to get credentials");
    }

    return NextResponse.json({
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretKey,
      sessionToken: Credentials.SessionToken,
      expiration: Credentials.Expiration,
      identityId: IdentityId,
    });
  } catch (error) {
    console.error("Cognito認証情報取得エラー:", error);
    return NextResponse.json(
      { error: "Failed to get credentials" },
      { status: 500 }
    );
  }
}
