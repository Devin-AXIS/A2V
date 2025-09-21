-- 移除 directories 表的 module_id 外键约束
-- 支持引用 modules 和 moduleInstalls 两个表的模块
-- 执行日期: 2025-01-13

-- 删除现有的外键约束
ALTER TABLE directories DROP CONSTRAINT IF EXISTS directories_module_id_fkey;
ALTER TABLE directories DROP CONSTRAINT IF EXISTS directories_module_id_modules_id_fk;

-- 添加注释说明
COMMENT ON COLUMN directories.module_id IS '模块ID，可以引用 modules 表或 module_installs 表的模块';

-- 验证约束已被移除
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'directories'::regclass 
AND conname LIKE '%module%';
