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
