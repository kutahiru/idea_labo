import { BaseIdeaListItem } from "@/schemas/idea-framework";

interface IdeaFrameworkInfoProps {
  ideaFramework: BaseIdeaListItem;
}

/**
 * アイデアフレームワークの基本情報を表示するコンポーネント
 *
 * ブレインライティング、マンダラート、オズボーンのチェックリストなど、
 * 各フレームワークの詳細ページの上部に共通して表示される情報ブロックです。
 * タイトル、テーマ名（強調表示）、説明（任意）で構成されます。
 *
 * @param ideaFramework - 表示するアイデアフレームワークの基本情報
 */
export default function IdeaFrameworkInfo({ ideaFramework }: IdeaFrameworkInfoProps) {
  return (
    <>
      {/* タイトル */}
      <div className="mb-4 text-center">
        <h2 className="text-primary text-3xl font-bold">{ideaFramework.title}</h2>
      </div>

      {/* テーマ */}
      <div className="mb-4 text-center">
        <div className="border-primary inline-block rounded border-[3px] px-8 py-3">
          <h3 className="text-primary decoration-accent text-3xl font-bold underline decoration-8 underline-offset-[-6px]">
            {ideaFramework.themeName}
          </h3>
        </div>
      </div>

      {/* 説明 */}
      {ideaFramework.description && (
        <div className="mx-auto mb-4 max-w-4xl">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="whitespace-pre-wrap text-gray-700">{ideaFramework.description}</p>
          </div>
        </div>
      )}
    </>
  );
}
