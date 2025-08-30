import { uid, type ModuleModel, type FieldModel } from "../store"

function f(
  key: string,
  label: string,
  type: any,
  required = false,
  locked = false,
  extra: Partial<FieldModel> = {},
): FieldModel {
  return {
    id: uid(),
    key,
    label,
    type,
    required,
    locked,
    enabled: true,
    showInList: true,
    showInForm: true,
    showInDetail: true,
    ...extra,
  }
}

function sampleCategories() {
  return [
    {
      id: uid(),
      name: "潮玩",
      children: [
        { id: uid(), name: "盲盒", children: [{ id: uid(), name: "限定款", children: [] }] },
        { id: uid(), name: "模型", children: [] },
      ],
    },
    {
      id: uid(),
      name: "数码",
      children: [
        { id: uid(), name: "音频", children: [] },
        { id: uid(), name: "配件", children: [] },
      ],
    },
  ]
}

export function createEcomModule(): ModuleModel {
  return {
    id: uid(),
    name: "电商模块",
    type: "ecom",
    directories: [
      // 商品管理
      {
        id: uid(),
        name: "商品管理",
        type: "table",
        supportsCategory: true,
        fields: [
          f("cover", "封面", "image", false, true, { accept: "image/*", maxSizeMB: 5 }),
          f("name", "商品名", "text", true, true, { placeholder: "如：某某盲盒", unique: true }),
          f("category", "分类", "select", false, true, { options: ["潮玩", "数码", "家居"] }),
          f("brand", "品牌", "relation_one", false, true, { relation: { targetDirId: null, mode: "one" } }),
          f("status", "上架状态", "select", true, true, { options: ["上架", "下架"], default: "上架" }),
          f("priceMin", "价格下限", "number", false, true, { min: 0, step: 0.01, unit: "¥" }),
          f("priceMax", "价格上限", "number", false, true, { min: 0, step: 0.01, unit: "¥" }),
          f("stock", "库存总量", "number", false, true, { min: 0, step: 1 }),
          f("tags", "标签", "tags", false, true),
        ],
        records: [
          {
            id: uid(),
            name: "拉布布",
            category: "潮玩",
            brand: "",
            status: "上架",
            priceMin: 33,
            priceMax: 334,
            stock: 333,
            tags: ["限量", "人气"],
          },
          {
            id: uid(),
            name: "潮玩盲盒",
            category: "潮玩",
            brand: "",
            status: "下架",
            priceMin: 29,
            priceMax: 99,
            stock: 120,
            tags: ["新品"],
          },
          {
            id: uid(),
            name: "数码耳机",
            category: "数码",
            brand: "",
            status: "上架",
            priceMin: 199,
            priceMax: 399,
            stock: 52,
            tags: ["热销"],
          },
        ],
        categories: sampleCategories(),
      },
      // 订单管理
      {
        id: uid(),
        name: "订单管理",
        type: "table",
        supportsCategory: false,
        fields: [
          f("orderNo", "订单号", "text", true, true, { unique: true }),
          f("buyer", "买家", "relation_one", true, true, { relation: { targetDirId: null, mode: "one" } }),
          f("amount", "金额", "number", true, true, { min: 0, step: 0.01, unit: "¥" }),
          f("status", "状态", "select", true, true, {
            options: ["待支付", "已支付", "已发货", "已完成", "已关闭"],
            default: "待支付",
          }),
          f("createdAt", "下单时间", "date", true, true, { default: "" }),
        ],
        records: [
          { id: uid(), orderNo: "SO20250001", buyer: "", amount: 233.5, status: "已支付", createdAt: "2025-08-01" },
          { id: uid(), orderNo: "SO20250002", buyer: "", amount: 99, status: "待支付", createdAt: "2025-08-02" },
        ],
        categories: [],
      },
      // 品牌字典
      {
        id: uid(),
        name: "品牌字典",
        type: "table",
        supportsCategory: false,
        fields: [
          f("name", "品牌名", "text", true, true, { unique: true }),
          f("country", "国家/地区", "text", false, true),
          f("desc", "简介", "textarea", false, true),
        ],
        records: [],
        categories: [],
      },
    ],
  }
}
