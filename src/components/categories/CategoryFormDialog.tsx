import { useEffect, useState, type FormEvent } from "react";
import Modal from "../ui/Modal";
import FormField from "../ui/FormField";

interface CategoryFormDialogProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialName?: string;
  isSubmitting: boolean;
  fieldError?: string;
  formError: string | null;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export default function CategoryFormDialog({
  isOpen,
  mode,
  initialName = "",
  isSubmitting,
  fieldError,
  formError,
  onClose,
  onSubmit,
}: CategoryFormDialogProps) {
  const [name, setName] = useState(initialName);

  // Reload the input whenever the dialog opens with a new target.
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
      title={mode === "create" ? "Add Category" : "Edit Category"}
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
          id="category-name"
          label="Name"
          value={name}
          onChange={setName}
          error={fieldError}
          required
          placeholder="e.g. Switches"
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