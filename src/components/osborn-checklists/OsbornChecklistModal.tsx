import IdeaFrameworkModal from "@/components/shared/IdeaFrameworkModal";
import { OsbornChecklistFormData, osbornChecklistFormDataSchema } from "@/schemas/osborn-checklist";

interface OsbornChecklistModalProps {
  onClose: () => void;
  onSubmit: (data: OsbornChecklistFormData) => Promise<void>;
  initialData?: OsbornChecklistFormData;
  mode: "create" | "edit";
}

export default function OsbornChecklistModal({
  onClose,
  onSubmit,
  initialData,
  mode,
}: OsbornChecklistModalProps) {
  const defaultData: OsbornChecklistFormData = {
    title: "",
    themeName: "",
    description: null,
    ...initialData,
  };

  return (
    <IdeaFrameworkModal
      onClose={onClose}
      onSubmit={onSubmit}
      initialData={defaultData}
      mode={mode}
      schema={osbornChecklistFormDataSchema}
    />
  );
}
