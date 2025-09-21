"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { locationData } from "@/config/location-data"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"

interface CitySelectMobileProps {
  value?: string // "广东 - 深圳市"
  onChange?: (value: string) => void
  placeholder?: string
}

export function CitySelectMobile({ value, onChange, placeholder = "请选择省/市" }: CitySelectMobileProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#3b82f6"

  const [isOpen, setIsOpen] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState<(typeof locationData)[0] | null>(null)
  const [selectedCity, setSelectedCity] = useState<string>("")

  useEffect(() => {
    if (value) {
      const [provinceName, cityName] = value.split(" - ")
      const province = locationData.find((p) => p.name === provinceName)
      if (province) {
        setSelectedProvince(province)
        setSelectedCity(cityName || "")
      }
    } else {
      setSelectedProvince(null)
      setSelectedCity("")
    }
  }, [value])

  const handleProvinceSelect = (province: (typeof locationData)[0]) => {
    setSelectedProvince(province)
    setSelectedCity("")
  }

  const handleCitySelect = (city: string) => {
    if (selectedProvince) {
      const newValue = `${selectedProvince.name} - ${city}`
      setSelectedCity(city)
      onChange?.(newValue)
      setIsOpen(false)
    }
  }

  const displayText = value || placeholder

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-white/80 transition-all duration-300 text-sm",
        )}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>{displayText}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      <BottomDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="选择城市">
        <div className="flex h-full">
          {/* Province list */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 overflow-y-auto p-2">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">省份</h4>
              {locationData.map((province) => (
                <button
                  key={province.name}
                  onClick={() => handleProvinceSelect(province)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-between",
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
                  <span>{province.name}</span>
                  {selectedProvince?.name === province.name && (
                    <Check className="w-4 h-4" style={{ color: primaryColor }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* City list */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 overflow-y-auto p-2">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">城市</h4>
              {!selectedProvince ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">请先选择省份</div>
              ) : (
                selectedProvince.cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-between",
                      selectedCity === city ? "font-medium shadow-sm" : "hover:bg-muted/50",
                    )}
                    style={
                      selectedCity === city
                        ? {
                            backgroundColor: `${primaryColor}15`,
                            color: primaryColor,
                            borderColor: `${primaryColor}30`,
                          }
                        : {}
                    }
                  >
                    <span>{city}</span>
                    {selectedCity === city && <Check className="w-4 h-4" style={{ color: primaryColor }} />}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </BottomDrawer>
    </>
  )
}
