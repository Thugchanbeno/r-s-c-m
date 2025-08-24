// scripts/migration/migrate.js
import 'module-alias/register.js';
import dotenv from 'dotenv';
import { migrateUsers } from './migrateUsers.js';
import { migrateSkills } from './migrateSkills.js';
import { migrateProjects } from './migrateProjects.js';
import { migrateUserSkills } from './migrateUserSkills.js';
import { migrateAllocations } from './migrateAllocations.js';
import { migrateResourceRequests } from './migrateResourceRequests.js';
import { migrateNotifications } from './migrateNotifications.js';
import { migrateCvCache } from './migrateCvCache.js';

dotenv.config({ path: '.env.local' });

async function runMigration() {
  console.log('🚀 Starting complete MongoDB to Convex migration...');
  console.log('Environment check:', {
    mongoUri: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL ? '✅ Set' : '❌ Missing',
  });
  
  if (!process.env.MONGODB_URI || !process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }
  
  const startTime = Date.now();
  
  try {
    // Initialize global mappings for ID relationships
    console.log('📋 Initializing ID mappings...');
    global.userIdMapping = new Map();
    global.skillIdMapping = new Map();
    global.projectIdMapping = new Map();
    global.userSkillIdMapping = new Map();
    global.allocationIdMapping = new Map();
    global.resourceRequestIdMapping = new Map();
    global.notificationIdMapping = new Map();
    global.cvCacheIdMapping = new Map();
    
    // Run migrations in dependency order
    console.log('\n📊 Starting migration phases...\n');
    
    // Phase 1: Core entities (no dependencies)
    console.log('🔄 Phase 1: Core entities');
    await migrateUsers();
    await migrateSkills();
    
    // Phase 2: Entities with user/skill dependencies
    console.log('\n🔄 Phase 2: User-skill relationships');
    await migrateProjects();
    await migrateUserSkills();
    
    // Phase 3: Complex relationships
    console.log('\n🔄 Phase 3: Complex relationships');
    await migrateAllocations();
    await migrateResourceRequests();
    
    // Phase 4: Supporting data
    console.log('\n🔄 Phase 4: Supporting data');
    await migrateNotifications();
    await migrateCvCache();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log(`⏱️  Total time: ${duration} seconds`);
    console.log('\n📈 Migration summary:');
    console.log(`   👥 Users: ${global.userIdMapping.size}`);
    console.log(`   🎯 Skills: ${global.skillIdMapping.size}`);
    console.log(`   📋 Projects: ${global.projectIdMapping.size}`);
    console.log(`   🔗 User Skills: ${global.userSkillIdMapping.size}`);
    console.log(`   📊 Allocations: ${global.allocationIdMapping.size}`);
    console.log(`   📝 Resource Requests: ${global.resourceRequestIdMapping.size}`);
    console.log(`   🔔 Notifications: ${global.notificationIdMapping.size}`);
    console.log(`   📄 CV Cache: ${global.cvCacheIdMapping.size}`);
    
    console.log('\n✅ All data has been successfully migrated to Convex!');
    console.log('🔧 Next steps:');
    console.log('   1. Update your API routes to use Convex functions');
    console.log('   2. Update frontend components to use Convex hooks');
    console.log('   3. Test the application thoroughly');
    console.log('   4. Once confirmed working, you can safely remove MongoDB');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n⚠️  Migration interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Migration terminated');
  process.exit(1);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { runMigration };