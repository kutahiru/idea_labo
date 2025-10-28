import { notFound } from "next/navigation";
import { getMandalartDetailByToken } from "@/lib/mandalart";
import MandalartPublicClient from "@/components/mandalarts/MandalartPublicClient";

interface MandalartPublicPageProps {
  params: Promise<{ token: string }>;
}

export default async function MandalartPublicPage({ params }: MandalartPublicPageProps) {
  const { token } = await params;

  // 公開トークンでマンダラート詳細取得
  const mandalartDetail = await getMandalartDetailByToken(token);

  if (!mandalartDetail) {
    notFound();
  }

  return <MandalartPublicClient mandalartDetail={mandalartDetail} />;
}
