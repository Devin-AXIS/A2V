-- 添加关联表性能优化索引
-- 基于联表方案设计文档的性能优化建议

-- 1. 出边查询索引（从某记录找关联）
CREATE INDEX IF NOT EXISTS idx_rel_out
ON relation_records (
  application_id, from_directory_id, from_record_id, relation_type, to_directory_id
);

-- 2. 入边查询索引（反向引用）
CREATE INDEX IF NOT EXISTS idx_rel_in
ON relation_records (
  application_id, to_directory_id, to_record_id, relation_type, from_directory_id
);

-- 3. 字段级查询索引（同一字段的去重/快速存在性）
CREATE INDEX IF NOT EXISTS idx_rel_from_field
ON relation_records (application_id, from_directory_id, from_field_key, from_record_id);

CREATE INDEX IF NOT EXISTS idx_rel_to_field
ON relation_records (application_id, to_directory_id, to_field_key, to_record_id);

-- 4. 幂等写入索引（防重复，支持 ON CONFLICT DO NOTHING）
CREATE INDEX IF NOT EXISTS idx_rel_idempotent
ON relation_records (
  application_id, from_directory_id, from_record_id,
  to_directory_id, to_record_id, relation_type
);

-- 5. 可选：添加唯一约束支持幂等写入
-- 注意：这个约束与现有的 uniqueRelation 约束有重叠，需要先删除现有的
-- ALTER TABLE relation_records DROP CONSTRAINT IF EXISTS relation_records_unique;
-- ALTER TABLE relation_records
-- ADD CONSTRAINT uq_rel_edge UNIQUE
-- (application_id, from_directory_id, from_record_id, to_directory_id, to_record_id, relation_type) 
-- DEFERRABLE;
