import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Modal from "../ui/Modal";
import FormField from "../ui/FormField";

interface BrandFormDialogProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialName?: string;
  initialImageUrl?: string | null;
  isSubmitting: boolean;
  fieldError?: string;
  imageError?: string;
  formError: string | null;
  onClose: () => void;
  onSubmit: (name: string, brandImage: File | null) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPT_ATTR = ".jpg,.jpeg,.png,.webp";

export default function BrandFormDialog({
  isOpen,
  mode,
  initialName = "",
  initialImageUrl = null,
  isSubmitting,
  fieldError,
  imageError,
  formError,
  onClose,
  onSubmit,
}: BrandFormDialogProps) {
  const [name, setName] = useState(initialName);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localImageError, setLocalImageError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset local state whenever the dialog opens or the target changes.
  useEffect(() => {
    if (!isOpen) return;
    setName(initialName);
    setImageFile(null);
    setPreviewUrl(null);
    setLocalImageError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [isOpen, initialName, initialImageUrl]);

  // Manage the object URL for the newly selected file.
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalImageError("Please choose a JPEG, PNG, or WebP image.");
      setImageFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > MAX_BYTES) {
      setLocalImageError("Image must be 2 MB or smaller.");
      setImageFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setLocalImageError(null);
    setImageFile(file);
  };

  const handleClearSelection = () => {
    setImageFile(null);
    setLocalImageError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed, imageFile);
  };

  // What to show: new preview wins, then existing image (edit mode only).
  const displayUrl = previewUrl ?? (mode === "edit" ? initialImageUrl : null);
  const isNewSelection = previewUrl !== null;
  const displayedImageError = localImageError ?? imageError ?? null;

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

        {/* Image picker */}
        <div>
          <label
            htmlFor="brand-image"
            className="block text-sm font-medium text-slate-700"
          >
            Brand image
            <span className="ml-1 text-xs font-normal text-slate-500">
              (optional)
            </span>
          </label>

          <input
            ref={inputRef}
            id="brand-image"
            name="brand_image"
            type="file"
            accept={ACCEPT_ATTR}
            onChange={handleFileChange}
            className="mt-1.5 block w-full cursor-pointer rounded-lg border border-slate-300 bg-white text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            disabled={isSubmitting}
            aria-invalid={Boolean(displayedImageError)}
            aria-describedby={
              displayedImageError ? "brand-image-error" : undefined
            }
          />

          <p className="mt-1 text-xs text-slate-500">
            JPEG, PNG, or WebP · up to 2 MB.
          </p>

          {displayUrl && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white">
                <img
                  src={displayUrl}
                  alt="Brand image preview"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0 flex-1 text-xs">
                {isNewSelection ? (
                  <>
                    <p className="truncate font-medium text-slate-900">
                      {imageFile?.name}
                    </p>
                    <p className="text-slate-500">
                      New image · will replace the existing one
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-slate-900">
                      Current image
                    </p>
                    <p className="text-slate-500">
                      Select a new file above to replace it.
                    </p>
                  </>
                )}
              </div>

              {isNewSelection && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="shrink-0 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {displayedImageError && (
            <p
              id="brand-image-error"
              className="mt-1 text-xs text-rose-600"
            >
              {displayedImageError}
            </p>
          )}
        </div>

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