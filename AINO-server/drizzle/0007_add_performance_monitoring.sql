-- 添加性能监控和统计优化
-- 基于联表方案设计文档的性能优化建议

-- ==================== 性能监控设置 ====================

-- 1. 检查 pg_stat_statements 扩展是否已安装
-- 如果没有安装，需要先安装：CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 2. 为关联表创建扩展统计信息
-- 为表达式列建立扩展统计（估算基数更准）
CREATE STATISTICS IF NOT EXISTS stat_relations_app_from_dir 
ON (application_id), (from_directory_id) 
FROM relation_records;

CREATE STATISTICS IF NOT EXISTS stat_relations_app_to_dir 
ON (application_id), (to_directory_id) 
FROM relation_records;

CREATE STATISTICS IF NOT EXISTS stat_relations_app_relation_type 
ON (application_id), (relation_type) 
FROM relation_records;

-- 3. 为目录表创建扩展统计（如果存在JSONB字段）
-- 这里假设目录表有JSONB字段，实际使用时需要根据具体表结构调整
-- CREATE STATISTICS IF NOT EXISTS stat_dir_users_status_app 
-- ON (application_id), ((props->>'status')) 
-- FROM dir_users;

-- ==================== 性能监控查询 ====================

-- 4. 创建性能监控视图
CREATE OR REPLACE VIEW v_relation_performance_stats AS
SELECT 
    schemaname,
    relname as tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE relname = 'relation_records';

-- 5. 创建索引使用统计视图
CREATE OR REPLACE VIEW v_relation_index_stats AS
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE relname = 'relation_records'
ORDER BY idx_scan DESC;

-- 6. 创建慢查询监控视图（需要 pg_stat_statements 扩展）
-- 注意：需要先安装扩展：CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
-- 如果扩展未安装，此视图将无法创建
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
        EXECUTE 'CREATE OR REPLACE VIEW v_slow_relation_queries AS
        SELECT 
            query,
            calls,
            total_time,
            mean_time,
            stddev_time,
            rows,
            100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
        FROM pg_stat_statements 
        WHERE query LIKE ''%relation_records%''
        ORDER BY mean_time DESC
        LIMIT 20;';
        RAISE NOTICE 'Slow query monitoring view created successfully';
    ELSE
        RAISE NOTICE 'pg_stat_statements extension not installed. Slow query monitoring view not created.';
        RAISE NOTICE 'To enable slow query monitoring, run: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;';
    END IF;
END $$;

-- ==================== 维护脚本 ====================

-- 7. 创建定期维护函数
CREATE OR REPLACE FUNCTION maintain_relation_performance()
RETURNS void AS $$
BEGIN
    -- 更新统计信息
    ANALYZE relation_records;
    
    -- 如果表很大，可以考虑定期VACUUM
    -- VACUUM ANALYZE relation_records;
    
    -- 记录维护时间
    RAISE NOTICE 'Relation records performance maintenance completed at %', now();
END;
$$ LANGUAGE plpgsql;

-- 8. 创建性能检查函数
CREATE OR REPLACE FUNCTION check_relation_performance()
RETURNS TABLE(
    metric text,
    value numeric,
    recommendation text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'relation_records_size'::text,
        pg_total_relation_size('relation_records')::numeric,
        CASE 
            WHEN pg_total_relation_size('relation_records') > 1000000000 THEN 'Consider partitioning for large tables'
            ELSE 'Size is acceptable'
        END::text
    UNION ALL
    SELECT 
        'dead_tuples_ratio'::text,
        (SELECT n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100 
         FROM pg_stat_user_tables 
         WHERE relname = 'relation_records'),
        CASE 
            WHEN (SELECT n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100 
                  FROM pg_stat_user_tables 
                  WHERE relname = 'relation_records') > 20 THEN 'Consider VACUUM'
            ELSE 'Dead tuple ratio is acceptable'
        END::text
    UNION ALL
    SELECT 
        'index_usage_ratio'::text,
        (SELECT idx_scan::numeric / NULLIF(seq_scan + idx_scan, 0) * 100 
         FROM pg_stat_user_tables 
         WHERE relname = 'relation_records'),
        CASE 
            WHEN (SELECT idx_scan::numeric / NULLIF(seq_scan + idx_scan, 0) * 100 
                  FROM pg_stat_user_tables 
                  WHERE relname = 'relation_records') < 80 THEN 'Consider optimizing queries or adding indexes'
            ELSE 'Index usage is good'
        END::text;
END;
$$ LANGUAGE plpgsql;

-- ==================== 使用示例 ====================

-- 使用示例：
-- SELECT * FROM v_relation_performance_stats;
-- SELECT * FROM v_relation_index_stats;
-- SELECT * FROM v_slow_relation_queries;
-- SELECT * FROM check_relation_performance();
-- SELECT maintain_relation_performance();

-- ==================== 定期维护建议 ====================

-- 建议的定期维护任务：
-- 1. 每日运行：SELECT maintain_relation_performance();
-- 2. 每周检查：SELECT * FROM check_relation_performance();
-- 3. 每月检查：SELECT * FROM v_slow_relation_queries;
-- 4. 根据查询模式调整索引：SELECT * FROM v_relation_index_stats;
