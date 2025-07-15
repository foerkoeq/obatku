import prisma from './prisma.client';

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Disconnect from database
 */
export async function disconnect(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
}

/**
 * Execute raw query (for debugging)
 */
export async function executeRawQuery(query: string): Promise<any> {
  try {
    const result = await prisma.$queryRawUnsafe(query);
    return result;
  } catch (error) {
    console.error('❌ Error executing raw query:', error);
    throw error;
  }
}

/**
 * Get database stats
 */
export async function getDatabaseStats(): Promise<any> {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        TABLE_NAME as tableName,
        TABLE_ROWS as rowCount,
        DATA_LENGTH as dataSize,
        INDEX_LENGTH as indexSize
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `;
    return stats;
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    throw error;
  }
}

/**
 * Check if database is ready
 */
export async function isDatabaseReady(): Promise<boolean> {
  try {
    // Check if we can query the database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `;
    
    return Array.isArray(tables) && tables.length > 0;
  } catch (error) {
    console.error('❌ Database not ready:', error);
    return false;
  }
}
