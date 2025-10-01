import { BrainwritingListItem } from "@/types/brainwriting";

interface BrainwritingInfoProps {
  brainwriting: BrainwritingListItem;
}

export default function BrainwritingInfo({ brainwriting }: BrainwritingInfoProps) {
  return (
    <>
      {/* ブレインライティングタイトル */}
      <div className="mb-4 text-center">
        <h2 className="text-primary text-3xl font-bold">{brainwriting.title}</h2>
      </div>

      {/* テーマ */}
      <div className="mb-4 text-center">
        <div className="border-primary inline-block rounded border-[3px] px-8 py-3">
          <h3 className="text-primary text-3xl font-bold">{brainwriting.themeName}</h3>
        </div>
      </div>

      {/* 説明 */}
      {brainwriting.description && (
        <div className="mx-auto mb-4 max-w-4xl">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="whitespace-pre-wrap text-gray-700">{brainwriting.description}</p>
          </div>
        </div>
      )}
    </>
  );
}