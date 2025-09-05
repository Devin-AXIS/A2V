export default function FontSizeSimplePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">字体大小简单测试</h1>
        <p className="text-xl text-muted-foreground">
          这是一个简单的测试页面
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">字体大小说明</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="text-sm text-gray-500 mb-1">小字体 (80%)</div>
            <div className="text-sm">适合密集信息展示，节省屏幕空间</div>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <div className="text-sm text-gray-500 mb-1">正常字体 (100%)</div>
            <div className="text-base">标准字体大小，适合大多数用户</div>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4 py-2">
            <div className="text-sm text-gray-500 mb-1">大字体 (120%)</div>
            <div className="text-lg">增强可读性，适合视力不佳的用户</div>
          </div>
        </div>
      </div>
    </div>
  )
}
