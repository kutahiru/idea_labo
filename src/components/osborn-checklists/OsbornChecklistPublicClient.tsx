"use client";

import { OsbornChecklistDetail } from "@/types/osborn-checklist";
import IdeaFrameworkInfo from "../shared/IdeaFrameworkInfo";
import OsbornChecklistGrid from "./OsbornChecklistGrid";

interface OsbornChecklistPublicClientProps {
  osbornChecklistDetail: OsbornChecklistDetail;
}

/**
 * オズボーンのチェックリストの公開用
 * 編集不可で表示のみの簡易なView
 * @param props.osbornChecklistDetail
 */
export default function OsbornChecklistPublicClient({
  osbornChecklistDetail,
}: OsbornChecklistPublicClientProps) {
  const { inputs, ...osbornChecklist } = osbornChecklistDetail;

  return (
    <div className="mb-8">
      <IdeaFrameworkInfo ideaFramework={osbornChecklist} />
      <div>
        <OsbornChecklistGrid
          osbornChecklistId={osbornChecklist.id}
          inputs={inputs}
          onInputChange={async () => {}}
          readOnly={true}
        />
      </div>
    </div>
  );
}
