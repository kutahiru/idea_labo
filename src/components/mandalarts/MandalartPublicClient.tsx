"use client";

import { MandalartDetail } from "@/types/mandalart";
import IdeaFrameworkInfo from "../shared/IdeaFrameworkInfo";
import MandalartGrid from "./MandalartGrid";

interface MandalartPublicClientProps {
  mandalartDetail: MandalartDetail;
}

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
