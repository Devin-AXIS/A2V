"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { File, X, Download } from "lucide-react"

interface FileInputProps {
    value?: string
    onChange?: (value: string) => void
    accept?: string
    disabled?: boolean
}

export function FileInput({
    value = "",
    onChange,
    accept = "*/*",
    disabled = false,
}: FileInputProps) {
    const [uploading, setUploading] = useState(false)

    const handleFileUpload = () => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = accept

        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files
            if (files && files.length > 0) {
                const file = files[0]
                setUploading(true)
                try {
                    const form = new FormData()
                    form.append("file", file)
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://47.94.52.142::3001'}/api/upload`, {
                        method: "POST",
                        body: form,
                    })
                    const data = await res.json()
                    if (!res.ok || !data?.success || !data?.url) {
                        throw new Error(data?.message || "上传失败")
                    }
                    onChange?.(data.url)
                } catch (err) {
                    console.error("文件上传失败", err)
                    // 可以在此处集成全局 toast
                } finally {
                    setUploading(false)
                }
            }
        }
        input.click()
    }

    const removeFile = () => {
        onChange?.("")
    }

    const downloadFile = () => {
        if (value) {
            window.open(value, '_blank')
        }
    }

    const getFileName = (url: string) => {
        try {
            const pathname = new URL(url).pathname
            return pathname.split('/').pop() || '文件'
        } catch {
            return '文件'
        }
    }

    return (
        <div className="space-y-2">
            {/* 已上传的文件 */}
            {value && (
                <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                    <File className="h-4 w-4 text-gray-500" />
                    <span className="text-sm flex-1 truncate" title={getFileName(value)}>
                        {getFileName(value)}
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={downloadFile}
                        disabled={disabled}
                    >
                        <Download className="h-3 w-3" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={removeFile}
                        disabled={disabled}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {/* 上传按钮 */}
            {!value && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleFileUpload}
                    disabled={disabled || uploading}
                    className="w-full"
                >
                    {uploading ? "上传中..." : "选择文件"}
                </Button>
            )}

            {/* 重新上传按钮 */}
            {value && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFileUpload}
                    disabled={disabled || uploading}
                >
                    {uploading ? "上传中..." : "重新上传"}
                </Button>
            )}
        </div>
    )
}
