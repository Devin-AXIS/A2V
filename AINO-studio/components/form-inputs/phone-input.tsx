"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { ChevronDown, Check, Search } from "lucide-react"
import { countryCodes, type CountryCode } from "@/lib/country-codes"

export function PhoneInput({
  value = "",
  onChange,
  placeholder = "请输入手机号",
}: {
  value?: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]) // 默认中国
  const [phoneNumber, setPhoneNumber] = useState("")

  // 解析当前值，分离国家代码和手机号
  useEffect(() => {
    if (value) {
      // 查找匹配的国家代码
      const matchedCountry = countryCodes.find(country => 
        value.startsWith(country.dialCode)
      )
      
      if (matchedCountry) {
        setSelectedCountry(matchedCountry)
        setPhoneNumber(value.substring(matchedCountry.dialCode.length))
      } else {
        // 如果没有匹配的国家代码，假设是中国号码
        setPhoneNumber(value)
      }
    }
  }, [value])

  // 过滤国家数据
  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function handleCountrySelect(country: CountryCode) {
    setSelectedCountry(country)
    setOpen(false)
    setSearchTerm("")
    
    // 更新完整值
    const fullNumber = phoneNumber ? `${country.dialCode}${phoneNumber}` : ""
    onChange(fullNumber)
  }

  function handlePhoneChange(newPhone: string) {
    setPhoneNumber(newPhone)
    
    // 更新完整值
    const fullNumber = newPhone ? `${selectedCountry.dialCode}${newPhone}` : ""
    onChange(fullNumber)
  }

  return (
    <div className="flex gap-2">
      {/* 国家代码选择器 */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-auto min-w-[120px] justify-between bg-white/70 px-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[400px] p-0 overflow-hidden bg-white/80 backdrop-blur border-white/60 rounded-2xl"
        >
          <div className="p-3 border-b border-white/60">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索国家..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 border-white/60"
              />
            </div>
          </div>
          <ScrollArea className="h-72">
            <ul className="py-1">
              {filteredCountries.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground text-center">
                  未找到匹配的国家
                </li>
              )}
              {filteredCountries.map((country) => (
                <li key={country.code}>
                  <button
                    className={
                      "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/80 " +
                      (selectedCountry.code === country.code ? "bg-sky-50" : "")
                    }
                    onClick={() => handleCountrySelect(country)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{country.flag}</span>
                      <div className="flex flex-col">
                        <span className={selectedCountry.code === country.code ? "text-sky-600 font-medium" : ""}>
                          {country.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {country.dialCode}
                        </span>
                      </div>
                    </div>
                    {selectedCountry.code === country.code && <Check className="h-4 w-4 text-sky-600" />}
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* 手机号输入框 */}
      <Input
        type="tel"
        className="flex-1 bg-white/70"
        value={phoneNumber}
        onChange={(e) => handlePhoneChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
