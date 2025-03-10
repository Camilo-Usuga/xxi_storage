import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { FileIcon, FileText, FileImage, FileAudio, FileVideo, File } from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getFileIcon(mimeType: string) {
  if (!mimeType) return File

  if (mimeType.startsWith("image/")) {
    return FileImage
  } else if (mimeType.startsWith("audio/")) {
    return FileAudio
  } else if (mimeType.startsWith("video/")) {
    return FileVideo
  } else if (mimeType === "application/pdf" || mimeType.includes("text/") || mimeType.includes("document")) {
    return FileText
  } else {
    return FileIcon
  }
}

