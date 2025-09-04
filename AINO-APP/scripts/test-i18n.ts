import { runAllTests } from "../lib/__tests__/i18n.test"

async function main() {
  console.log("=".repeat(50))
  console.log("🧪 i18n Structure Test Suite")
  console.log("=".repeat(50))

  try {
    const success = await runAllTests()

    if (success) {
      console.log("\n✨ 国际化重构成功完成！")
      console.log("📋 新结构特性：")
      console.log("  • 按端分离：PC、App、Card 各自维护")
      console.log("  • 按需加载：减少初始包体积")
      console.log("  • 公共词条：core/i18n 统一管理")
      console.log("  • 向后兼容：现有代码无需修改")
      process.exit(0)
    } else {
      console.log("\n❌ 测试失败，请检查实现")
      process.exit(1)
    }
  } catch (error) {
    console.error("测试执行出错:", error)
    process.exit(1)
  }
}

main()
