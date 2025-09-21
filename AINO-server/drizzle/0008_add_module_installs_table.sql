-- 添加模块安装记录表
-- 支持模块生命周期管理

CREATE TABLE IF NOT EXISTS module_installs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  module_name TEXT NOT NULL,
  module_version TEXT NOT NULL,
  module_type TEXT NOT NULL, -- 'system', 'local', 'remote'
  install_type TEXT NOT NULL, -- 'system', 'market', 'custom'
  install_config JSONB DEFAULT '{}',
  install_status TEXT DEFAULT 'active', -- 'active', 'disabled', 'uninstalling', 'error'
  install_error TEXT, -- 安装错误信息
  installed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  UNIQUE(application_id, module_key)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_module_installs_app ON module_installs(application_id);
CREATE INDEX IF NOT EXISTS idx_module_installs_status ON module_installs(install_status);
CREATE INDEX IF NOT EXISTS idx_module_installs_type ON module_installs(module_type);
CREATE INDEX IF NOT EXISTS idx_module_installs_created_at ON module_installs(installed_at);

-- 添加注释
COMMENT ON TABLE module_installs IS '模块安装记录表，记录每个应用中安装的模块信息';
COMMENT ON COLUMN module_installs.module_key IS '模块唯一标识符';
COMMENT ON COLUMN module_installs.module_name IS '模块显示名称';
COMMENT ON COLUMN module_installs.module_version IS '模块版本号';
COMMENT ON COLUMN module_installs.module_type IS '模块类型：system(系统模块), local(本地模块), remote(远程模块)';
COMMENT ON COLUMN module_installs.install_type IS '安装类型：system(系统自动), market(市场安装), custom(自定义)';
COMMENT ON COLUMN module_installs.install_config IS '模块安装配置';
COMMENT ON COLUMN module_installs.install_status IS '安装状态：active(活跃), disabled(禁用), uninstalling(卸载中), error(错误)';
COMMENT ON COLUMN module_installs.install_error IS '安装错误信息';
COMMENT ON COLUMN module_installs.created_by IS '安装者用户ID';
