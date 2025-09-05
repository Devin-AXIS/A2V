"use client"

import { useState } from "react"
import { Pagination } from "@/components/navigation/pagination"
import { PillButton } from "@/components/basic/pill-button"
import { FloatingButton } from "@/components/basic/floating-button"
import { ContactMethodItem } from "@/components/basic/contact-method-item"
import { Tag } from "@/components/basic/tag"
import { Avatar, AvatarGroup } from "@/components/basic/avatar"
import { AppCard } from "@/components/layout/app-card"
import { Star, Heart, Code, Zap } from "lucide-react"

interface BasicComponentsClientViewProps {
  dict: {
    pagination: string
    pillButton: string
    floatingButton: string
    floatingButtonDescription: string
    previous: string
    next: string
    contactMethodItem: string
    contactMethodItemTitle: string
    contactMethodItemDescription: string
    contactMethodItemButtonText: string
  }
}

export function BasicComponentsClientView({ dict }: BasicComponentsClientViewProps) {
  const [currentPage, setCurrentPage] = useState(2)
  const totalPages = 17

  return (
    <main className="px-4">
      <div className="space-y-12">
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{dict.pagination}</h3>
          <AppCard className="flex justify-center items-center p-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              prevText={dict.previous}
              nextText={dict.next}
            />
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{dict.pillButton}</h3>
          <AppCard className="flex flex-wrap justify-center items-center gap-4 p-8">
            <PillButton variant="default">Default</PillButton>
            <PillButton variant="primary">Primary</PillButton>
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{dict.floatingButton}</h3>
          <AppCard className="relative flex justify-center items-center h-40 p-8">
            <p style={{ color: "var(--card-text-color)" }}>{dict.floatingButtonDescription}</p>
            <FloatingButton className="absolute bottom-4 right-4" />
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{dict.contactMethodItem}</h3>
          <AppCard className="flex justify-center items-center p-8">
            <div className="w-full max-w-md">
              <ContactMethodItem
                icon="chat"
                title={dict.contactMethodItemTitle}
                description={dict.contactMethodItemDescription}
                buttonText={dict.contactMethodItemButtonText}
                href="#"
              />
            </div>
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">头像组件 Avatar</h3>
          <AppCard className="space-y-6 p-8">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">基础头像</h4>
              <div className="flex gap-4 items-center">
                <Avatar isBordered color="default" src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                <Avatar isBordered color="primary" src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                <Avatar isBordered color="secondary" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                <Avatar isBordered color="success" src="https://i.pravatar.cc/150?u=a04258114e29026302d" />
                <Avatar isBordered color="warning" src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
                <Avatar isBordered color="danger" src="https://i.pravatar.cc/150?u=a04258114e29026708c" />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">不同尺寸</h4>
              <div className="flex gap-4 items-center">
                <Avatar size="sm" color="primary" alt="小头像" />
                <Avatar size="md" color="secondary" alt="中等头像" />
                <Avatar size="lg" color="success" alt="大头像" />
                <Avatar size="xl" color="warning" alt="超大头像" />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">头像组 - 团队展示</h4>
              <div className="space-y-4">
                {/* 小团队 */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">小团队 (4人)</p>
                  <AvatarGroup max={4} spacing="tight">
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026302d" />
                  </AvatarGroup>
                </div>
                
                {/* 中等团队 */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">中等团队 (6人，显示4个 +2)</p>
                  <AvatarGroup max={4} spacing="normal">
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026302d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026708c" />
                  </AvatarGroup>
                </div>
                
                {/* 大团队 */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">大团队 (10人，显示4个 +6)</p>
                  <AvatarGroup max={4} spacing="loose">
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026302d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026708c" />
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026025d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826713d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026705d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026303d" />
                  </AvatarGroup>
                </div>
                
                {/* 使用 total 属性的简洁写法 */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">使用 total 属性 (10人，显示3个 +7)</p>
                  <AvatarGroup isBordered max={3} total={10} spacing="normal">
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                    <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                  </AvatarGroup>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Fallback 模式</h4>
              <div className="flex gap-4 items-center">
                <Avatar color="primary" alt="张三" />
                <Avatar color="secondary" alt="李四" />
                <Avatar color="success" alt="王五" />
                <Avatar color="warning" alt="赵六" />
                <Avatar color="danger" alt="钱七" />
              </div>
            </div>
          </AppCard>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">标签组件</h3>
          <AppCard className="space-y-6 p-8">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">基础标签</h4>
              <div className="flex flex-wrap gap-2">
                <Tag variant="default">默认标签</Tag>
                <Tag variant="white">白色标签</Tag>
                <Tag variant="outline">边框标签</Tag>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">带图标标签</h4>
              <div className="flex flex-wrap gap-2">
                <Tag variant="white" icon={<Star className="w-3 h-3" />}>
                  收藏
                </Tag>
                <Tag variant="white" icon={<Heart className="w-3 h-3" />}>
                  喜欢
                </Tag>
                <Tag variant="white" icon={<Code className="w-3 h-3" />}>
                  编程
                </Tag>
                <Tag variant="white" icon={<Zap className="w-3 h-3" />}>
                  技能
                </Tag>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">不同尺寸</h4>
              <div className="flex flex-wrap items-center gap-2">
                <Tag size="sm" variant="white">
                  小标签
                </Tag>
                <Tag size="md" variant="white">
                  中等标签
                </Tag>
              </div>
            </div>
          </AppCard>
        </section>
      </div>
    </main>
  )
}
