# MongoDB to Convex Migration Status Report

**Generated:** September 7, 2024  
**Branch:** migration  
**Codebase:** qhala-rscm

---

Update: September 22, 2025

- Converted external-API callers to Convex actions:
  - projects.getRecommendations → Action (was Mutation)
  - projects.extractSkillsFromDescription → Action (was Mutation)
- Added internal helpers for actions: getActorByEmail, getProjectById, updateProjectSkills
- Fixed environment for Convex: set NLP_API_URL on Convex deployment (was defaulting to localhost)
- Frontend updated to call actions:
  - useProjectDetailsData now uses useAction for getRecommendations
  - useAI and useProjects now use useAction for extractSkillsFromDescription
- Recommendation microservice reachable in GCP; currently returns 500 due to ID format mismatch (expects Mongo ObjectId, receives Convex Id). Will resolve after backend update.
- UI for recommendations and skill extraction is wired with proper loading and error states.

## 📊 Migration Overview

### ✅ Completed Migrations
The following components have been successfully migrated to Convex:

#### 1. **Core Data Models**
- **Users** - ✅ Fully migrated to Convex schema
- **Skills** - ✅ Fully migrated to Convex schema  
- **Projects** - ✅ Fully migrated to Convex schema
- **Allocations** - ✅ Fully migrated to Convex schema
- **Resource Requests** - ✅ Fully migrated to Convex schema
- **Notifications** - ✅ Fully migrated to Convex schema
- **CV Cache** - ✅ Fully migrated to Convex schema
- **User Skills** - ✅ Fully migrated to Convex schema
- **Tasks** - ✅ Fully migrated to Convex schema
- **Activities** - ✅ Fully migrated to Convex schema
- **Events** - ✅ Fully migrated to Convex schema

#### 2. **API Endpoints (Migrated to Convex)**
- `/api/users` - ✅ Using Convex mutations/queries
- `/api/projects` - ✅ Using Convex mutations/queries
- `/api/allocations` - ✅ Using Convex mutations/queries
- `/api/notifications` - ✅ Using Convex mutations/queries
- `/api/skills` - ✅ Using Convex mutations/queries (partial)

#### 3. **Components Using Convex**
- `useDashboard.js` - ✅ Fully migrated to Convex queries
- Most admin components - ✅ Using Convex
- Authentication system - ✅ Using Convex for user management

### ⚠️ Partially Migrated / Needs Completion

#### 1. **Mixed Architecture Components**
These components are using both REST APIs and Convex, indicating incomplete migration:

**High Priority:**
- **`NotificationDropdown.jsx`** - Still making REST API calls to `/api/notifications`
- **User Skills Management** - Critical components still using MongoDB models directly

Note: `useAllocations.js` has been migrated to Convex and enhanced (date conversions, overlap validation, UI consistency, toasts).

**Medium Priority:**
- **Profile Components** - Some functionality still using REST APIs
- **Admin Forms** - Mixed usage of REST and Convex

#### 2. **Components Still Using REST APIs**
```
components/user/NotificationDropdown.jsx - Lines 30, 62, 81
lib/hooks/useAllocations.js - Lines 39, 77, 78, 150, 151, 155, 196
components/admin/PendingRequests.jsx - Line 35
components/admin/UserForm.jsx - Lines 33, 79
components/user/SkillTaxonomyList.jsx - Lines 26, 87
lib/hooks/useProfile.js - Multiple REST API calls
components/admin/CVUploader.jsx - Lines 35, 38, 69, 117, 148
```

### 🚨 Critical Issues Requiring Immediate Attention

#### 1. Recommendation Microservice ID Format Mismatch
- Python service expects MongoDB ObjectId for project id; Convex provides string ids.
- Current status: service reachable; POST /recommend/users-for-project returns 500 with Convex ids.
- Resolution options:
  - Update Python service to accept Convex ids or map ids
  - Or introduce a proxy that translates Convex ids to legacy ids (temporary)

#### 2. **UserSkills System - MAJOR BLOCKER**
**Location:** `/app/api/userskills/`
- **Issue:** Still completely dependent on MongoDB models
- **Files affected:**
  - `controllers.js` - Imports `UserSkill` and `Skill` MongoDB models directly
  - `operations.js` - Uses mongoose ObjectId and MongoDB operations
  - `validators.js` - References MongoDB models
  - `utils.js` - MongoDB-specific operations

**Impact:** This is a critical bottleneck as user skills are core to the application functionality.

#### 3. **Authentication Issues**
**Location:** `/lib/authOptions.js`
- **Status:** ✅ Actually using Convex (was updated correctly)
- **Note:** Authentication is properly migrated to Convex

#### 4. **Legacy MongoDB Models Still Present**
All MongoDB models in `/models/` directory are still present:
- `User.js`
- `Skills.js` 
- `Project.js`
- `Allocation.js`
- `ResourceRequest.js`
- `Notifications.js`
- `CvCache.js`
- `UserSkills.js`

These should be removed once all references are migrated.

## 🛠️ Migration Action Plan

### Phase 1: Critical UserSkills Migration (HIGH PRIORITY)
1. **Create new Convex-based UserSkills API**
   - Replace `/app/api/userskills/controllers.js` with Convex functions
   - Migrate operations.js logic to Convex mutations
   - Update validators.js to work with Convex schema

2. **Update Components Using UserSkills**
   - `components/user/SkillTaxonomyList.jsx`
   - `lib/hooks/useProfile.js`
   - Any admin components managing user skills

### Phase 2: Finish Component Migration (MEDIUM PRIORITY)
3. **Migrate Remaining Hook REST API Calls**
   - `useProfile.js` - Complete migration to Convex
   - Other hooks still using fetch/axios

4. **Update Notification System**
   - `NotificationDropdown.jsx` - Replace REST calls with Convex queries
   - Ensure real-time notifications work with Convex

5. Recommendations & AI Integration
   - Keep `projects.getRecommendations` as an action
   - After Python service update, validate payload and response shape
   - Optionally maintain Next.js proxy at `/api/ai/get-recommendations` for flexibility

### Phase 3: Cleanup (LOW PRIORITY)
5. **Remove Legacy Code**
   - Delete MongoDB models from `/models/` directory
   - Remove unused REST API routes
   - Clean up imports referencing old models
   - Update any remaining components with mixed patterns

## 📋 Detailed File Analysis

### Files Still Using MongoDB Models Directly:
```
❌ app/api/userskills/controllers.js - Imports UserSkill, Skill models
❌ app/api/userskills/operations.js - Uses mongoose.Types.ObjectId
❌ app/api/userskills/validators.js - References MongoDB models
❌ app/api/userskills/utils.js - MongoDB operations
❌ lib/authOptions.js - Uses models (but actually migrated to Convex)
❌ components/user/ProfileComponents.jsx - Some MongoDB references
```

### API Routes Analysis:
- **Total API routes found:** ~50+ endpoints
- **Migrated to Convex:** ~80%
- **Still using MongoDB:** ~20% (mostly UserSkills related)

### Convex Schema & Runtime Status:
✅ **Complete and well-structured schema in convex/schema.js**
- All major entities defined
- Proper relationships established
- Indexes configured correctly

✅ Runtime Enhancements
- Actions in place for external service calls (recommendations, skill extraction)
- Convex environment configured: NLP_API_URL set for dev deployment
- Internal helper queries/mutations added for action DB access

## 🎯 Success Metrics

### Current Status:
- **Schema Migration:** 100% ✅
- **API Endpoints:** ~85% ✅
- **Component Migration:** ~80% ✅
- **Hook Migration:** ~75% ✅
- **Legacy Code Removal:** 10% 🟡

### Target Completion:
- UserSkills system migration: **Critical - Complete ASAP**
- Remaining hook migrations: **1-2 weeks**
- Full legacy cleanup: **2-3 weeks**

## 🚀 Recommendations

1. **Prioritize UserSkills migration** - This is blocking other parts of the system
2. **Create migration validation tests** - Ensure data integrity during transition
3. **Consider gradual rollout** - Feature flags for switching between old/new systems
4. **Update documentation** - Ensure team knows which APIs to use
5. **Performance monitoring** - Track Convex query performance vs old REST APIs

## 📊 Risk Assessment

**High Risk:**
- UserSkills functionality may break if not properly migrated
- Data consistency issues between MongoDB and Convex during transition

**Medium Risk:**  
- User experience degradation from mixed API usage
- Potential performance issues from dual database queries

**Low Risk:**
- Legacy code maintenance overhead
- Developer confusion about which APIs to use

---
*This report should be updated as migration progress continues.*
