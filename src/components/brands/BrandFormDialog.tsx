import { useEffect, useState, type FormEvent } from "react";
import Modal from "../ui/Modal";
import FormField from "../ui/FormField";

interface BrandFormDialogProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialName?: string;
  isSubmitting: boolean;
  fieldError?: string;
  formError: string | null;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export default function BrandFormDialog({
  isOpen,
  mode,
  initialName = "",
  isSubmitting,
  fieldError,
  formError,
  onClose,
  onSubmit,
}: BrandFormDialogProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (isOpen) setName(initialName);
  }, [isOpen, initialName]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Add Brand" : "Edit Brand"}
    >
      {formError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="brand-name"
          label="Name"
          value={name}
          onChange={setName}
          error={fieldError}
          required
          placeholder="e.g. Cisco"
          autoComplete="off"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting
              ? "Saving…"
              : mode === "create"
                ? "Create"
                : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}