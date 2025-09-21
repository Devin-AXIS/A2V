"use client"

import type React from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface FormInputProps {
  label: string
  required?: boolean
  error?: string
  children?: React.ReactNode
  className?: string
}

export function FormInput({ label, required, error, children, className }: FormInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

interface TextInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  type?: "text" | "email" | "tel" | "url" | "password"
  className?: string
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  type = "text",
  className,
}: TextInputProps) {
  return (
    <FormInput label={label} required={required} error={error} className={className}>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white"
      />
    </FormInput>
  )
}

interface TextareaInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  rows?: number
  className?: string
}

export function TextareaInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  rows = 3,
  className,
}: TextareaInputProps) {
  return (
    <FormInput label={label} required={required} error={error} className={className}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="bg-white"
      />
    </FormInput>
  )
}
