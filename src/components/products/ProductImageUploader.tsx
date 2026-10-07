import { useEffect, useMemo, useRef, type ChangeEvent } from "react";
import type { ProductImage } from "../../types";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const ACCEPT_ATTR = ".jpg,.jpeg,.png,.webp";

interface ProductImageUploaderProps {
  existingImages: ProductImage[];
  /** IDs of existing images the admin marked for deletion. */
  deleteImageIds: number[];
  onToggleExistingDelete: (id: number) => void;
  newFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveNewFile: (index: number) => void;
  error?: string;
}

export default function ProductImageUploader({
  existingImages,
  deleteImageIds,
  onToggleExistingDelete,
  newFiles,
  onAddFiles,
  onRemoveNewFile,
  error,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Local object URLs for new-file previews. Revoked when `newFiles` changes.
  const previews = useMemo(
    () => newFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [newFiles],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const accepted: File[] = [];

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_SIZE_BYTES) continue;
      accepted.push(file);
    }

    if (accepted.length > 0) onAddFiles(accepted);
    // Reset the input so selecting the same file twice still fires onChange.
    if (inputRef.current) inputRef.current.value = "";
  };

  // The first file the admin uploads on a new product becomes primary.
  const firstNewFileIndex = 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Product images</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
        >
          + Add images
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-label="Add product images"
      />

      <p className="mt-1 text-xs text-slate-500">
        JPEG, PNG or WebP · up to 2 MB each. The first image is used as the
        primary.
      </p>

      {/* Thumbnails */}
      {(existingImages.length > 0 || previews.length > 0) && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {/* Existing */}
          {existingImages.map((image) => {
            const marked = deleteImageIds.includes(image.id);
            return (
              <div
                key={`existing-${image.id}`}
                className={`group relative overflow-hidden rounded-lg border bg-white ${
                  marked ? "border-rose-300 opacity-50" : "border-slate-200"
                }`}
              >
                <img
                  src={image.url}
                  alt=""
                  className="aspect-square w-full object-cover"
                />

                {image.is_primary && !marked && (
                  <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Primary
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onToggleExistingDelete(image.id)}
                  className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow transition ${
                    marked
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                  aria-label={marked ? "Undo removal" : "Mark for removal"}
                  title={marked ? "Undo removal" : "Mark for removal"}
                >
                  {marked ? "↺" : "×"}
                </button>

                {marked && (
                  <div className="absolute inset-x-0 bottom-0 bg-rose-600/90 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white">
                    Will be removed
                  </div>
                )}
              </div>
            );
          })}

          {/* New */}
          {previews.map((preview, index) => {
            const isPrimaryCandidate =
              existingImages.length === 0 && index === firstNewFileIndex;
            return (
              <div
                key={`new-${index}`}
                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                <img
                  src={preview.url}
                  alt=""
                  className="aspect-square w-full object-cover"
                />

                {isPrimaryCandidate && (
                  <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Primary
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onRemoveNewFile(index)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white shadow transition hover:bg-rose-700"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}