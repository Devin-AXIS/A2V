"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { locationData } from "@/config/location-data"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"

interface CascaderProps {
  placeholder: string
}

export function Cascader({ placeholder }: CascaderProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#3b82f6"

  const [isOpen, setIsOpen] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState(locationData[0])
  const [selectedValue, setSelectedValue] = useState("")

  const handleSelectCity = (city: string) => {
    if (selectedProvince) {
      setSelectedValue(`${selectedProvince.name} - ${city}`)
    }
    setIsOpen(false)
  }

  if (!locationData || locationData.length === 0) {
    return (
      <div className="w-full max-w-sm">
        <button
          disabled
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-100/60 backdrop-blur-lg rounded-xl shadow-sm border border-gray-200/80 text-gray-400 cursor-not-allowed text-sm"
        >
          <span>{placeholder}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2.5 bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-white/80 transition-all duration-300 text-sm",
          isOpen && "ring-2 shadow-lg",
        )}
        style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
      >
        <span className={selectedValue ? "text-gray-900" : "text-gray-400"}>{selectedValue || placeholder}</span>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <BottomDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="选择省/市">
        <div className="flex h-full">
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 overflow-y-auto p-2">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">省份</h4>
              {locationData.map((province) => (
                <button
                  key={province.name}
                  onClick={() => setSelectedProvince(province)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                    selectedProvince?.name === province.name ? "font-medium shadow-sm" : "hover:bg-muted/50",
                  )}
                  style={
                    selectedProvince?.name === province.name
                      ? {
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                        borderColor: `${primaryColor}30`,
                      }
                      : {}
                  }
                >
                  {province.name}
                </button>
              ))}
            </div>
          </div>

          <div className="w-1/2 flex flex-col">
            <div className="flex-1 overflow-y-auto p-2">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">城市</h4>
              {(selectedProvince?.cities || []).map((city) => (
                <button
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:bg-muted/50"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </BottomDrawer>
    </div>
  )
}
