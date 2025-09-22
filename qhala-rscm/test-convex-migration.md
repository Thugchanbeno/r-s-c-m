# ✅ **Convex Migration Testing Guide**

## **Converted Components Summary**

### **🔧 Successfully Converted to Convex:**

1. **`lib/hooks/useAllocations.js`** ✅
   - Converted from REST API to Convex queries/mutations
   - Uses: `api.allocations.getAll`, `api.users.getAll`, `api.projects.getAll`
   - Uses: `api.allocations.create`, `api.allocations.update`, `api.allocations.remove`

2. **`components/admin/UserList.jsx`** ✅
   - Converted from REST API to Convex query
   - Uses: `api.users.getAll` with search filters

3. **`lib/hooks/useProjectDetailsData.js`** ✅
   - Converted recommendations from REST API to Convex mutation
   - Uses: `api.projects.getRecommendations`
   - Resource requests already using: `api.resourceRequests.create`

## **🧪 Test Scenarios**

### **Test 1: Admin Allocations Page**
1. Navigate to `/admin/allocations`
2. Verify allocations load properly
3. Test create new allocation (modal should open with users/projects dropdowns)
4. Test edit allocation functionality
5. Test delete allocation functionality

### **Test 2: Admin Users Page**
1. Navigate to `/admin/users`
2. Verify users list loads properly
3. Test search functionality (should filter users)
4. Test skill search functionality
5. Test edit user functionality

### **Test 3: Project Details Page**
1. Navigate to a project detail page `/projects/[projectId]`
2. Test "Get Recommendations" button
3. Verify recommendations load from Convex
4. Test resource request creation
5. Verify resource requests are stored in Convex

## **🔍 Debug Commands**

If there are issues, check:

```bash
# Check if Convex is running
npx convex dev

# Check console for any errors
# Open browser dev tools and check Network/Console tabs
```

## **📋 Pre-Test Checklist**

- ✅ Convex dev server is running
- ✅ All users have proper roles (admin, hr, pm, etc.)
- ✅ Test data exists (projects, users, allocations)
- ✅ Authentication is working properly

## **🚀 Ready for Full Testing**

All admin sections and project pages now use Convex instead of REST APIs. The interdomain notifications system is also fully integrated and will create rich notifications for:

- **Allocation changes** → Notifications to users and PMs
- **Project updates** → Notifications to team members  
- **Resource requests** → Notifications to line managers and HR
- **User role changes** → Notifications to affected users
- **Task assignments** → Notifications to assignees and PMs

The system is ready for comprehensive end-to-end testing!