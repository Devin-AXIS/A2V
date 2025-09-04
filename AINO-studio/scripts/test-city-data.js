#!/usr/bin/env node

/**
 * 测试城市数据
 * 验证城市数据是否正确加载和转换
 */

// 直接测试china-area-data包
const chinaAreaData = require('china-area-data')

console.log('🧪 测试城市数据...\n')

try {
  // 1. 检查数据结构
  console.log('1️⃣ 检查数据结构...')
  console.log('数据类型:', typeof chinaAreaData)
  console.log('数据键数量:', Object.keys(chinaAreaData).length)
  console.log('')

  // 2. 检查北京数据
  console.log('2️⃣ 检查北京数据...')
  const beijingData = chinaAreaData['110000']
  if (beijingData) {
    console.log('北京数据:', beijingData)
    console.log('北京城市数量:', Object.keys(beijingData).length)
    console.log('')

    // 3. 检查北京城市数据
    console.log('3️⃣ 检查北京城市数据...')
    const beijingCityData = chinaAreaData['110100']
    if (beijingCityData) {
      console.log('北京城市数据:', beijingCityData)
      console.log('北京区县数量:', Object.keys(beijingCityData).length)
      console.log('')

      // 4. 检查具体区县
      console.log('4️⃣ 检查具体区县...')
      const districts = Object.entries(beijingCityData)
      console.log('前5个区县:', districts.slice(0, 5))
      console.log('')
    }
  }

  // 5. 检查广东省数据
  console.log('5️⃣ 检查广东省数据...')
  const guangdongData = chinaAreaData['440000']
  if (guangdongData) {
    console.log('广东数据:', guangdongData)
    console.log('广东城市数量:', Object.keys(guangdongData).length)
    console.log('')

    // 6. 检查深圳数据
    console.log('6️⃣ 检查深圳数据...')
    const shenzhenData = chinaAreaData['440300']
    if (shenzhenData) {
      console.log('深圳数据:', shenzhenData)
      console.log('深圳区县数量:', Object.keys(shenzhenData).length)
      console.log('')
    }
  }

  // 7. 统计信息
  console.log('7️⃣ 统计信息...')
  const allKeys = Object.keys(chinaAreaData)
  const provinces = allKeys.filter(key => key.endsWith('0000') && key.length === 6)
  const cities = allKeys.filter(key => key.endsWith('00') && !key.endsWith('0000') && key.length === 6)
  const districts = allKeys.filter(key => !key.endsWith('00') && key.length === 6)
  
  console.log('总省份数量:', provinces.length)
  console.log('总城市数量:', cities.length)
  console.log('总区县数量:', districts.length)
  console.log('')

  // 8. 检查数据完整性
  console.log('8️⃣ 检查数据完整性...')
  const testProvinces = ['110000', '310000', '440000', '500000']
  testProvinces.forEach(code => {
    const data = chinaAreaData[code]
    if (data) {
      console.log(`✅ ${code}: 找到数据`)
    } else {
      console.log(`❌ ${code}: 未找到数据`)
    }
  })

  console.log('🎉 城市数据测试完成！')

} catch (error) {
  console.error('❌ 测试失败:', error.message)
  console.error('错误详情:', error)
}
