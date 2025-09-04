"use client"

import { AppCard } from "@/components/layout/app-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye } from "lucide-react"
import { CardRegistry } from "../registry"
import type { BusinessCardProps } from "@/types"

interface ProductData {
  id: string
  name: string
  price: string
  image: string
  rating: number
  inStock: boolean
}

interface EcommerceProductCardProps extends BusinessCardProps {
  data: ProductData
}

export function EcommerceProductCard({ data, onAction, ...props }: EcommerceProductCardProps) {
  const handleViewDetail = () => {
    onAction?.("openDetail", { id: data.id })
  }

  const handleAddToCart = () => {
    onAction?.("addToCart", { productId: data.id, quantity: 1 })
  }

  const handleQuickView = () => {
    onAction?.("openModal", {
      title: "商品详情",
      content: (
        <div className="p-6">
          <img
            src={data.image || "/placeholder.svg"}
            alt={data.name}
            className="w-full h-48 object-cover mb-4 rounded-lg"
          />
          <h3 className="text-lg font-bold mb-2" style={{ color: "var(--card-title-color)" }}>
            {data.name}
          </h3>
          <p className="text-2xl font-bold text-blue-600 mb-4">{data.price}</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-500">★</span>
            <span className="text-sm" style={{ color: "var(--card-text-color)" }}>
              {data.rating}
            </span>
          </div>
          <Button onClick={handleAddToCart} className="w-full" disabled={!data.inStock}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            加入购物车
          </Button>
        </div>
      ),
    })
  }

  return (
    <AppCard className="overflow-hidden hover:shadow-lg transition-shadow" {...props}>
      <div className="relative">
        <img src={data.image || "/placeholder.svg"} alt={data.name} className="w-full h-48 object-cover" />
        {!data.inStock && <Badge className="absolute top-2 right-2 bg-red-500">缺货</Badge>}
      </div>

      <div className="p-4">
        <h3 className="font-bold mb-2" style={{ color: "var(--card-title-color)" }}>
          {data.name}
        </h3>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-blue-600">{data.price}</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm" style={{ color: "var(--card-text-color)" }}>
              {data.rating}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleQuickView} className="flex-1 bg-transparent">
            <Eye className="w-4 h-4 mr-1" />
            快速查看
          </Button>

          <Button size="sm" onClick={handleViewDetail} className="flex-1">
            查看详情
          </Button>

          <Button variant="outline" size="sm" onClick={handleAddToCart} disabled={!data.inStock}>
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </AppCard>
  )
}

// 注册卡片及其业务流配置
CardRegistry.register({
  name: "ecommerce-product",
  category: "ecommerce",
  component: EcommerceProductCard,
  businessFlow: {
    hasDetailPage: true,
    hasModal: true,
    actions: ["addToCart", "addToWishlist", "share"],
  },
  developer: {
    name: "E-commerce Team",
    version: "1.0.0",
    description: "电商产品展示卡片，支持快速查看、详情页跳转、购物车操作",
  },
})

// 注册自定义动作处理器
CardRegistry.registerActionHandler("ecommerce-product", (action) => {
  switch (action.target) {
    case "addToCart":
      // 调用购物车API
      console.log("添加到购物车:", action.data)
      break
    case "addToWishlist":
      // 调用收藏API
      console.log("添加到收藏:", action.data)
      break
    case "share":
      // 调用分享功能
      console.log("分享商品:", action.data)
      break
  }
})
