-- 修复 directory_defs 表的外键约束，确保级联删除正常工作
-- 问题：directory_defs_directory_id_fkey 约束没有设置 ON DELETE CASCADE

-- 删除没有级联删除的外键约束
ALTER TABLE "directory_defs" DROP CONSTRAINT IF EXISTS "directory_defs_directory_id_fkey";

-- 重新创建带有级联删除的外键约束
ALTER TABLE "directory_defs" ADD CONSTRAINT "directory_defs_directory_id_fkey" 
FOREIGN KEY ("directory_id") REFERENCES "directories"("id") ON DELETE CASCADE;

-- 同样修复 field_defs 表的外键约束（如果存在类似问题）
ALTER TABLE "field_defs" DROP CONSTRAINT IF EXISTS "field_defs_directory_id_fkey";

-- 重新创建带有级联删除的外键约束
ALTER TABLE "field_defs" ADD CONSTRAINT "field_defs_directory_id_fkey" 
FOREIGN KEY ("directory_id") REFERENCES "directory_defs"("id") ON DELETE CASCADE;
