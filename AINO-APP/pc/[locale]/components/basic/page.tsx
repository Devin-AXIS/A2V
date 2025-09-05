import { AppHeader } from "@/components/navigation/app-header"
import { getDictionary, type Locale } from "@/lib/dictionaries"
import { ContactMethodItem } from "@/components/basic/contact-method-item"
import { Pagination } from "@/components/basic/pagination"
import { FloatingButton } from "@/components/basic/floating-button"
import { PillButton } from "@/components/basic/pill-button"
import { Phone, Mail, MessageCircle, MapPin, Plus, ArrowLeft } from 'lucide-react'
import Link from "next/link"

export default async function PCBasicComponentsPage({ params: { locale } }: { params: { locale: Locale } }) {
  const dict = await getDictionary(locale)

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
              <h1 className="text-xl font-semibold text-gray-800">基础组件</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          
          {/* Contact Method Items */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">联系方式组件</h3>
            <div className="space-y-3">
              <ContactMethodItem
                icon={Phone}
                label="电话"
                value="+86 138 0013 8000"
                href="tel:+8613800138000"
              />
              <ContactMethodItem
                icon={Mail}
                label="邮箱"
                value="contact@example.com"
                href="mailto:contact@example.com"
              />
              <ContactMethodItem
                icon={MessageCircle}
                label="微信"
                value="iPollo_Official"
                href="#"
              />
              <ContactMethodItem
                icon={MapPin}
                label="地址"
                value="北京市朝阳区xxx街道"
                href="#"
              />
            </div>
          </div>

          {/* Pagination */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">分页组件</h3>
            <div className="space-y-4">
              <Pagination
                currentPage={1}
                totalPages={10}
                onPageChange={(page) => console.log('Page changed to:', page)}
              />
              <Pagination
                currentPage={5}
                totalPages={20}
                onPageChange={(page) => console.log('Page changed to:', page)}
              />
            </div>
          </div>

          {/* Pill Buttons */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">胶囊按钮</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <PillButton variant="default">默认按钮</PillButton>
                <PillButton variant="primary">主要按钮</PillButton>
                <PillButton variant="secondary">次要按钮</PillButton>
              </div>
              <div className="flex flex-wrap gap-2">
                <PillButton variant="success">成功按钮</PillButton>
                <PillButton variant="warning">警告按钮</PillButton>
                <PillButton variant="danger">危险按钮</PillButton>
              </div>
              <div className="flex flex-wrap gap-2">
                <PillButton variant="outline">轮廓按钮</PillButton>
                <PillButton variant="ghost">幽灵按钮</PillButton>
              </div>
            </div>
          </div>

          {/* Floating Button */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">浮动按钮</h3>
            <div className="relative h-32 bg-gray-50 rounded-lg">
              <FloatingButton
                icon={Plus}
                onClick={() => console.log('Floating button clicked')}
                className="absolute bottom-4 right-4"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
