import { FontSizeDemo } from "@/components/theme/font-size-demo"

export default function FontSizeDemoPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">字体大小演示</h1>
        <p className="text-xl text-muted-foreground">
          体验不同字体大小档位的效果，所有文字将按比例调整
        </p>
      </div>
      
      <FontSizeDemo />
    </div>
  )
}
