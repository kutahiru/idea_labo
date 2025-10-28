import { notFound } from "next/navigation";
import { getOsbornChecklistDetailByToken } from "@/lib/osborn-checklist";
import OsbornChecklistPublicClient from "@/components/osborn-checklists/OsbornChecklistPublicClient";

interface OsbornChecklistPublicPageProps {
  params: Promise<{ token: string }>;
}

export default async function OsbornChecklistPublicPage({ params }: OsbornChecklistPublicPageProps) {
  const { token } = await params;

  // 公開トークンでオズボーン詳細取得
  const osbornChecklistDetail = await getOsbornChecklistDetailByToken(token);

  if (!osbornChecklistDetail) {
    notFound();
  }

  return <OsbornChecklistPublicClient osbornChecklistDetail={osbornChecklistDetail} />;
}
