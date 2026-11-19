"use client";

import { CameraIcon, FileTextIcon, Loader2Icon, UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { compressImage, mapWithConcurrency, type CompressOptions } from "@/lib/image/compress";
import { cn } from "@/lib/utils";
import { FieldShell } from "./FieldShell";
import { useKitField, type KitFieldOptions } from "./useKitField";

export const DEFAULT_UPLOAD_ACCEPT = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export interface FileUploadFieldProps extends KitFieldOptions {
  /** Allowed MIME types. Keep in step with the API's allowlist. */
  accept?: readonly string[];
  maxFiles?: number;
  /** Limit per file after compression, in MB. */
  maxSizeMb?: number;
  /** Show a "Take photo" button that opens the phone camera. */
  allowCamera?: boolean;
  compressOptions?: CompressOptions;
  disabled?: boolean;
  className?: string;
}

/** Thumbnail for one image file, read as a data URL (photos are already compressed). */
function ImagePreview({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file.type.startsWith("image/") || typeof FileReader === "undefined") return;
    let active = true;
    const reader = new FileReader();
    reader.onload = () => {
      if (active && typeof reader.result === "string") setUrl(reader.result);
    };
    reader.readAsDataURL(file);
    return () => {
      active = false;
      reader.abort();
    };
  }, [file]);
  return url ? (
    <Image src={url} alt="" fill unoptimized className="object-cover" />
  ) : (
    <FileTextIcon aria-hidden="true" className="text-muted-foreground size-8" />
  );
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Drag-and-drop, file picker and camera upload. Photos are compressed on the
 * phone (2 at a time) before they enter the form value (`File[]`). Every
 * thumbnail has a remove button that is always visible, including on touch
 * screens where there is no hover.
 */
export function FileUploadField({
  name,
  label,
  required,
  description,
  accept = DEFAULT_UPLOAD_ACCEPT,
  maxFiles = 20,
  maxSizeMb = 10,
  allowCamera = true,
  compressOptions,
  disabled,
  className,
}: FileUploadFieldProps) {
  const { field, helpers, id, error, errorId, descriptionId, controlProps } = useKitField<File[]>({
    name,
    label,
    required,
    description,
  });
  const files: File[] = Array.isArray(field.value) ? field.value : [];
  const [processing, setProcessing] = useState(false);
  const [notice, setNotice] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const noticeId = useId();

  async function addFiles(incoming: File[]) {
    if (incoming.length === 0) return;
    const found: string[] = [];
    const allowed = incoming.filter((f) => {
      if (!accept.includes(f.type)) {
        found.push(`${f.name} is not a supported file type`);
        return false;
      }
      return true;
    });
    const room = Math.max(0, maxFiles - files.length);
    if (allowed.length > room)
      found.push(`Only ${maxFiles} files allowed; ${allowed.length - room} not added`);
    const toProcess = allowed.slice(0, room);

    setProcessing(true);
    try {
      const processed = await mapWithConcurrency(toProcess, 2, (f) =>
        compressImage(f, compressOptions),
      );
      const fitting = processed.filter((f) => {
        if (f.size > maxSizeMb * 1024 * 1024) {
          found.push(`${f.name} is larger than ${maxSizeMb} MB`);
          return false;
        }
        return true;
      });
      await helpers.setValue([...files, ...fitting]);
      void helpers.setTouched(true, false);
      const added = fitting.length
        ? `${fitting.length} file${fitting.length === 1 ? "" : "s"} added.`
        : "";
      setProblems(found);
      setNotice([added, ...found].filter(Boolean).join(" "));
    } finally {
      setProcessing(false);
    }
  }

  function removeAt(index: number) {
    const removed = files[index];
    void helpers.setValue(files.filter((_, i) => i !== index));
    setProblems([]);
    setNotice(`${removed?.name ?? "File"} removed.`);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (!disabled) void addFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <FieldShell {...{ id, label, required, description, descriptionId, error, errorId, className }}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "border-input bg-muted/40 flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-5 text-center",
          dragging && "border-primary bg-secondary",
          error && "border-destructive",
        )}
      >
        <UploadIcon aria-hidden="true" className="text-muted-foreground size-6" />
        <p className="text-muted-foreground text-sm">
          <span className="md:hidden">Add photos or PDFs (up to {maxFiles}).</span>
          <span className="hidden md:inline">
            Drag files here, or choose photos or PDFs (up to {maxFiles}).
          </span>
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" asChild disabled={disabled || processing}>
            <label htmlFor={id} className="cursor-pointer">
              Choose files
            </label>
          </Button>
          {allowCamera ? (
            <Button
              type="button"
              variant="outline"
              disabled={disabled || processing}
              onClick={() => cameraRef.current?.click()}
            >
              <CameraIcon aria-hidden="true" />
              Take photo
            </Button>
          ) : null}
        </div>
        <input
          {...controlProps}
          type="file"
          name={name}
          multiple
          accept={accept.join(",")}
          disabled={disabled || processing}
          className="sr-only"
          onBlur={() => void helpers.setTouched(true)}
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            e.target.value = "";
            void addFiles(picked);
          }}
        />
        {allowCamera ? (
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              e.target.value = "";
              void addFiles(picked);
            }}
          />
        ) : null}
        {processing ? (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2Icon aria-hidden="true" className="size-4 animate-spin" />
            Preparing photos…
          </p>
        ) : null}
      </div>

      <p id={noticeId} aria-live="polite" className="sr-only">
        {notice}
      </p>
      {problems.length > 0 ? (
        <ul className="text-destructive list-disc pl-5 text-sm">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}

      {files.length > 0 ? (
        <ol
          className="grid grid-cols-3 gap-3 sm:grid-cols-4"
          aria-label={`${label}: ${files.length} file${files.length === 1 ? "" : "s"}`}
        >
          {files.map((file, index) => {
            return (
              <li key={`${file.name}-${file.lastModified}-${index}`} className="relative">
                <div className="bg-muted relative flex aspect-square items-center justify-center overflow-hidden rounded-md border">
                  <ImagePreview file={file} />
                </div>
                <p className="mt-1 truncate text-xs" title={file.name}>
                  {index + 1}. {file.name}{" "}
                  <span className="text-muted-foreground">({formatSize(file.size)})</span>
                </p>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  disabled={disabled}
                  aria-label={`Remove file ${index + 1}, ${file.name}`}
                  className="bg-background/95 text-foreground focus-visible:ring-ring/50 absolute top-1 right-1 rounded-full border p-1.5 shadow-sm outline-none focus-visible:ring-[3px]"
                >
                  <XIcon aria-hidden="true" className="size-4" />
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}
    </FieldShell>
  );
}
