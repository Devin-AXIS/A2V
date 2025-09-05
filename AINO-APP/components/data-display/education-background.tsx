"use client"

import { GraduationCap, BookOpen } from "lucide-react"

const majors = ["计算机科学", "人工智能", "数据科学", "心理学", "语言学"]

export function EducationBackground() {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">学历及专业背景</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-sm font-medium text-blue-600">学历要求: 本科及以上</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mt-0.5">
            <BookOpen className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-green-600 mb-2">相关专业:</div>
            <div className="flex flex-wrap gap-2">
              {majors.map((major, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  {major}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
