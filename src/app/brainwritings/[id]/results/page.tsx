import { notFound } from "next/navigation";
import BrainwritingResultsClient from "@/components/brainwritings/BrainwritingResultsClient";
import { getBrainwritingResultsById } from "@/lib/brainwriting";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BrainwritingResultsPage({ params }: PageProps) {
  const { id } = await params;
  const brainwritingId = Number(id);

  // ブレインライティング詳細を取得（権限チェックなし）
  const brainwritingDetail = await getBrainwritingResultsById(brainwritingId);

  if (!brainwritingDetail) {
    notFound();
  }

  return <BrainwritingResultsClient brainwritingDetail={brainwritingDetail} />;
}
