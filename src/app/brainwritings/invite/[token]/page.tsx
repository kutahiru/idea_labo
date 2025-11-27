import { notFound, redirect } from "next/navigation";
import { getBrainwritingByToken, checkJoinStatus } from "@/lib/brainwriting";
import { auth } from "@/app/lib/auth";
import BrainwritingInviteClient from "@/components/brainwritings/BrainwritingInviteClient";
import { USAGE_SCOPE } from "../../../../utils/brainwriting";
import type { Metadata } from "next";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

/**
 * ブレインライティング招待ページの動的メタデータを生成する関数
 *
 * トークンからブレインライティング情報を取得し、SNSシェア用のOGPタグやTwitterカードを生成します。
 * これにより、招待URLをSNSでシェアした際に、テーマ名や画像が適切に表示されます。
 *
 * 生成されるメタデータ：
 * - ページタイトル（テーマ名を含む）
 * - 説明文（テーマ名を含む）
 * - Open Graphメタデータ（OGP画像: 1200x630px）
 * - Twitterカードメタデータ
 *
 * @param params - ルートパラメータ（token: 招待トークン）
 * @returns Next.jsメタデータオブジェクト
 */
export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const { token } = await params;
  const brainwritingData = await getBrainwritingByToken(token);

  if (!brainwritingData) {
    return {
      title: "招待が見つかりません",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const pageUrl = `${siteUrl}/brainwritings/invite/${token}`;
  const ogImageUrl = `${siteUrl}/brainwriting-ogp.png`;

  return {
    title: `ブレインライティングに招待されました - ${brainwritingData.themeName}`,
    description: `テーマ「${brainwritingData.themeName}」のブレインライティングに参加しませんか？`,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: `ブレインライティングに招待されました`,
      description: `テーマ: ${brainwritingData.themeName}`,
      url: pageUrl,
      siteName: "アイデア研究所",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "ブレインライティング",
        },
      ],
      type: "website",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: `ブレインライティングに招待されました`,
      description: `テーマ: ${brainwritingData.themeName}`,
      images: [ogImageUrl],
    },
  };
}

/**
 * ブレインライティング招待ページコンポーネント
 *
 * 招待トークンを使用してブレインライティングへの参加を促すページです。
 * ユーザーの状態（未ログイン、未参加、既参加）に応じて異なる表示・動作を行います。
 *
 * 動作フロー：
 * 1. トークンからブレインライティング情報を取得
 * 2. 招待が無効な場合: エラーメッセージを表示
 * 3. 未ログインユーザー: 招待ページを表示（ログインへの誘導あり）
 * 4. ログイン済み未参加ユーザー: 招待ページを表示（参加ボタンあり）
 * 5. 既参加ユーザー: 利用範囲に応じて自動リダイレクト
 *    - X投稿版: /brainwritings/sheet/[sheetId]/input へ
 *    - チーム版: /brainwritings/[id]/team へ
 *
 * ルート: /brainwritings/invite/[token]
 *
 * @param params - ルートパラメータ（token: 招待トークン）
 * @returns 招待ページ、エラーメッセージ、リダイレクト、または404ページ
 */
export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  // トークンを使ってブレインライティングを取得
  const brainwritingData = await getBrainwritingByToken(token);

  // ブレインライティングが見つからない場合
  if (!brainwritingData) {
    notFound();
  }

  // 招待が無効な場合の表示
  if (!brainwritingData.isInviteActive) {
    return (
      <div className="py-2">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-alert mb-4 text-2xl font-bold">招待が無効です</h1>
            <p className="text-2xl text-muted">この招待リンクは既に無効になっています。</p>
          </div>
        </div>
      </div>
    );
  }

  // 招待ページコンポーネント
  const inviteComponent = (
    <BrainwritingInviteClient brainwriting={brainwritingData} token={token} />
  );

  const session = await auth();

  // 未ログインの場合は招待ページを表示(ログインへの誘導あり)
  if (!session?.user?.id) {
    return inviteComponent;
  }

  const joinStatus = await checkJoinStatus(brainwritingData.id, session.user.id);

  // 未参加の場合は招待ページを表示
  if (!joinStatus.isJoined) {
    return inviteComponent;
  }

  // 既に参加している場合は適切なページにリダイレクト
  if (brainwritingData.usageScope === USAGE_SCOPE.XPOST) {
    redirect(`/brainwritings/sheet/${joinStatus.sheetId}/input`);
  } else if (brainwritingData.usageScope === USAGE_SCOPE.TEAM) {
    redirect(`/brainwritings/${brainwritingData.id}/team`);
  }
}
