import IdeaFrameworkModal from "@/components/shared/IdeaFrameworkModal";
import UsageScopeSelector from "./UsageScopeSelector";
import { BrainwritingFormData, brainwritingFormDataSchema } from "@/schemas/brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";

interface BrainwritingModalProps {
  onClose: () => void;
  onSubmit: (data: BrainwritingFormData) => Promise<void>;
  initialData?: BrainwritingFormData;
  mode: "create" | "edit";
}

export default function BrainwritingModal({
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
    usageScope: USAGE_SCOPE.XPOST,
    ...initialData,
  };

  return (
    <IdeaFrameworkModal
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
          disabled={isSubmitting || mode === "edit"}
        />
      )}
    </IdeaFrameworkModal>
  );
}
