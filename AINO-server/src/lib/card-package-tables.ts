import { db } from '../db'
import { sql } from 'drizzle-orm'

// 卡片包数据表定义
export interface CardPackageTableDefinition {
    tableName: string
    fields: Array<{
        name: string
        type: string
        nullable?: boolean
        defaultValue?: string
        comment?: string
    }>
    indexes?: Array<{
        name: string
        columns: string[]
        unique?: boolean
    }>
}

// 招聘卡片包数据表定义
export const RECRUITMENT_CARD_TABLES: CardPackageTableDefinition[] = [
    {
        tableName: 'job_positions',
        fields: [
            { name: 'id', type: 'uuid', comment: '职位ID' },
            { name: 'title', type: 'varchar(255)', comment: '职位标题' },
            { name: 'company', type: 'varchar(255)', comment: '公司名称' },
            { name: 'location', type: 'varchar(255)', comment: '工作地点' },
            { name: 'salary_min', type: 'integer', nullable: true, comment: '最低薪资' },
            { name: 'salary_max', type: 'integer', nullable: true, comment: '最高薪资' },
            { name: 'experience_required', type: 'varchar(100)', nullable: true, comment: '经验要求' },
            { name: 'education_required', type: 'varchar(100)', nullable: true, comment: '学历要求' },
            { name: 'job_description', type: 'text', nullable: true, comment: '职位描述' },
            { name: 'requirements', type: 'text', nullable: true, comment: '任职要求' },
            { name: 'benefits', type: 'text', nullable: true, comment: '福利待遇' },
            { name: 'status', type: 'varchar(50)', defaultValue: "'active'", comment: '状态' },
            { name: 'created_at', type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP', comment: '创建时间' },
            { name: 'updated_at', type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP', comment: '更新时间' },
        ],
        indexes: [
            { name: 'idx_job_positions_company', columns: ['company'] },
            { name: 'idx_job_positions_location', columns: ['location'] },
            { name: 'idx_job_positions_status', columns: ['status'] },
            { name: 'idx_job_positions_created_at', columns: ['created_at'] },
        ]
    },
    {
        tableName: 'job_applications',
        fields: [
            { name: 'id', type: 'uuid', comment: '申请ID' },
            { name: 'job_position_id', type: 'uuid', comment: '职位ID' },
            { name: 'applicant_name', type: 'varchar(255)', comment: '申请人姓名' },
            { name: 'applicant_email', type: 'varchar(255)', comment: '申请人邮箱' },
            { name: 'applicant_phone', type: 'varchar(50)', nullable: true, comment: '申请人电话' },
            { name: 'resume_url', type: 'varchar(500)', nullable: true, comment: '简历链接' },
            { name: 'cover_letter', type: 'text', nullable: true, comment: '求职信' },
            { name: 'status', type: 'varchar(50)', defaultValue: "'pending'", comment: '申请状态' },
            { name: 'applied_at', type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP', comment: '申请时间' },
            { name: 'reviewed_at', type: 'timestamp', nullable: true, comment: '审核时间' },
        ],
        indexes: [
            { name: 'idx_job_applications_job_id', columns: ['job_position_id'] },
            { name: 'idx_job_applications_email', columns: ['applicant_email'] },
            { name: 'idx_job_applications_status', columns: ['status'] },
            { name: 'idx_job_applications_applied_at', columns: ['applied_at'] },
        ]
    },
    {
        tableName: 'job_skills',
        fields: [
            { name: 'id', type: 'uuid', comment: '技能ID' },
            { name: 'name', type: 'varchar(255)', comment: '技能名称' },
            { name: 'category', type: 'varchar(100)', nullable: true, comment: '技能分类' },
            { name: 'description', type: 'text', nullable: true, comment: '技能描述' },
            { name: 'created_at', type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP', comment: '创建时间' },
        ],
        indexes: [
            { name: 'idx_job_skills_name', columns: ['name'], unique: true },
            { name: 'idx_job_skills_category', columns: ['category'] },
        ]
    },
    {
        tableName: 'job_position_skills',
        fields: [
            { name: 'id', type: 'uuid', comment: '关联ID' },
            { name: 'job_position_id', type: 'uuid', comment: '职位ID' },
            { name: 'skill_id', type: 'uuid', comment: '技能ID' },
            { name: 'required_level', type: 'varchar(50)', nullable: true, comment: '要求等级' },
            { name: 'is_required', type: 'boolean', defaultValue: 'false', comment: '是否必需' },
        ],
        indexes: [
            { name: 'idx_job_position_skills_job_id', columns: ['job_position_id'] },
            { name: 'idx_job_position_skills_skill_id', columns: ['skill_id'] },
            { name: 'idx_job_position_skills_unique', columns: ['job_position_id', 'skill_id'], unique: true },
        ]
    }
]

// 教育卡片包数据表定义
export const EDUCATION_CARD_TABLES: CardPackageTableDefinition[] = [
    {
        tableName: 'courses',
        fields: [
            { name: 'id', type: 'uuid', comment: '课程ID' },
            { name: 'title', type: 'varchar(255)', comment: '课程标题' },
            { name: 'description', type: 'text', nullable: true, comment: '课程描述' },
            { name: 'instructor', type: 'varchar(255)', nullable: true, comment: '讲师' },
            { name: 'duration_hours', type: 'integer', nullable: true, comment: '课程时长（小时）' },
            { name: 'level', type: 'varchar(50)', nullable: true, comment: '课程级别' },
            { name: 'category', type: 'varchar(100)', nullable: true, comment: '课程分类' },
            { name: 'price', type: 'decimal(10,2)', nullable: true, comment: '课程价格' },
            { name: 'max_students', type: 'integer', nullable: true, comment: '最大学生数' },
            { name: 'status', type: 'varchar(50)', defaultValue: "'active'", comment: '状态' },
            { name: 'start_date', type: 'date', nullable: true, comment: '开始日期' },
            { name: 'end_date', type: 'date', nullable: true, comment: '结束日期' },
            { name: 'created_at', type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP', comment: '创建时间' },
            { name: 'updated_at', type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP', comment: '更新时间' },
        ],
        indexes: [
            { name: 'idx_courses_instructor', columns: ['instructor'] },
            { name: 'idx_courses_category', columns: ['category'] },
            { name: 'idx_courses_level', columns: ['level'] },
            { name: 'idx_courses_status', columns: ['status'] },
            { name: 'idx_courses_start_date', columns: ['start_date'] },
        ]
    },
    {
        tableName: 'students',
        fields: [
            { name: 'id', type: 'uuid', comment: '学生ID' },
            { name: 'name', type: 'varchar(255)', comment: '学生姓名' },
            { name: 'email', type: 'varchar(255)', comment: '邮箱' },
            { name: 'phone', type: 'varchar(50)', nullable: true, comment: '电话' },
            { name: 'age', type: 'integer', nullable: true, comment: '年龄' },
            { name: 'education_level', type: 'varchar(100)', nullable: true, comment: '教育水平' },
            { name: 'enrollment_date', type: 'date', nullable: true, comment: '入学日期' },
            { name: 'status', type: 'varchar(50)', defaultValue: "'active'", comment: '状态' },
            { name: 'created_at', type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP', comment: '创建时间' },
            { name: 'updated_at', type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP', comment: '更新时间' },
        ],
        indexes: [
            { name: 'idx_students_email', columns: ['email'], unique: true },
            { name: 'idx_students_status', columns: ['status'] },
            { name: 'idx_students_enrollment_date', columns: ['enrollment_date'] },
        ]
    },
    {
        tableName: 'enrollments',
        fields: [
            { name: 'id', type: 'uuid', comment: '注册ID' },
            { name: 'student_id', type: 'uuid', comment: '学生ID' },
            { name: 'course_id', type: 'uuid', comment: '课程ID' },
            { name: 'enrollment_date', type: 'date', defaultValue: 'CURRENT_DATE', comment: '注册日期' },
            { name: 'completion_date', type: 'date', nullable: true, comment: '完成日期' },
            { name: 'grade', type: 'varchar(10)', nullable: true, comment: '成绩' },
            { name: 'status', type: 'varchar(50)', defaultValue: "'enrolled'", comment: '状态' },
            { name: 'created_at', type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP', comment: '创建时间' },
        ],
        indexes: [
            { name: 'idx_enrollments_student_id', columns: ['student_id'] },
            { name: 'idx_enrollments_course_id', columns: ['course_id'] },
            { name: 'idx_enrollments_status', columns: ['status'] },
            { name: 'idx_enrollments_unique', columns: ['student_id', 'course_id'], unique: true },
        ]
    },
    {
        tableName: 'assignments',
        fields: [
            { name: 'id', type: 'uuid', comment: '作业ID' },
            { name: 'course_id', type: 'uuid', comment: '课程ID' },
            { name: 'title', type: 'varchar(255)', comment: '作业标题' },
            { name: 'description', type: 'text', nullable: true, comment: '作业描述' },
            { name: 'due_date', type: 'timestamp', nullable: true, comment: '截止日期' },
            { name: 'max_points', type: 'integer', nullable: true, comment: '最高分数' },
            { name: 'status', type: 'varchar(50)', defaultValue: "'active'", comment: '状态' },
            { name: 'created_at', type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP', comment: '创建时间' },
        ],
        indexes: [
            { name: 'idx_assignments_course_id', columns: ['course_id'] },
            { name: 'idx_assignments_due_date', columns: ['due_date'] },
            { name: 'idx_assignments_status', columns: ['status'] },
        ]
    }
]

// 卡片包配置映射
export const CARD_PACKAGE_TABLES = {
    'recruitment-package': RECRUITMENT_CARD_TABLES,
    'education-package': EDUCATION_CARD_TABLES,
} as const

export type CardPackageId = keyof typeof CARD_PACKAGE_TABLES

/**
 * 为指定应用创建卡片包相关的数据表
 */
export async function createCardPackageTables(
    applicationId: string,
    cardPackageId: CardPackageId,
    tablePrefix?: string
): Promise<void> {
    const tables = CARD_PACKAGE_TABLES[cardPackageId]
    if (!tables) {
        throw new Error(`Unknown card package: ${cardPackageId}`)
    }

    const prefix = tablePrefix ? `${tablePrefix}_` : ''

    for (const tableDef of tables) {
        const fullTableName = `${prefix}${tableDef.tableName}`

        // 构建字段定义
        const fieldDefinitions = tableDef.fields.map(field => {
            let definition = `${field.name} ${field.type}`

            if (!field.nullable && field.name !== 'id') {
                definition += ' NOT NULL'
            }

            if (field.defaultValue) {
                definition += ` DEFAULT ${field.defaultValue}`
            }

            if (field.comment) {
                definition += ` COMMENT '${field.comment}'`
            }

            return definition
        }).join(',\n    ')

        // 构建索引定义
        const indexDefinitions = tableDef.indexes?.map(index => {
            const uniqueKeyword = index.unique ? 'UNIQUE ' : ''
            return `CREATE ${uniqueKeyword}INDEX ${index.name} ON ${fullTableName} (${index.columns.join(', ')})`
        }).join(';\n') || ''

        // 创建表
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${fullTableName} (
        ${fieldDefinitions}
      )
    `

        try {
            await db.execute(sql.raw(createTableSQL))
            console.log(`✅ Created table: ${fullTableName}`)

            // 创建索引
            if (indexDefinitions) {
                await db.execute(sql.raw(indexDefinitions))
                console.log(`✅ Created indexes for table: ${fullTableName}`)
            }
        } catch (error) {
            console.error(`❌ Failed to create table ${fullTableName}:`, error)
            throw error
        }
    }
}

/**
 * 删除指定应用的卡片包相关数据表
 */
export async function dropCardPackageTables(
    applicationId: string,
    cardPackageId: CardPackageId,
    tablePrefix?: string
): Promise<void> {
    const tables = CARD_PACKAGE_TABLES[cardPackageId]
    if (!tables) {
        throw new Error(`Unknown card package: ${cardPackageId}`)
    }

    const prefix = tablePrefix ? `${tablePrefix}_` : ''

    for (const tableDef of tables) {
        const fullTableName = `${prefix}${tableDef.tableName}`

        try {
            await db.execute(sql.raw(`DROP TABLE IF EXISTS ${fullTableName}`))
            console.log(`✅ Dropped table: ${fullTableName}`)
        } catch (error) {
            console.error(`❌ Failed to drop table ${fullTableName}:`, error)
            throw error
        }
    }
}

/**
 * 检查卡片包数据表是否存在
 */
export async function checkCardPackageTables(
    applicationId: string,
    cardPackageId: CardPackageId,
    tablePrefix?: string
): Promise<boolean> {
    const tables = CARD_PACKAGE_TABLES[cardPackageId]
    if (!tables) {
        return false
    }

    const prefix = tablePrefix ? `${tablePrefix}_` : ''

    for (const tableDef of tables) {
        const fullTableName = `${prefix}${tableDef.tableName}`

        try {
            const result = await db.execute(sql.raw(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = '${fullTableName}'
        )
      `))

            const exists = result.rows[0]?.exists
            if (!exists) {
                return false
            }
        } catch (error) {
            console.error(`❌ Failed to check table ${fullTableName}:`, error)
            return false
        }
    }

    return true
}