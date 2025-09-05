"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { SearchBar } from "@/components/input/search-bar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AppCard } from "@/components/layout/app-card"
import { FilterTabs, type FilterTabItem } from "@/components/navigation/filter-tabs"
import { Globe, User, CreditCard, Wrench } from "lucide-react"

interface HelpCenterClientViewProps {
  dict: {
    title: string
    searchPlaceholder: string
    categories: string[]
    faq: {
      question: string
      answer: string
      category: string
    }[]
  }
}

export function HelpCenterClientView({ dict }: HelpCenterClientViewProps) {
  const [activeCategory, setActiveCategory] = useState(dict.categories[0])
  const [searchTerm, setSearchTerm] = useState("")

  const categoryItems: FilterTabItem[] = useMemo(() => {
    const iconMap: { [key: string]: React.ReactNode } = {
      General: <Globe className="w-4 h-4 mr-2" />,
      Account: <User className="w-4 h-4 mr-2" />,
      Billing: <CreditCard className="w-4 h-4 mr-2" />,
      Technical: <Wrench className="w-4 h-4 mr-2" />,
      通用: <Globe className="w-4 h-4 mr-2" />,
      账户: <User className="w-4 h-4 mr-2" />,
      账单: <CreditCard className="w-4 h-4 mr-2" />,
      技术: <Wrench className="w-4 h-4 mr-2" />,
    }
    return dict.categories.map((category) => ({
      label: category,
      icon: iconMap[category] || <Globe className="w-4 h-4 mr-2" />,
    }))
  }, [dict.categories])

  const filteredFaq = dict.faq
    .filter((item) => {
      if (activeCategory === dict.categories[0]) {
        return true
      }
      return item.category === activeCategory
    })
    .filter(
      (item) =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  return (
    <main className="p-4 space-y-8">
      {/* Search Section */}
      <div className="flex justify-center">
        <SearchBar
          placeholder={dict.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-lg"
        />
      </div>

      {/* Categories Section */}
      <FilterTabs items={categoryItems} activeItem={activeCategory} onItemChange={setActiveCategory} />

      {/* FAQ Accordion */}
      <AppCard className="p-2">
        <Accordion type="single" collapsible className="w-full">
          {filteredFaq.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b-0 px-3">
              <AccordionTrigger
                className="text-sm font-medium text-left hover:no-underline"
                style={{ color: "var(--card-title-color)" }}
              >
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-xs pb-4" style={{ color: "var(--card-text-color)" }}>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </AppCard>
    </main>
  )
}
