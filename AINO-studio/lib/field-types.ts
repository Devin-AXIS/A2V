import type { FieldType } from "@/lib/store"

// 字段类型名称映射
export function getFieldTypeNames(t: (key: string) => string): Record<FieldType, string> {
  return {
    text: t("ft_text"),
    textarea: t("ft_textarea"),
    number: t("ft_number"),
    select: t("ft_select"),
    multiselect: t("ft_multiselect"),
    boolean: t("ft_boolean"),
    date: t("ft_date"),
    datetime: t("ft_datetime"),
    daterange: t("ft_daterange"),
    multidate: t("ft_multidate"),
    time: t("ft_time"),
    tags: t("ft_tags"),
    image: t("ft_image"),
    profile: t("ft_profile"),
    multiimage: t("ft_multiimage"),
    video: t("ft_video"),
    multivideo: t("ft_multivideo"),
    file: t("ft_file"),
    richtext: t("ft_richtext"),
    percent: t("ft_percent"),
    progress: t("ft_progress"),
    barcode: t("ft_barcode"),
    checkbox: t("ft_checkbox"),
    cascader: t("ft_cascader"),
    relation_one: t("ft_relation_one"),
    relation_many: t("ft_relation_many"),
    experience: t("ft_experience"),
    identity_verification: t("ft_identity_verification"),
    other_verification: t("ft_other_verification"),
  }
}

// 字段类型分组
export const FIELD_TYPE_GROUPS = {
  basic: ['text', 'textarea', 'number', 'boolean', 'date', 'datetime', 'daterange', 'multidate', 'time'] as FieldType[],
  selection: ['select', 'multiselect', 'checkbox', 'cascader'] as FieldType[],
  media: ['image', 'multiimage', 'video', 'multivideo', 'file'] as FieldType[],
  business: ['profile'] as FieldType[],
  advanced: ['richtext', 'tags', 'percent', 'progress', 'barcode'] as FieldType[],
  relation: ['relation_one', 'relation_many', 'experience'] as FieldType[],
  verification: ['identity_verification', 'other_verification'] as FieldType[],
}

// 字段类型默认配置
export const FIELD_TYPE_DEFAULTS: Partial<Record<FieldType, any>> = {
  text: { maxLength: 255 },
  textarea: { maxLength: 1000 },
  number: { min: 0, max: 999999 },
  select: { options: [] },
  multiselect: { options: [] },
  boolean: { defaultValue: false },
  date: { format: 'YYYY-MM-DD' },
  datetime: { format: 'YYYY-MM-DD HH:mm' },
  daterange: { format: 'YYYY-MM-DD' },
  multidate: { format: 'YYYY-MM-DD' },
  time: { format: 'HH:mm' },
  tags: { maxTags: 10 },
  image: { maxSizeMB: 5 },
  profile: { maxSizeMB: 5 },
  multiimage: { maxSizeMB: 5, multiple: true },
  percent: { min: 0, max: 100, precision: 2 },
  progress: { 
    maxValue: 100, 
    showPercentage: true, 
    showProgressBar: true 
  },
  video: { maxSizeMB: 50 },
  multivideo: { maxSizeMB: 50, multiple: true },
  identity_verification: {
    requireName: true,
    requireIdNumber: true,
    requireFrontPhoto: true,
    requireBackPhoto: true,
  },
  other_verification: {
    textFields: [],
    imageFields: [],
  },
}
