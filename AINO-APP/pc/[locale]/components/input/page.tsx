import { getDictionary, type Locale } from "@/lib/dictionaries"
import { TextInput } from "@/components/input/text-input"
import { SearchBar } from "@/components/input/search-bar"
import { Checkbox } from "@/components/input/checkbox"
import { SwitchControl } from "@/components/input/switch-control"
import { RadioGroup } from "@/components/input/radio-group"
import { Slider } from "@/components/input/slider"
import { Rate } from "@/components/input/rate"
import { Stepper } from "@/components/input/stepper"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"

export default async function PCInputComponentsPage({ params: { locale } }: { params: { locale: Locale } }) {
  const dict = await getDictionary(locale)

  const radioOptions = [
    { id: "option1", label: "选项一", value: "1" },
    { id: "option2", label: "选项二", value: "2" },
    { id: "option3", label: "选项三", value: "3" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* PC Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/pc/${locale}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-800">输入组件</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Text Input */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">文本输入</h3>
            <div className="space-y-4">
              <TextInput
                label="用户名"
                placeholder="请输入用户名"
                value=""
                onChange={(value) => console.log('Username:', value)}
              />
              <TextInput
                label="密码"
                type="password"
                placeholder="请输入密码"
                value=""
                onChange={(value) => console.log('Password:', value)}
              />
              <TextInput
                label="邮箱"
                type="email"
                placeholder="请输入邮箱地址"
                value=""
                onChange={(value) => console.log('Email:', value)}
                error="请输入有效的邮箱地址"
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">搜索框</h3>
            <div className="space-y-4">
              <SearchBar
                placeholder="搜索内容..."
                onSearch={(query) => console.log('Search:', query)}
              />
              <SearchBar
                placeholder="带清除按钮的搜索..."
                showClear
                onSearch={(query) => console.log('Search:', query)}
                onClear={() => console.log('Search cleared')}
              />
            </div>
          </div>

          {/* Checkbox */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">复选框</h3>
            <div className="space-y-3">
              <Checkbox
                id="checkbox1"
                label="同意用户协议"
                checked={false}
                onChange={(checked) => console.log('Checkbox 1:', checked)}
              />
              <Checkbox
                id="checkbox2"
                label="接收邮件通知"
                checked={true}
                onChange={(checked) => console.log('Checkbox 2:', checked)}
              />
              <Checkbox
                id="checkbox3"
                label="记住登录状态"
                checked={false}
                disabled
                onChange={(checked) => console.log('Checkbox 3:', checked)}
              />
            </div>
          </div>

          {/* Switch Control */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">开关控制</h3>
            <div className="space-y-4">
              <SwitchControl
                label="推送通知"
                checked={true}
                onChange={(checked) => console.log('Push notifications:', checked)}
              />
              <SwitchControl
                label="深色模式"
                checked={false}
                onChange={(checked) => console.log('Dark mode:', checked)}
              />
              <SwitchControl
                label="自动更新"
                checked={true}
                disabled
                onChange={(checked) => console.log('Auto update:', checked)}
              />
            </div>
          </div>

          {/* Radio Group */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">单选按钮组</h3>
            <RadioGroup
              name="example"
              options={radioOptions}
              value="1"
              onChange={(value) => console.log('Radio selected:', value)}
            />
          </div>

          {/* Slider */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">滑块</h3>
            <div className="space-y-6">
              <Slider
                label="音量"
                min={0}
                max={100}
                value={50}
                onChange={(value) => console.log('Volume:', value)}
              />
              <Slider
                label="亮度"
                min={0}
                max={100}
                value={75}
                step={5}
                onChange={(value) => console.log('Brightness:', value)}
              />
            </div>
          </div>

          {/* Rate */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">评分</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">产品评分</label>
                <Rate
                  value={4}
                  onChange={(value) => console.log('Rating:', value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">服务评分（只读）</label>
                <Rate
                  value={3.5}
                  allowHalf
                  disabled
                  onChange={(value) => console.log('Service rating:', value)}
                />
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">步进器</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">数量</label>
                <Stepper
                  value={1}
                  min={1}
                  max={10}
                  onChange={(value) => console.log('Quantity:', value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">步长为5</label>
                <Stepper
                  value={10}
                  min={0}
                  max={100}
                  step={5}
                  onChange={(value) => console.log('Step value:', value)}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
