"use client"

import React, { useEffect, useState } from "react"
import { validateCardLayout } from "@/lib/card-layout-constraints"
import { validateLayout } from "@/lib/unified-design-constraints"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

/**
 * 架构验证器组件
 * 实时检查组件是否符合架构原则
 */
interface ArchitectureValidatorProps {
  componentName: string
  componentProps: any
  showDetails?: boolean
  onValidationChange?: (isValid: boolean) => void
}

export function ArchitectureValidator({
  componentName,
  componentProps,
  showDetails = false,
  onValidationChange
}: ArchitectureValidatorProps) {
  const [cardLayoutValidation, setCardLayoutValidation] = useState<any>(null)
  const [designValidation, setDesignValidation] = useState<any>(null)
  const [isValid, setIsValid] = useState(true)

  // 验证卡片布局架构
  useEffect(() => {
    const validation = validateCardLayout(componentName, componentProps)
    setCardLayoutValidation(validation)
  }, [componentName, componentProps])

  // 验证设计约束
  useEffect(() => {
    const validation = validateLayout(componentName, componentProps)
    setDesignValidation(validation)
  }, [componentName, componentProps])

  // 计算整体有效性
  useEffect(() => {
    const cardValid = cardLayoutValidation?.isValid ?? true
    const designValid = designValidation?.isValid ?? true
    const overallValid = cardValid && designValid
    
    setIsValid(overallValid)
    onValidationChange?.(overallValid)
  }, [cardLayoutValidation, designValidation, onValidationChange])

  if (!showDetails) {
    return (
      <Badge 
        variant={isValid ? "default" : "destructive"}
        className="fixed top-4 right-4 z-50"
      >
        {isValid ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            架构 ✓
          </>
        ) : (
          <>
            <XCircle className="w-3 h-3 mr-1" />
            架构 ✗
          </>
        )}
      </Badge>
    )
  }

  return (
    <Card className="fixed top-4 right-4 w-96 max-h-96 overflow-y-auto z-50 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          架构验证器
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 卡片布局验证 */}
        <div>
          <h4 className="text-sm font-medium mb-2">卡片布局架构</h4>
          {cardLayoutValidation ? (
            cardLayoutValidation.isValid ? (
              <Alert className="py-2">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  符合"卡片是内容承载"原则
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" className="py-2">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {cardLayoutValidation.violations[0]}
                </AlertDescription>
              </Alert>
            )
          ) : (
            <Alert className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                验证中...
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* 设计约束验证 */}
        <div>
          <h4 className="text-sm font-medium mb-2">设计约束</h4>
          {designValidation ? (
            designValidation.isValid ? (
              <Alert className="py-2">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  符合统一设计约束
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" className="py-2">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {designValidation.violations[0]}
                </AlertDescription>
              </Alert>
            )
          ) : (
            <Alert className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                验证中...
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* 详细建议 */}
        {(cardLayoutValidation?.recommendations?.length > 0 || 
          designValidation?.recommendations?.length > 0) && (
          <div>
            <h4 className="text-sm font-medium mb-2">改进建议</h4>
            <div className="space-y-1">
              {cardLayoutValidation?.recommendations?.map((rec: string, index: number) => (
                <div key={`card-${index}`} className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  {rec}
                </div>
              ))}
              {designValidation?.recommendations?.map((rec: string, index: number) => (
                <div key={`design-${index}`} className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  {rec}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 架构原则说明 */}
        <div className="pt-2 border-t">
          <h4 className="text-xs font-medium mb-2 text-muted-foreground">架构原则</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• 卡片是内容承载</div>
            <div>• 组件专注于功能</div>
            <div>• 主次关系明确</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 架构验证器Hook
 * 在组件中使用，自动验证架构
 */
export function useArchitectureValidator(componentName: string, componentProps: any) {
  const [isValid, setIsValid] = useState(true)
  const [violations, setViolations] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])

  useEffect(() => {
    // 验证卡片布局
    const cardValidation = validateCardLayout(componentName, componentProps)
    
    // 验证设计约束
    const designValidation = validateLayout(componentName, componentProps)
    
    // 合并结果
    const allViolations = [
      ...(cardValidation.violations || []),
      ...(designValidation.violations || [])
    ]
    
    const allRecommendations = [
      ...(cardValidation.recommendations || []),
      ...(designValidation.recommendations || [])
    ]
    
    const overallValid = cardValidation.isValid && designValidation.isValid
    
    setIsValid(overallValid)
    setViolations(allViolations)
    setRecommendations(allRecommendations)
    
    // 开发环境下输出警告
    if (process.env.NODE_ENV === 'development' && !overallValid) {
      console.warn(`架构验证失败 - ${componentName}:`, allViolations)
      console.log('改进建议:', allRecommendations)
    }
  }, [componentName, componentProps])

  return {
    isValid,
    violations,
    recommendations,
    // 便捷验证方法
    validate: () => ({ isValid, violations, recommendations })
  }
}
