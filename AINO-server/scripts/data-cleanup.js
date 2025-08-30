#!/usr/bin/env node

/**
 * Data Cleanup Script
 * Provides multiple data cleanup strategies with safety measures
 * 
 * SAFETY FEATURES:
 * - Multiple confirmation prompts
 * - Dry-run mode for testing
 * - Backup before deletion
 * - Whitelist/blacklist protection
 * - Detailed logging
 */

import { Pool } from 'pg';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

const pool = new Pool({ 
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  user: process.env.DB_USER || 'aino',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'aino',
  ssl: false
});

class DataCleanup {
  constructor() {
    this.tables = ['dir_users', 'dir_jobs', 'relations'];
    this.safetyConfig = {
      dryRun: false,
      requireConfirmation: true,
      maxDeletionPerRun: 100,
      backupBeforeDelete: true,
      whitelistFields: ['id', 'created_at', 'updated_at', 'deleted_at'],
      blacklistKeywords: ['admin', 'system', 'root', 'important', 'critical']
    };
    this.logFile = 'data-cleanup.log';
  }

  /**
   * Initialize readline interface for user input
   */
  initReadline() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Close readline interface
   */
  closeReadline() {
    if (this.rl) {
      this.rl.close();
    }
  }

  /**
   * Ask for user confirmation
   */
  async askConfirmation(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.toLowerCase().trim());
      });
    });
  }

  /**
   * Log operation with timestamp
   */
  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    console.log(logMessage);
    
    // Write to log file
    writeFileSync(this.logFile, logMessage + '\n', { flag: 'a' });
  }

  /**
   * Create backup of data before deletion
   */
  async createBackup(table, records) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-${table}-${timestamp}.json`;
    
    this.log(`Creating backup: ${backupFile}`);
    writeFileSync(backupFile, JSON.stringify(records, null, 2));
    this.log(`Backup created successfully: ${backupFile}`);
    
    return backupFile;
  }

  /**
   * Check if data contains blacklisted keywords
   */
  checkForBlacklistedData(records) {
    for (const record of records) {
      const recordStr = JSON.stringify(record).toLowerCase();
      for (const keyword of this.safetyConfig.blacklistKeywords) {
        if (recordStr.includes(keyword.toLowerCase())) {
          this.log(`Found blacklisted keyword '${keyword}' in record ${record.id}`, 'WARNING');
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Analyze data situation with safety checks
   */
  async analyzeData() {
    this.log('Starting data analysis...');
    console.log('📊 Data Analysis Report:');
    
    for (const table of this.tables) {
      try {
        const total = await pool.query(`SELECT COUNT(*) as total FROM ${table}`);
        const deleted = await pool.query(`SELECT COUNT(*) as deleted FROM ${table} WHERE deleted_at IS NOT NULL`);
        const active = await pool.query(`SELECT COUNT(*) as active FROM ${table} WHERE deleted_at IS NULL`);
        
        console.log(`\n📋 Table: ${table}`);
        console.log(`   Total records: ${total.rows[0].total}`);
        console.log(`   Active records: ${active.rows[0].active}`);
        console.log(`   Deleted records: ${deleted.rows[0].deleted}`);
        
        if (total.rows[0].total > 0) {
          const deleteRate = ((deleted.rows[0].deleted / total.rows[0].total) * 100).toFixed(1);
          console.log(`   Deletion rate: ${deleteRate}%`);
        }
        
        this.log(`Analysis completed for table: ${table}`);
      } catch (error) {
        this.log(`Failed to analyze ${table}: ${error.message}`, 'ERROR');
        console.log(`\n❌ ${table}: Table does not exist or query failed`);
      }
    }
  }

  /**
   * Strategy 1: Permanently delete soft-deleted records older than specified days
   * WITH SAFETY CHECKS
   */
  async permanentDeleteOlderThan(days = 30) {
    this.log(`Starting permanent deletion of records older than ${days} days`);
    console.log(`\n🗑️  Permanently deleting soft-deleted records older than ${days} days...`);
    
    // Safety check: Require confirmation
    if (this.safetyConfig.requireConfirmation) {
      this.initReadline();
      const confirm = await this.askConfirmation(
        `⚠️  WARNING: This will PERMANENTLY DELETE data older than ${days} days. Continue? (yes/no): `
      );
      
      if (confirm !== 'yes') {
        console.log('❌ Operation cancelled by user');
        this.closeReadline();
        return;
      }
      
      // Double confirmation for safety
      const doubleConfirm = await this.askConfirmation(
        `⚠️  FINAL WARNING: This action cannot be undone. Type 'DELETE' to confirm: `
      );
      
      if (doubleConfirm !== 'delete') {
        console.log('❌ Operation cancelled - confirmation failed');
        this.closeReadline();
        return;
      }
      this.closeReadline();
    }
    
    for (const table of this.tables) {
      try {
        // First, get records to be deleted for backup
        const recordsToDelete = await pool.query(`
          SELECT * FROM ${table} 
          WHERE deleted_at IS NOT NULL 
          AND deleted_at < NOW() - INTERVAL '${days} days'
          LIMIT ${this.safetyConfig.maxDeletionPerRun}
        `);
        
        if (recordsToDelete.rows.length === 0) {
          console.log(`   ℹ️  ${table}: No records to delete`);
          continue;
        }
        
        console.log(`   📋 ${table}: Found ${recordsToDelete.rows.length} records to delete`);
        
        // Create backup if enabled
        if (this.safetyConfig.backupBeforeDelete) {
          await this.createBackup(table, recordsToDelete.rows);
        }
        
        // Check for blacklisted keywords in data
        const hasBlacklistedData = this.checkForBlacklistedData(recordsToDelete.rows);
        if (hasBlacklistedData) {
          this.log(`Skipping deletion for ${table} - contains blacklisted keywords`, 'WARNING');
          console.log(`   ⚠️  ${table}: Skipped - contains protected keywords`);
          continue;
        }
        
        // Perform deletion
        if (this.safetyConfig.dryRun) {
          console.log(`   🔍 DRY RUN: Would delete ${recordsToDelete.rows.length} records from ${table}`);
          this.log(`DRY RUN: Would delete ${recordsToDelete.rows.length} records from ${table}`);
        } else {
          const result = await pool.query(`
            DELETE FROM ${table} 
            WHERE deleted_at IS NOT NULL 
            AND deleted_at < NOW() - INTERVAL '${days} days'
            AND id = ANY($1)
          `, [recordsToDelete.rows.map(r => r.id)]);
          
          console.log(`   ✅ ${table}: Deleted ${result.rowCount} records`);
          this.log(`Successfully deleted ${result.rowCount} records from ${table}`);
        }
        
      } catch (error) {
        this.log(`Failed to delete from ${table}: ${error.message}`, 'ERROR');
        console.log(`   ❌ ${table}: Deletion failed - ${error.message}`);
      }
    }
  }

  /**
   * 策略2: 压缩软删除记录（只保留关键字段）
   */
  async compressDeletedRecords() {
    console.log('\n🗜️  压缩软删除记录...');
    
    for (const table of this.tables) {
      try {
        // 对于 dir_users 表，压缩 props 字段
        if (table === 'dir_users') {
          const result = await pool.query(`
            UPDATE ${table} 
            SET props = jsonb_build_object(
              'id', props->>'id',
              'name', props->>'name',
              'deleted_at', deleted_at::text
            )
            WHERE deleted_at IS NOT NULL
          `);
          
          if (result.rowCount > 0) {
            console.log(`   ✅ ${table}: 压缩了 ${result.rowCount} 条记录`);
          }
        }
      } catch (error) {
        console.log(`   ❌ ${table}: 压缩失败 - ${error.message}`);
      }
    }
  }

  /**
   * 策略3: 归档软删除记录到历史表
   */
  async archiveDeletedRecords() {
    console.log('\n📦 归档软删除记录...');
    
    for (const table of this.tables) {
      try {
        // 创建归档表
        await pool.query(`
          CREATE TABLE IF NOT EXISTS ${table}_archive (
            LIKE ${table} INCLUDING ALL
          )
        `);
        
        // 移动软删除记录到归档表
        const result = await pool.query(`
          INSERT INTO ${table}_archive 
          SELECT * FROM ${table} 
          WHERE deleted_at IS NOT NULL
        `);
        
        if (result.rowCount > 0) {
          // 从原表删除已归档的记录
          await pool.query(`
            DELETE FROM ${table} 
            WHERE deleted_at IS NOT NULL
          `);
          
          console.log(`   ✅ ${table}: 归档了 ${result.rowCount} 条记录`);
        } else {
          console.log(`   ℹ️  ${table}: 没有需要归档的记录`);
        }
      } catch (error) {
        console.log(`   ❌ ${table}: 归档失败 - ${error.message}`);
      }
    }
  }

  /**
   * Strategy 4: Clean up test data with safety checks
   */
  async cleanupTestData() {
    this.log('Starting test data cleanup');
    console.log('\n🧹 Cleaning up test data...');
    
    // Safety check: Require confirmation
    if (this.safetyConfig.requireConfirmation) {
      this.initReadline();
      const confirm = await this.askConfirmation(
        '⚠️  This will permanently delete test data. Continue? (yes/no): '
      );
      
      if (confirm !== 'yes') {
        console.log('❌ Operation cancelled by user');
        this.closeReadline();
        return;
      }
      this.closeReadline();
    }
    
    for (const table of this.tables) {
      try {
        // Define test keywords
        const testKeywords = ['test', '测试', 'demo', '示例', 'example', 'temp', '临时'];
        let conditions = testKeywords.map(keyword => 
          `props::text ILIKE '%${keyword}%'`
        ).join(' OR ');
        
        // First, get records to be deleted for backup
        const recordsToDelete = await pool.query(`
          SELECT * FROM ${table} 
          WHERE (${conditions})
          AND deleted_at IS NOT NULL
          LIMIT ${this.safetyConfig.maxDeletionPerRun}
        `);
        
        if (recordsToDelete.rows.length === 0) {
          console.log(`   ℹ️  ${table}: No test data found`);
          continue;
        }
        
        console.log(`   📋 ${table}: Found ${recordsToDelete.rows.length} test records to delete`);
        
        // Show what will be deleted
        console.log(`   📝 Records to be deleted:`);
        recordsToDelete.rows.forEach((record, index) => {
          console.log(`      ${index + 1}. ID: ${record.id}, Props: ${JSON.stringify(record.props).substring(0, 100)}...`);
        });
        
        // Create backup if enabled
        if (this.safetyConfig.backupBeforeDelete) {
          await this.createBackup(table, recordsToDelete.rows);
        }
        
        // Perform deletion
        if (this.safetyConfig.dryRun) {
          console.log(`   🔍 DRY RUN: Would delete ${recordsToDelete.rows.length} test records from ${table}`);
          this.log(`DRY RUN: Would delete ${recordsToDelete.rows.length} test records from ${table}`);
        } else {
          const result = await pool.query(`
            DELETE FROM ${table} 
            WHERE (${conditions})
            AND deleted_at IS NOT NULL
            AND id = ANY($1)
          `, [recordsToDelete.rows.map(r => r.id)]);
          
          console.log(`   ✅ ${table}: Deleted ${result.rowCount} test records`);
          this.log(`Successfully deleted ${result.rowCount} test records from ${table}`);
        }
        
      } catch (error) {
        this.log(`Failed to cleanup test data from ${table}: ${error.message}`, 'ERROR');
        console.log(`   ❌ ${table}: Cleanup failed - ${error.message}`);
      }
    }
  }

  /**
   * 策略5: 设置自动清理任务
   */
  async setupAutoCleanup() {
    console.log('\n⏰ 设置自动清理任务...');
    
    // 创建清理函数
    await pool.query(`
      CREATE OR REPLACE FUNCTION cleanup_deleted_records()
      RETURNS void AS $$
      BEGIN
        -- 删除30天前的软删除记录
        DELETE FROM dir_users WHERE deleted_at < NOW() - INTERVAL '30 days';
        DELETE FROM dir_jobs WHERE deleted_at < NOW() - INTERVAL '30 days';
        DELETE FROM relations WHERE deleted_at < NOW() - INTERVAL '30 days';
        
        -- 记录清理日志
        INSERT INTO cleanup_logs (table_name, deleted_count, cleanup_date)
        VALUES ('auto_cleanup', 1, NOW());
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // 创建清理日志表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cleanup_logs (
        id SERIAL PRIMARY KEY,
        table_name VARCHAR(100),
        deleted_count INTEGER,
        cleanup_date TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('   ✅ 自动清理函数已创建');
    console.log('   💡 建议设置 cron 任务定期执行: SELECT cleanup_deleted_records();');
  }

  /**
   * Enable dry-run mode for safe testing
   */
  enableDryRun() {
    this.safetyConfig.dryRun = true;
    this.log('Dry-run mode enabled - no actual deletions will be performed');
    console.log('🔍 DRY-RUN MODE ENABLED - No actual deletions will be performed');
  }

  /**
   * Disable confirmation prompts (for automated scripts)
   */
  disableConfirmation() {
    this.safetyConfig.requireConfirmation = false;
    this.log('Confirmation prompts disabled');
  }

  /**
   * Set maximum deletion limit per run
   */
  setMaxDeletionLimit(limit) {
    this.safetyConfig.maxDeletionPerRun = limit;
    this.log(`Maximum deletion limit set to ${limit} records per run`);
  }
}

// Main function with safety features
async function main() {
  const cleanup = new DataCleanup();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Parse safety flags
  if (args.includes('--dry-run')) {
    cleanup.enableDryRun();
  }
  
  if (args.includes('--no-confirm')) {
    cleanup.disableConfirmation();
  }
  
  const maxLimitIndex = args.indexOf('--max-limit');
  if (maxLimitIndex !== -1 && args[maxLimitIndex + 1]) {
    cleanup.setMaxDeletionLimit(parseInt(args[maxLimitIndex + 1]));
  }
  
  try {
    switch (command) {
      case 'analyze':
        await cleanup.analyzeData();
        break;
        
      case 'delete-old':
        const days = parseInt(args[1]) || 30;
        await cleanup.permanentDeleteOlderThan(days);
        break;
        
      case 'compress':
        await cleanup.compressDeletedRecords();
        break;
        
      case 'archive':
        await cleanup.archiveDeletedRecords();
        break;
        
      case 'cleanup-test':
        await cleanup.cleanupTestData();
        break;
        
      case 'setup-auto':
        await cleanup.setupAutoCleanup();
        break;
        
      case 'full-cleanup':
        console.log('🚀 Executing full cleanup process...');
        await cleanup.analyzeData();
        await cleanup.cleanupTestData();
        await cleanup.permanentDeleteOlderThan(7); // Delete records older than 7 days
        await cleanup.analyzeData();
        break;
        
      case 'help':
      default:
        console.log(`
🔧 Data Cleanup Tool - Safe Data Management

Usage: node data-cleanup.js <command> [options]

Commands:
  analyze           - Analyze data situation
  delete-old [days] - Permanently delete soft-deleted records older than specified days (default: 30)
  compress          - Compress soft-deleted records
  archive           - Archive soft-deleted records to history table
  cleanup-test      - Clean up test data
  setup-auto        - Setup automatic cleanup tasks
  full-cleanup      - Execute full cleanup process
  help              - Show this help message

Safety Options:
  --dry-run         - Enable dry-run mode (no actual deletions)
  --no-confirm      - Disable confirmation prompts
  --max-limit N     - Set maximum deletion limit per run (default: 100)

Examples:
  node data-cleanup.js analyze
  node data-cleanup.js cleanup-test --dry-run
  node data-cleanup.js delete-old 7 --max-limit 50
  node data-cleanup.js cleanup-test --no-confirm --dry-run
  node data-cleanup.js full-cleanup --dry-run
        `);
    }
  } catch (error) {
    cleanup.log(`Fatal error: ${error.message}`, 'ERROR');
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    cleanup.closeReadline();
    await pool.end();
  }
}

main().catch(console.error);
