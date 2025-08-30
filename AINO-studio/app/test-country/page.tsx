"use client"

import { useState } from "react"
import { CountrySelect } from "@/components/country-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function TestCountryPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("")

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">国家字段测试</h1>
      
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>国家选择组件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="country">选择国家/地区</Label>
            <CountrySelect
              value={selectedCountry}
              onChange={setSelectedCountry}
              placeholder="请选择国家/地区"
            />
          </div>
          
          <div className="pt-4">
            <Label>选中的国家：</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCountry || "未选择"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
