import IdeaFrameworkModal from "@/components/shared/IdeaFrameworkModal";
import UsageScopeSelector from "./UsageScopeSelector";
import { BrainwritingFormData } from "@/types/brainwriting";
import { brainwritingFormDataSchema } from "@/schemas/brainwriting";

interface BrainwritingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BrainwritingFormData) => Promise<void>;
  initialData?: BrainwritingFormData;
  mode: "create" | "edit";
}

export default function BrainwritingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: BrainwritingModalProps) {
  // ブレインライティング固有のデフォルト値を設定
  const defaultData: BrainwritingFormData = {
    title: "",
    themeName: "",
    description: "",
    usageScope: "xpost",
    ...initialData,
  };

  return (
    <IdeaFrameworkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      initialData={defaultData}
      mode={mode}
      schema={brainwritingFormDataSchema}
    >
      {({ formData, setFormData, errors, isSubmitting }) => (
        <UsageScopeSelector
          value={formData.usageScope}
          onChange={value => {
            setFormData(prev => ({ ...prev, usageScope: value }));
          }}
          errors={errors.usageScope}
          disabled={isSubmitting}
        />
      )}
    </IdeaFrameworkModal>
  );
}
