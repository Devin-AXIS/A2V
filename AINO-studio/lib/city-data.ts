export type CityNode = {
  value: string
  label: string
  children?: CityNode[]
}

export const cityData: CityNode[] = [
  {
    value: "110000",
    label: "北京市",
    children: [
      {
        value: "110100",
        label: "北京市",
        children: [
          { value: "110101", label: "东城区" },
          { value: "110102", label: "西城区" },
          { value: "110105", label: "朝阳区" },
          { value: "110106", label: "丰台区" },
        ],
      },
    ],
  },
  {
    value: "310000",
    label: "上海市",
    children: [
      {
        value: "310100",
        label: "上海市",
        children: [
          { value: "310101", label: "黄浦区" },
          { value: "310104", label: "徐汇区" },
          { value: "310106", label: "静安区" },
          { value: "310115", label: "浦东新区" },
        ],
      },
    ],
  },
  {
    value: "440000",
    label: "广东省",
    children: [
      {
        value: "440100",
        label: "广州市",
        children: [
          { value: "440103", label: "荔湾区" },
          { value: "440104", label: "越秀区" },
          { value: "440105", label: "海珠区" },
          { value: "440106", label: "天河区" },
        ],
      },
      {
        value: "440300",
        label: "深圳市",
        children: [
          { value: "440303", label: "罗湖区" },
          { value: "440304", label: "福田区" },
          { value: "440305", label: "南山区" },
          { value: "440306", label: "宝安区" },
        ],
      },
    ],
  },
]
