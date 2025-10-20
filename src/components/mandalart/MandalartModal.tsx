import IdeaFrameworkModal from "@/components/shared/IdeaFrameworkModal";
import { MandalartFormData, mandalartFormDataSchema } from "@/schemas/mandalart";

interface MandalartModalProps {
  onClose: () => void;
  onSubmit: (data: MandalartFormData) => Promise<void>;
  initialData?: MandalartFormData;
  mode: "create" | "edit";
}

export default function MandalartModal({
  onClose,
  onSubmit,
  initialData,
  mode,
}: MandalartModalProps) {
  const defaultData: MandalartFormData = {
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
      schema={mandalartFormDataSchema}
    />
  );
}
