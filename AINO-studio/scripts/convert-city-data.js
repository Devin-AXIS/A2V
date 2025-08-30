#!/usr/bin/env node

/**
 * 转换城市数据格式
 * 将 china-area-data 包的数据转换为前端需要的格式
 */

const chinaAreaData = require('china-area-data')

// 转换数据格式
function convertCityData() {
  const result = []
  
  // 遍历所有省份
  for (const [provinceCode, provinceData] of Object.entries(chinaAreaData)) {
    // 跳过非省份代码（如86、城市代码等）
    if (provinceCode.length !== 6 || !provinceCode.endsWith('0000')) {
      continue
    }
    
    // 获取省份名称
    const provinceName = getProvinceName(provinceCode)
    if (!provinceName) continue
    
    const province = {
      value: provinceCode,
      label: provinceName,
      children: []
    }
    
    // 遍历该省份下的城市
    for (const [cityCode, cityName] of Object.entries(provinceData)) {
      // 跳过非城市代码
      if (cityCode.length !== 6 || !cityCode.endsWith('00')) {
        continue
      }
      
      const city = {
        value: cityCode,
        label: cityName,
        children: []
      }
      
      // 遍历该城市下的区县
      const districtData = chinaAreaData[cityCode]
      if (districtData) {
        for (const [districtCode, districtName] of Object.entries(districtData)) {
          city.children.push({
            value: districtCode,
            label: districtName
          })
        }
      }
      
      province.children.push(city)
    }
    
    result.push(province)
  }
  
  return result
}

// 获取省份名称
function getProvinceName(code) {
  const provinceNames = {
    '110000': '北京市',
    '120000': '天津市',
    '130000': '河北省',
    '140000': '山西省',
    '150000': '内蒙古自治区',
    '210000': '辽宁省',
    '220000': '吉林省',
    '230000': '黑龙江省',
    '310000': '上海市',
    '320000': '江苏省',
    '330000': '浙江省',
    '340000': '安徽省',
    '350000': '福建省',
    '360000': '江西省',
    '370000': '山东省',
    '410000': '河南省',
    '420000': '湖北省',
    '430000': '湖南省',
    '440000': '广东省',
    '450000': '广西壮族自治区',
    '460000': '海南省',
    '500000': '重庆市',
    '510000': '四川省',
    '520000': '贵州省',
    '530000': '云南省',
    '540000': '西藏自治区',
    '610000': '陕西省',
    '620000': '甘肃省',
    '630000': '青海省',
    '640000': '宁夏回族自治区',
    '650000': '新疆维吾尔自治区',
    '710000': '台湾省',
    '810000': '香港特别行政区',
    '820000': '澳门特别行政区'
  }
  
  return provinceNames[code]
}

// 生成数据
const cityData = convertCityData()

// 输出结果
console.log('// 完整的中国城市数据')
console.log('export type CityNode = {')
console.log('  value: string')
console.log('  label: string')
console.log('  children?: CityNode[]')
console.log('}')
console.log('')
console.log('export const cityData: CityNode[] = [')
// 手动输出数组内容，避免双重方括号
cityData.forEach((item, index) => {
  console.log(JSON.stringify(item, null, 2) + (index < cityData.length - 1 ? ',' : ''))
})
console.log(']')

// 统计信息
console.log('')
console.log('// 统计信息:')
console.log(`// 省份数量: ${cityData.length}`)
console.log(`// 总城市数量: ${cityData.reduce((sum, p) => sum + p.children.length, 0)}`)
console.log(`// 总区县数量: ${cityData.reduce((sum, p) => sum + p.children.reduce((sum2, c) => sum2 + c.children.length, 0), 0)}`)
