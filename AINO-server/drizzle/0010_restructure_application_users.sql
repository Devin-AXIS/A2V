-- 重构 application_users 表，分离账号系统和业务数据
-- 只保留账号认证相关字段，业务数据存储在用户模块中

-- 1. 删除不需要的字段
ALTER TABLE application_users DROP COLUMN IF EXISTS name;
ALTER TABLE application_users DROP COLUMN IF EXISTS email;
ALTER TABLE application_users DROP COLUMN IF EXISTS avatar;
ALTER TABLE application_users DROP COLUMN IF EXISTS department;
ALTER TABLE application_users DROP COLUMN IF EXISTS position;
ALTER TABLE application_users DROP COLUMN IF EXISTS tags;

-- 2. 添加 password 字段（如果不存在）
ALTER TABLE application_users ADD COLUMN IF NOT EXISTS password TEXT;

-- 3. 修改 phone 字段为 NOT NULL（如果还不是）
ALTER TABLE application_users ALTER COLUMN phone SET NOT NULL;

-- 4. 添加新的索引
CREATE INDEX IF NOT EXISTS application_users_app_phone_idx ON application_users(application_id, phone);
CREATE INDEX IF NOT EXISTS application_users_phone_idx ON application_users(phone);

-- 5. 添加注释说明新的架构
COMMENT ON TABLE application_users IS '应用用户账号表 - 只存储账号认证相关字段，业务数据存储在用户模块中';
COMMENT ON COLUMN application_users.phone IS '手机号作为唯一标识，用于关联用户模块中的业务数据';
COMMENT ON COLUMN application_users.password IS '用户密码（加密存储）';
COMMENT ON COLUMN application_users.metadata IS '扩展字段（如注册来源、设备信息等）';
