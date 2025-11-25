"use client";

import { MandalartDetail } from "@/types/mandalart";
import IdeaFrameworkInfo from "../shared/IdeaFrameworkInfo";
import MandalartGrid from "./MandalartGrid";

interface MandalartPublicClientProps {
  mandalartDetail: MandalartDetail;
}

/**
 * マンダラート公開結果閲覧ページのクライアントコンポーネント
 *
 * 公開リンクからアクセスしたユーザーに対して、マンダラートの完成結果を
 * 読み取り専用（readOnly）で表示します。
 *
 * @param mandalartDetail - マンダラートの詳細情報（テーマ名、入力データを含む）
 */
export default function MandalartPublicClient({ mandalartDetail }: MandalartPublicClientProps) {
  const { inputs, ...mandalart } = mandalartDetail;

  return (
    <div className="mb-8">
      <IdeaFrameworkInfo ideaFramework={mandalart} />
      <div>
        <MandalartGrid
          themeName={mandalart.themeName}
          inputs={inputs}
          onInputChange={async () => {}}
          readOnly={true}
        />
      </div>
    </div>
  );
}
