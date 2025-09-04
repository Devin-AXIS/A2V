-- 添加关联表的只读视图和函数
-- 基于联表方案设计文档的性能优化建议

-- ==================== 只读视图 ====================

-- 1. 通用关联视图（按应用和目录过滤）
CREATE OR REPLACE VIEW v_relations_by_app AS
SELECT 
    rr.*,
    dd_from.title AS from_directory_title,
    dd_from.slug AS from_directory_slug,
    dd_to.title AS to_directory_title,
    dd_to.slug AS to_directory_slug
FROM relation_records rr
LEFT JOIN directory_defs dd_from ON rr.from_directory_id = dd_from.id
LEFT JOIN directory_defs dd_to ON rr.to_directory_id = dd_to.id;

-- 2. 按目录分组的关联视图
CREATE OR REPLACE VIEW v_relations_by_directory AS
SELECT 
    rr.application_id,
    rr.from_directory_id,
    dd_from.title AS from_directory_title,
    dd_from.slug AS from_directory_slug,
    rr.to_directory_id,
    dd_to.title AS to_directory_title,
    dd_to.slug AS to_directory_slug,
    rr.relation_type,
    COUNT(*) as relation_count
FROM relation_records rr
LEFT JOIN directory_defs dd_from ON rr.from_directory_id = dd_from.id
LEFT JOIN directory_defs dd_to ON rr.to_directory_id = dd_to.id
GROUP BY 
    rr.application_id,
    rr.from_directory_id,
    dd_from.title,
    dd_from.slug,
    rr.to_directory_id,
    dd_to.title,
    dd_to.slug,
    rr.relation_type
ORDER BY relation_count DESC;

-- ==================== 通用函数 ====================

-- 1. 获取一个记录的 N 跳邻居（轻量版）
CREATE OR REPLACE FUNCTION get_neighbors(
    p_application_id uuid, 
    p_from_dir uuid, 
    p_from_id uuid, 
    p_to_dir uuid DEFAULT NULL, 
    p_limit int DEFAULT 100
) RETURNS TABLE(
    to_id uuid, 
    relation_type text, 
    created_at timestamp with time zone,
    to_directory_id uuid
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rr.to_record_id,
        rr.relation_type,
        rr.created_at,
        rr.to_directory_id
    FROM relation_records rr
    WHERE rr.application_id = p_application_id
      AND rr.from_directory_id = p_from_dir
      AND rr.from_record_id = p_from_id
      AND (p_to_dir IS NULL OR rr.to_directory_id = p_to_dir)
    ORDER BY rr.created_at DESC
    LIMIT COALESCE(p_limit, 100);
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. 获取反向邻居（入边查询）
CREATE OR REPLACE FUNCTION get_reverse_neighbors(
    p_application_id uuid, 
    p_to_dir uuid, 
    p_to_id uuid, 
    p_from_dir uuid DEFAULT NULL, 
    p_limit int DEFAULT 100
) RETURNS TABLE(
    from_id uuid, 
    relation_type text, 
    created_at timestamp with time zone,
    from_directory_id uuid
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rr.from_record_id,
        rr.relation_type,
        rr.created_at,
        rr.from_directory_id
    FROM relation_records rr
    WHERE rr.application_id = p_application_id
      AND rr.to_directory_id = p_to_dir
      AND rr.to_record_id = p_to_id
      AND (p_from_dir IS NULL OR rr.from_directory_id = p_from_dir)
    ORDER BY rr.created_at DESC
    LIMIT COALESCE(p_limit, 100);
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. 获取关联计数统计
CREATE OR REPLACE FUNCTION get_relation_counts(
    p_application_id uuid, 
    p_from_dir uuid, 
    p_from_id uuid
) RETURNS TABLE(
    to_directory_id uuid,
    relation_type text,
    count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rr.to_directory_id,
        rr.relation_type,
        COUNT(*) as count
    FROM relation_records rr
    WHERE rr.application_id = p_application_id
      AND rr.from_directory_id = p_from_dir
      AND rr.from_record_id = p_from_id
    GROUP BY rr.to_directory_id, rr.relation_type
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. 检查关联是否存在
CREATE OR REPLACE FUNCTION relation_exists(
    p_application_id uuid,
    p_from_dir uuid,
    p_from_id uuid,
    p_from_field text,
    p_to_dir uuid,
    p_to_id uuid,
    p_relation_type text DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
    result_count int;
BEGIN
    SELECT COUNT(*) INTO result_count
    FROM relation_records rr
    WHERE rr.application_id = p_application_id
      AND rr.from_directory_id = p_from_dir
      AND rr.from_record_id = p_from_id
      AND rr.from_field_key = p_from_field
      AND rr.to_directory_id = p_to_dir
      AND rr.to_record_id = p_to_id
      AND (p_relation_type IS NULL OR rr.relation_type = p_relation_type);
    
    RETURN result_count > 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. 获取双向关联的完整信息
CREATE OR REPLACE FUNCTION get_bidirectional_relations(
    p_application_id uuid,
    p_directory_id uuid,
    p_record_id uuid,
    p_field_key text
) RETURNS TABLE(
    id uuid,
    from_directory_id uuid,
    from_record_id uuid,
    from_field_key text,
    to_directory_id uuid,
    to_record_id uuid,
    to_field_key text,
    relation_type text,
    bidirectional boolean,
    created_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rr.id,
        rr.from_directory_id,
        rr.from_record_id,
        rr.from_field_key,
        rr.to_directory_id,
        rr.to_record_id,
        rr.to_field_key,
        rr.relation_type,
        rr.bidirectional,
        rr.created_at
    FROM relation_records rr
    WHERE rr.application_id = p_application_id
      AND (
          (rr.from_directory_id = p_directory_id AND rr.from_record_id = p_record_id AND rr.from_field_key = p_field_key)
          OR
          (rr.to_directory_id = p_directory_id AND rr.to_record_id = p_record_id AND rr.to_field_key = p_field_key)
      )
    ORDER BY rr.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================== 索引优化建议 ====================

-- 为视图查询创建额外的索引（如果需要）
-- CREATE INDEX IF NOT EXISTS idx_relations_app_from_dir ON relation_records (application_id, from_directory_id);
-- CREATE INDEX IF NOT EXISTS idx_relations_app_to_dir ON relation_records (application_id, to_directory_id);

-- ==================== 使用示例 ====================

-- 使用示例：
-- SELECT * FROM get_neighbors('app-uuid', 'directory-uuid', 'record-uuid', 'target-directory-uuid', 10);
-- SELECT * FROM get_reverse_neighbors('app-uuid', 'directory-uuid', 'record-uuid', 'source-directory-uuid', 10);
-- SELECT * FROM get_relation_counts('app-uuid', 'directory-uuid', 'record-uuid');
-- SELECT relation_exists('app-uuid', 'from-directory-uuid', 'from-record-uuid', 'field-key', 'to-directory-uuid', 'to-record-uuid', 'one_to_many');
-- SELECT * FROM get_bidirectional_relations('app-uuid', 'directory-uuid', 'record-uuid', 'field-key');
-- SELECT * FROM v_relations_by_app WHERE application_id = 'app-uuid';
-- SELECT * FROM v_relations_by_directory WHERE application_id = 'app-uuid';
