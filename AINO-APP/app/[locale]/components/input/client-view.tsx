"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

// Import all component demos
import { TextInput } from "@/components/input/text-input"
import { SwitchControl } from "@/components/input/switch-control"
import { SearchBar } from "@/components/input/search-bar"
import { SearchWithSuggestions } from "@/components/input/search-with-suggestions"
import { Checkbox } from "@/components/input/checkbox"
import { Cascader } from "@/components/input/cascader"
import { CitySelectMobile } from "@/components/input/city-select-mobile"
import { DateTimePicker } from "@/components/input/date-time-picker"
import { YearMonthPicker } from "@/components/input/year-month-picker"
import { DateRangePicker } from "@/components/input/date-range-picker"
import { TagInput } from "@/components/input/tag-input"
import { ImageUpload } from "@/components/input/image-upload"
import { ColorPicker } from "@/components/input/color-picker"
import { FileUploader } from "@/components/input/file-uploader"
import { RadioGroup } from "@/components/input/radio-group"
import { SliderDemo } from "@/components/input/slider"
import { Rate } from "@/components/input/rate"
import { Stepper } from "@/components/input/stepper"
import { AppCard } from "@/components/layout/app-card"

interface InputClientViewProps {
  pageDict: {
    textInput: string
    textInputLabel: string
    textInputPlaceholder: string
    Switch: string
    switchControlLabel: string
    searchBar: string
    searchBarPlaceholder: string
    searchWithSuggestions: string
    searchPlaceholder: string
    Checkbox: string
    checkboxLabel: string
    Cascader: string
    cascaderPlaceholder: string
    DateTimePicker: string
    dateTimePickerPlaceholder: string
    ColorPicker: string
    colorPickerLabel: string
    FileUploader: string
    fileUploaderLabel: string
    Radio: string
    radioLabel: string
    Slider: string
    sliderLabel: string
    Rate: string
    rateLabel: string
    Stepper: string
    stepperLabel: string
  }
}

export function InputClientView({ pageDict }: InputClientViewProps) {
  const [isChecked, setIsChecked] = useState(false)
  const [isSwitchOn, setSwitchOn] = useState(true)
  const [radioValue, setRadioValue] = useState("react")
  const [sliderValue, setSliderValue] = useState(50)
  const [rateValue, setRateValue] = useState(3)
  const [stepperValue, setStepperValue] = useState(10)
  const [cityValue, setCityValue] = useState("")
  const [yearMonthValue, setYearMonthValue] = useState("")
  const [dateRangeValue, setDateRangeValue] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null })
  const [tagValue, setTagValue] = useState<string[]>(["React", "TypeScript", "前端开发"])
  const [tagMode, setTagMode] = useState<'view' | 'edit'>('view')
  const [imageValue, setImageValue] = useState<string>("")

  const sampleSuggestions = ["React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt.js", "SolidJS", "Qwik"]
  const radioOptions = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
  ]

  const components = [
    {
      id: "textInput",
      title: pageDict.textInput,
      content: <TextInput label={pageDict.textInputLabel} id="email" placeholder={pageDict.textInputPlaceholder} />,
    },
    {
      id: "switch",
      title: pageDict.Switch,
      content: (
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="notif-switch" className="text-sm font-medium" style={{ color: "var(--card-title-color)" }}>
            {pageDict.switchControlLabel}
          </label>
          <SwitchControl id="notif-switch" checked={isSwitchOn} onCheckedChange={setSwitchOn} />
        </div>
      ),
    },
    {
      id: "searchBar",
      title: pageDict.searchBar,
      content: <SearchBar placeholder={pageDict.searchBarPlaceholder} />,
    },
    {
      id: "searchWithSuggestions",
      title: pageDict.searchWithSuggestions,
      content: <SearchWithSuggestions suggestions={sampleSuggestions} placeholder={pageDict.searchPlaceholder} />,
      cardClassName: "items-start h-64",
    },
    {
      id: "checkbox",
      title: pageDict.Checkbox,
      content: (
        <Checkbox id="terms" label={pageDict.checkboxLabel} checked={isChecked} onCheckedChange={setIsChecked} />
      ),
    },
    {
      id: "radioGroup",
      title: pageDict.Radio,
      content: (
        <RadioGroup
          label={pageDict.radioLabel}
          options={radioOptions}
          value={radioValue}
          onValueChange={setRadioValue}
        />
      ),
    },
    {
      id: "slider",
      title: pageDict.Slider,
      content: (
        <div className="flex flex-col gap-6 w-full max-w-md">
          <SliderDemo
            label="默认滑块"
            defaultValue={[20]}
            max={100}
            step={10}
            color="default"
            className="max-w-md"
          />
          <SliderDemo
            label="成功滑块"
            defaultValue={[40]}
            max={100}
            step={10}
            color="success"
            className="max-w-md"
          />
          <SliderDemo
            label="警告滑块"
            defaultValue={[60]}
            max={100}
            step={10}
            color="warning"
            className="max-w-md"
          />
        </div>
      ),
    },
    {
      id: "rate",
      title: pageDict.Rate,
      content: <Rate label={pageDict.rateLabel} value={rateValue} onValueChange={setRateValue} />,
    },
    {
      id: "stepper",
      title: pageDict.Stepper,
      content: <Stepper label={pageDict.stepperLabel} value={stepperValue} onValueChange={setStepperValue} />,
    },
    {
      id: "cascader",
      title: pageDict.Cascader,
      content: <Cascader placeholder={pageDict.cascaderPlaceholder} />,
    },
    {
      id: "citySelectMobile",
      title: "移动端城市选择",
      content: <CitySelectMobile value={cityValue} onChange={setCityValue} placeholder="请选择省/市" />,
    },
    {
      id: "dateTimePicker",
      title: pageDict.DateTimePicker,
      content: <DateTimePicker placeholder={pageDict.dateTimePickerPlaceholder} />,
    },
    {
      id: "yearMonthPicker",
      title: "年月选择器",
      content: (
        <div className="w-full max-w-sm space-y-2">
          <YearMonthPicker 
            placeholder="请选择年月" 
            value={yearMonthValue}
            onChange={setYearMonthValue}
          />
          {yearMonthValue && (
            <p className="text-xs text-center" style={{ color: "var(--card-text-color)" }}>
              已选择: {yearMonthValue}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "dateRangePicker",
      title: "日期区间选择器",
      content: (
        <div className="w-full max-w-sm space-y-2">
          <DateRangePicker 
            placeholder="请选择日期区间" 
            value={dateRangeValue}
            onChange={setDateRangeValue}
          />
          {(dateRangeValue.start || dateRangeValue.end) && (
            <div className="text-xs text-center space-y-1" style={{ color: "var(--card-text-color)" }}>
              {dateRangeValue.start && (
                <p>开始: {dateRangeValue.start.toLocaleDateString()}</p>
              )}
              {dateRangeValue.end && (
                <p>结束: {dateRangeValue.end.toLocaleDateString()}</p>
              )}
              {dateRangeValue.start && dateRangeValue.end && (
                <p>
                  天数: {Math.ceil((dateRangeValue.end.getTime() - dateRangeValue.start.getTime()) / (1000 * 60 * 60 * 24)) + 1} 天
                </p>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "tagInput",
      title: "标签输入器",
      content: (
        <div className="w-full space-y-3">
          <TagInput 
            value={tagValue}
            onChange={setTagValue}
            mode={tagMode}
            onModeChange={setTagMode}
            placeholder="输入技能标签后按回车"
            maxTags={10}
            emptyText="暂无技能标签"
          />
          <div className="text-xs space-y-1" style={{ color: "var(--card-text-color)" }}>
            <p>当前模式: {tagMode === 'view' ? '查看模式' : '编辑模式'}</p>
            <p>标签数量: {tagValue.length}</p>
          </div>
        </div>
      ),
    },
    {
      id: "imageUpload",
      title: "图片上传器",
      content: (
        <div className="w-full space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs mb-2" style={{ color: "var(--card-text-color)" }}>圆形头像 (裁剪)</p>
              <ImageUpload
                value={imageValue}
                onChange={setImageValue}
                placeholder="上传头像"
                shape="circle"
                size="md"
                maxSize={2}
                enableCrop={true}
                cropAspectRatio={1}
              />
            </div>
            <div className="text-center">
              <p className="text-xs mb-2" style={{ color: "var(--card-text-color)" }}>方形图片 (裁剪)</p>
              <ImageUpload
                value=""
                onChange={() => {}}
                placeholder="上传图片"
                shape="square"
                size="md"
                maxSize={5}
                enableCrop={true}
                cropAspectRatio={1}
              />
            </div>
            <div className="text-center">
              <p className="text-xs mb-2" style={{ color: "var(--card-text-color)" }}>矩形封面 (裁剪)</p>
              <ImageUpload
                value=""
                onChange={() => {}}
                placeholder="上传封面"
                shape="rectangle"
                size="md"
                maxSize={10}
                enableCrop={true}
                cropAspectRatio={4/3}
              />
            </div>
          </div>
          <div className="text-xs space-y-1" style={{ color: "var(--card-text-color)" }}>
            <p>✨ 支持拖拽上传、点击上传、图片裁剪</p>
            <p>🎨 裁剪功能：旋转、缩放、比例调整</p>
            <p>📁 已上传: {imageValue ? '是' : '否'}</p>
          </div>
        </div>
      ),
    },
    {
      id: "colorPicker",
      title: pageDict.ColorPicker,
      content: <ColorPicker label={pageDict.colorPickerLabel} />,
    },
    {
      id: "fileUploader",
      title: pageDict.FileUploader,
      content: <FileUploader label={pageDict.fileUploaderLabel} />,
    },
  ]

  const totalComponents = components.length

  return (
    <div className="space-y-12 pb-32">
      {components.map((item, index) => (
        <section key={item.id} className="relative" style={{ zIndex: totalComponents - index }}>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{item.title}</h3>
          <AppCard className={cn("flex justify-center items-center p-8", item.cardClassName)}>{item.content}</AppCard>
        </section>
      ))}
    </div>
  )
}
