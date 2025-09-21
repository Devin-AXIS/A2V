"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, FileIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface FileUploaderProps {
  label: string
}

export function FileUploader({ label }: FileUploaderProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#3b82f6"
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  })

  return (
    <div className="w-full max-w-sm">
      {file ? (
        <div className="relative flex items-center p-3 bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-white/80">
          <FileIcon className="w-6 h-6" style={{ color: primaryColor }} />
          <div className="ml-3 text-xs">
            <p className="font-medium text-gray-800">{file.name}</p>
            <p className="text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="absolute top-1.5 right-1.5 p-1 rounded-full hover:bg-gray-500/10"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 px-4 text-center border-2 border-dashed rounded-xl cursor-pointer transition-colors",
            "border-gray-300/80",
          )}
          style={{
            borderColor: isDragActive || isFocused ? primaryColor : undefined,
            backgroundColor: isDragActive ? `${primaryColor}1A` : undefined, // 10% opacity
          }}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      )}
    </div>
  )
}
