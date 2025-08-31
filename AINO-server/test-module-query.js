const { db } = require('./dist/db/index.js');
const { moduleInstalls } = require('./dist/db/schema.js');
const { eq } = require('drizzle-orm');

async function testQuery() {
  try {
    console.log('Testing module_installs query...');
    
    const result = await db
      .select({
        moduleKey: moduleInstalls.moduleKey,
        moduleName: moduleInstalls.moduleName,
        moduleVersion: moduleInstalls.moduleVersion,
        moduleType: moduleInstalls.moduleType,
        installStatus: moduleInstalls.installStatus,
      })
      .from(moduleInstalls)
      .where(eq(moduleInstalls.applicationId, '0f6c007e-0d10-4119-abb9-85eef2e82dcc'));
    
    console.log('Query result:', result);
  } catch (error) {
    console.error('Query error:', error);
  }
}

testQuery();
