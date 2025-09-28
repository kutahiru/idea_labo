import { notFound } from "next/navigation";
import BrainwritingInfo from "@/components/brainwriting/BrainwritingInfo";
import { getBrainwritingByToken } from "@/lib/brainwriting";

interface JoinPageProps {
  params: Promise<{ token: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { token } = await params;

  // トークンを使ってブレインライティングを取得
  const brainwritingData = await getBrainwritingByToken(token);

  // ブレインライティングが見つからない、または招待が無効な場合
  if (!brainwritingData) {
    notFound();
  }

  return (
    <div className="py-2">
      <div className="mx-auto max-w-4xl">
        <BrainwritingInfo brainwriting={brainwritingData} />

        <div className="mb-8 text-center">
          <h1 className="text-primary mb-4 text-3xl font-bold">
            ブレインライティングに招待されました
          </h1>
        </div>

        <div className="mt-8 text-center">
          <button className="group bg-primary inline-flex items-center rounded-md px-20 py-2 text-base font-medium text-white transition-transform hover:scale-105">
            参加する
          </button>
        </div>
      </div>
    </div>
  );
}
