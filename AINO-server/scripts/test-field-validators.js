const { fieldProcessorManager } = require('../src/lib/field-processors.ts')

// 模拟字段定义
const mockFieldDefs = [
  {
    id: '1',
    key: 'name',
    kind: 'primitive',
    type: 'text',
    required: true,
    validators: {
      minLength: 2,
      maxLength: 50,
      pattern: '^[a-zA-Z\\u4e00-\\u9fa5\\s]+$'
    }
  },
  {
    id: '2',
    key: 'age',
    kind: 'primitive',
    type: 'number',
    required: false,
    validators: {
      min: 0,
      max: 150,
      step: 1
    }
  },
  {
    id: '3',
    key: 'description',
    kind: 'primitive',
    type: 'textarea',
    required: false,
    validators: {
      maxLength: 1000
    }
  },
  {
    id: '4',
    key: 'skills',
    kind: 'primitive',
    type: 'multiselect',
    required: false,
    schema: {
      options: ['JavaScript', 'React', 'Node.js', 'Python', 'Java']
    },
    validators: {
      minItems: 1,
      maxItems: 5
    }
  },
  {
    id: '5',
    key: 'avatar',
    kind: 'primitive',
    type: 'image',
    required: false,
    validators: {
      maxSizeMB: 5
    }
  },
  {
    id: '6',
    key: 'document',
    kind: 'primitive',
    type: 'file',
    required: false,
    validators: {
      maxSizeMB: 10,
      accept: 'application/pdf,text/plain'
    }
  }
]

async function testFieldValidators() {
  console.log('🧪 测试字段验证器功能...\n')
  
  // 测试用例1：文本字段验证
  console.log('1. 测试文本字段验证...')
  const textTests = [
    { value: '张三', expected: true, desc: '有效中文名' },
    { value: 'A', expected: false, desc: '长度不足' },
    { value: 'A'.repeat(60), expected: false, desc: '长度超限' },
    { value: 'John123', expected: false, desc: '包含数字' },
    { value: '', expected: false, desc: '必填字段为空' }
  ]
  
  textTests.forEach(test => {
    const result = fieldProcessorManager.validateField(test.value, mockFieldDefs[0])
    const status = result.valid === test.expected ? '✅' : '❌'
    console.log(`   ${status} ${test.desc}: ${test.value} -> ${result.valid ? '通过' : result.error}`)
  })
  
  // 测试用例2：数字字段验证
  console.log('\n2. 测试数字字段验证...')
  const numberTests = [
    { value: 25, expected: true, desc: '有效年龄' },
    { value: -1, expected: false, desc: '小于最小值' },
    { value: 200, expected: false, desc: '大于最大值' },
    { value: 25.5, expected: false, desc: '不是整数' },
    { value: null, expected: true, desc: '非必填字段为空' }
  ]
  
  numberTests.forEach(test => {
    const result = fieldProcessorManager.validateField(test.value, mockFieldDefs[1])
    const status = result.valid === test.expected ? '✅' : '❌'
    console.log(`   ${status} ${test.desc}: ${test.value} -> ${result.valid ? '通过' : result.error}`)
  })
  
  // 测试用例3：文本域字段验证
  console.log('\n3. 测试文本域字段验证...')
  const textareaTests = [
    { value: '这是一个描述', expected: true, desc: '有效描述' },
    { value: 'A'.repeat(1100), expected: false, desc: '长度超限' },
    { value: '', expected: true, desc: '非必填字段为空' }
  ]
  
  textareaTests.forEach(test => {
    const result = fieldProcessorManager.validateField(test.value, mockFieldDefs[2])
    const status = result.valid === test.expected ? '✅' : '❌'
    console.log(`   ${status} ${test.desc}: ${test.value.substring(0, 20)}... -> ${result.valid ? '通过' : result.error}`)
  })
  
  // 测试用例4：多选字段验证
  console.log('\n4. 测试多选字段验证...')
  const multiselectTests = [
    { value: ['JavaScript', 'React'], expected: true, desc: '有效技能组合' },
    { value: [], expected: false, desc: '数量不足' },
    { value: ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++'], expected: false, desc: '数量超限' },
    { value: ['InvalidSkill'], expected: false, desc: '无效选项' },
    { value: null, expected: true, desc: '非必填字段为空' }
  ]
  
  multiselectTests.forEach(test => {
    const result = fieldProcessorManager.validateField(test.value, mockFieldDefs[3])
    const status = result.valid === test.expected ? '✅' : '❌'
    console.log(`   ${status} ${test.desc}: ${JSON.stringify(test.value)} -> ${result.valid ? '通过' : result.error}`)
  })
  
  // 测试用例5：图片字段验证
  console.log('\n5. 测试图片字段验证...')
  const imageTests = [
    { value: 'https://example.com/image.jpg', expected: true, desc: '有效图片URL' },
    { value: { size: 2 * 1024 * 1024 }, expected: true, desc: '有效文件大小' },
    { value: { size: 10 * 1024 * 1024 }, expected: false, desc: '文件过大' },
    { value: 'invalid-url', expected: false, desc: '无效URL' },
    { value: null, expected: true, desc: '非必填字段为空' }
  ]
  
  imageTests.forEach(test => {
    const result = fieldProcessorManager.validateField(test.value, mockFieldDefs[4])
    const status = result.valid === test.expected ? '✅' : '❌'
    console.log(`   ${status} ${test.desc}: ${typeof test.value === 'object' ? JSON.stringify(test.value) : test.value} -> ${result.valid ? '通过' : result.error}`)
  })
  
  // 测试用例6：文件字段验证
  console.log('\n6. 测试文件字段验证...')
  const fileTests = [
    { value: 'https://example.com/document.pdf', expected: true, desc: '有效文件URL' },
    { value: { size: 5 * 1024 * 1024, type: 'application/pdf' }, expected: true, desc: '有效PDF文件' },
    { value: { size: 15 * 1024 * 1024, type: 'application/pdf' }, expected: false, desc: '文件过大' },
    { value: { size: 5 * 1024 * 1024, type: 'image/jpeg' }, expected: false, desc: '不支持的文件类型' },
    { value: 'invalid-url', expected: false, desc: '无效URL' }
  ]
  
  fileTests.forEach(test => {
    const result = fieldProcessorManager.validateField(test.value, mockFieldDefs[5])
    const status = result.valid === test.expected ? '✅' : '❌'
    console.log(`   ${status} ${test.desc}: ${typeof test.value === 'object' ? JSON.stringify(test.value) : test.value} -> ${result.valid ? '通过' : result.error}`)
  })
  
  console.log('\n🎉 字段验证器测试完成！')
}

// 运行测试
testFieldValidators().catch(console.error)
