# Comprehensive Notifications System Design

## 🎯 Overview
This document outlines the expanded notifications system covering all app domains and user interactions.

## 📋 Current State Analysis
- **Existing Types**: 9 basic notification types
- **Current Filtering**: Status, type, date range, search
- **Current Schema**: Basic structure with limited relationship tracking

## 🔄 Domain-Driven Notification Mapping

### **Toast vs Persistent Notification Criteria:**
**Toast Notifications:**
- ✅ User just performed the action (immediate feedback)
- ✅ User is currently active in the app
- ✅ Action success/failure confirmation
- ✅ Simple validation errors

**Persistent Notifications:**
- ✅ Events happening when user is not active
- ✅ Actions by OTHER users affecting you
- ✅ System-initiated events
- ✅ Requires follow-up action
- ✅ Important status changes over time

---

### 1. **User Management Domain**
**Involved Roles**: Admin, HR, Line Managers, Employees

#### Notification Types (Persistent Only):
- `user_role_changed` - User role/permissions changed by admin
- `user_deactivated` - User account deactivated by admin
- `user_reactivated` - User account reactivated by admin
- `user_profile_incomplete` - System reminder: Profile missing required information

#### NOT Notifications (Toasts Instead):
- ❌ `user_created` → Toast when admin creates user
- ❌ `user_updated` → Toast when user updates own profile
- ❌ `user_onboarding_complete` → Toast when user completes onboarding

#### Recipients:
- **Admin/HR**: Role changes they didn't initiate
- **User**: Events affecting their account by others
- **Line Manager**: Role changes for their direct reports

---

### 2. **Skills Management Domain**
**Involved Roles**: Employees, Line Managers, HR, Admin

#### Notification Types (Persistent Only):
- `skill_verification_requested` - User submitted skill proof for verification
- `skill_verification_approved` - Skill verification approved by line manager
- `skill_verification_rejected` - Skill verification rejected with reason
- `skill_verification_expired` - System alert: Skill verification expired
- `skill_in_demand` - System alert: User has skill that's currently in high demand
- `new_skill_opportunity` - System recommendation: Suggested skill based on current projects
- `skills_profile_incomplete` - System reminder: User missing critical skills data

#### NOT Notifications (Toasts Instead):
- ❌ `skill_added_to_profile` → Toast when user adds skill
- ❌ `skill_removed_from_profile` → Toast when user removes skill
- ❌ `skill_proficiency_updated` → Toast when user updates proficiency

#### Recipients:
- **Line Manager**: Verification requests from their reports
- **Employee**: Verification results (when not actively using app), system recommendations
- **HR/Admin**: System-generated compliance and opportunity alerts

---

### 3. **Project Management Domain**
**Involved Roles**: PM, HR, Admin, Employees, Line Managers

#### Notification Types (Persistent Only):
- `project_deadline_approaching` - System alert: Project deadline in next 7 days
- `project_overdue` - System alert: Project past deadline
- `project_team_added` - You were added to project team by PM
- `project_team_removed` - You were removed from project team by PM
- `project_skills_matched` - System match: Your skills match new project requirements
- `project_cancelled` - Project you're involved in was cancelled
- `project_status_changed` - Project you're involved in changed status (if significant)

#### NOT Notifications (Toasts Instead):
- ❌ `project_created` → Toast when PM creates project
- ❌ `project_updated` → Toast when PM updates project details
- ❌ `project_completed` → Toast when PM marks project complete
- ❌ `project_skills_updated` → Toast when PM updates required skills

#### Recipients:
- **Employees**: When they're added/removed from teams, skill matches, deadline alerts
- **PM**: System-generated deadline and overdue alerts
- **Line Managers**: When their reports are added/removed from projects

---

### 4. **Resource Allocation Domain**
**Involved Roles**: PM, HR, Admin, Employees, Line Managers

#### Notification Types (Persistent Only):
- `allocation_created` - You were allocated to a project by PM/HR
- `allocation_updated` - Your allocation percentage/dates changed by PM/HR
- `allocation_cancelled` - Your allocation was cancelled by PM/HR
- `allocation_conflict` - System alert: Over-allocation detected (>100%)
- `allocation_underutilized` - System alert: User consistently under-allocated
- `allocation_approaching_capacity` - System alert: User approaching 100% capacity

#### NOT Notifications (Toasts Instead):
- ❌ `allocation_completed` → System process, no notification needed
- ❌ `allocation_request_created` → Toast when PM submits request
- ❌ `allocation_request_approved` → Handled in Resource Requests domain
- ❌ `allocation_request_rejected` → Handled in Resource Requests domain

#### Recipients:
- **Employee**: When allocations are created/changed by others, system capacity alerts
- **Line Manager**: System alerts about their reports' capacity issues
- **HR/Admin**: System-generated conflict and utilization alerts

---

### 5. **Resource Requests Domain**
**Involved Roles**: PM (Requester), Line Managers, HR (Approvers)

#### Notification Types (Persistent Only):
- `resource_request_pending_lm` - New request awaiting your line manager approval
- `resource_request_pending_hr` - Request awaiting your HR approval
- `resource_request_lm_approved` - Line manager approved your request
- `resource_request_lm_rejected` - Line manager rejected your request
- `resource_request_hr_approved` - HR approved your request (final approval)
- `resource_request_hr_rejected` - HR rejected your request (final rejection)
- `resource_request_expired` - System alert: Request expired without approval

#### NOT Notifications (Toasts Instead):
- ❌ `resource_request_submitted` → Toast when PM submits request
- ❌ `resource_request_cancelled` → Toast when PM cancels request

#### Recipients:
- **Line Manager**: Requests requiring their approval
- **HR**: Requests requiring their approval
- **PM**: Status updates on their requests (when not actively in app)
- **Employee**: Final allocation decisions affecting them

---

### 6. **Work Requests Domain (Leave/Overtime)**
**Involved Roles**: Employees, Line Managers, PM, HR

#### Notification Types (Persistent Only):
- `leave_request_pending_lm` - New leave request awaiting your approval
- `leave_request_pending_pm` - Leave request awaiting your PM approval
- `leave_request_pending_hr` - Leave request awaiting your HR approval
- `leave_request_approved` - Your leave request was fully approved
- `leave_request_rejected` - Your leave request was rejected
- `overtime_request_approved` - Your overtime request was approved
- `overtime_request_rejected` - Your overtime request was rejected
- `leave_balance_low` - System alert: Annual leave balance running low
- `leave_expiring_soon` - System alert: Leave days expiring soon
- `covering_assignment` - You were assigned to cover colleague's responsibilities

#### NOT Notifications (Toasts Instead):
- ❌ `leave_request_submitted` → Toast when employee submits request
- ❌ `leave_request_cancelled` → Toast when employee cancels request
- ❌ `overtime_request_submitted` → Toast when employee submits request

#### Recipients:
- **Line Manager**: Leave requests requiring their approval
- **PM**: Leave requests requiring their approval
- **HR**: Leave requests requiring their approval
- **Employee**: Status updates on their requests (when not actively in app)
- **Covering User**: When assigned to cover responsibilities

---

### 7. **Task Management Domain**
**Involved Roles**: PM, Employees, Line Managers

#### Notification Types (Persistent Only):
- `task_assigned` - New task assigned to you by PM
- `task_deadline_approaching` - System alert: Task deadline in next 3 days
- `task_overdue` - System alert: Task past deadline
- `task_commented` - Someone commented on your task (when not active)
- `task_reassigned` - Task was reassigned to you by PM

#### NOT Notifications (Toasts Instead):
- ❌ `task_updated` → Toast when PM updates task details
- ❌ `task_status_changed` → Toast when employee updates status
- ❌ `task_completed` → Toast when employee completes task

#### Recipients:
- **Employee**: Tasks assigned to them, deadline alerts, comments
- **PM**: System-generated deadline alerts for project tasks
- **Line Manager**: Overdue task alerts for their reports

---

### 8. **CV/Profile Management Domain**
**Involved Roles**: Employees, HR, Admin

#### Notification Types (Persistent Only):
- `cv_processed` - CV processing completed with extracted skills (when not active)
- `cv_processing_failed` - CV processing failed (when not active)
- `profile_completeness_low` - System reminder: Profile completion below threshold
- `profile_recommendation` - System suggestion: Profile improvements

#### NOT Notifications (Toasts Instead):
- ❌ `cv_uploaded` → Toast when employee uploads CV
- ❌ `cv_linked_to_profile` → Toast when employee links CV

#### Recipients:
- **Employee**: CV processing results (when not actively in app), system recommendations
- **HR/Admin**: Failed processing alerts requiring intervention

---

### 9. **Analytics & Reporting Domain**
**Involved Roles**: Admin, HR, PM, Line Managers

#### Notification Types (Persistent Only):
- `report_generated` - Scheduled report ready for download
- `report_failed` - System alert: Report generation failed
- `analytics_alert` - System alert: Unusual pattern detected
- `capacity_alert` - System alert: Organization capacity threshold reached
- `skills_gap_alert` - System alert: Critical skills shortage detected
- `utilization_alert` - System alert: Team utilization outside normal range

#### Recipients:
- **Admin/HR**: All system-generated analytics alerts and reports
- **PM**: Project-specific capacity and utilization alerts
- **Line Manager**: Team-specific utilization and capacity alerts

---

### 10. **System & Administrative Domain**
**Involved Roles**: All Users

#### Notification Types (Persistent Only):
- `system_maintenance` - Scheduled maintenance notification (advance warning)
- `system_update` - New features or updates available
- `system_alert` - System issues or downtime alerts
- `data_export_ready` - Requested data export ready for download
- `security_alert` - Security-related notifications
- `account_security` - Password expiry, login from new device

#### NOT Notifications (System Process Only):
- ❌ `backup_completed` → Admin log entry, not user notification

#### Recipients:
- **All Users**: System-wide maintenance, security alerts
- **Admin**: All administrative and security alerts
- **Specific Users**: Data export ready, account security alerts

---

## 📊 Notification Categories for Filtering

### Primary Categories:
1. **User Management** - Account changes by others, system reminders
2. **Skills & Verification** - Verification workflows, system recommendations  
3. **Projects** - Team assignments, deadlines, system alerts
4. **Resources** - Allocation changes by others, capacity alerts
5. **Approvals** - Resource requests, leave requests awaiting action
6. **Tasks** - Task assignments, deadlines, comments
7. **System** - Maintenance, security, data exports
8. **Analytics** - System-generated alerts and reports

### Notification Type Count Summary:
- **Total Persistent Notification Types**: ~35 (down from 70+)
- **User Management**: 4 types
- **Skills & Verification**: 7 types  
- **Projects**: 7 types
- **Resources**: 6 types
- **Approvals**: 7 types
- **Tasks**: 5 types
- **System**: 6 types
- **Analytics**: 6 types

### Priority Levels:
- **Critical** - Requires immediate attention (security, system down)
- **High** - Important for workflow (approvals, deadlines)
- **Medium** - Informational but relevant (updates, assignments)
- **Low** - General information (tips, recommendations)

### Urgency Levels:
- **Immediate** - Real-time notification
- **Daily Digest** - Bundled daily summary
- **Weekly Summary** - Weekly roundup
- **Monthly Report** - Monthly analytics

## 🔔 Enhanced Filtering System

### Filter Categories:
1. **By Category** - User Management, Skills, Projects, etc.
2. **By Priority** - Critical, High, Medium, Low
3. **By Status** - Read, Unread, Archived
4. **By Sender Role** - Admin, HR, PM, Line Manager, System
5. **By Action Required** - Requires Action, Informational Only
6. **By Date Range** - Today, Week, Month, Custom Range
7. **By Related Entity** - Specific Project, User, Skill, etc.

### Advanced Features:
- **Smart Grouping** - Group related notifications
- **Batch Actions** - Mark multiple as read, archive, delete
- **Quick Filters** - Predefined filter combinations
- **Search** - Full-text search across messages and metadata

## 🎚️ Notification Preferences System

### Role-Based Defaults:

#### **Employee Defaults:**
- ✅ Skills verification results
- ✅ Task assignments and deadlines  
- ✅ Leave request status
- ✅ Allocation changes
- ❌ Administrative updates
- ❌ Other users' activities

#### **Line Manager Defaults:**
- ✅ Direct reports' requests (all types)
- ✅ Skill verification requests
- ✅ Team capacity alerts
- ✅ Direct reports' leave requests
- ❌ Other teams' activities

#### **PM Defaults:**
- ✅ Project updates
- ✅ Resource request status
- ✅ Team member allocations
- ✅ Project deadlines
- ❌ Administrative updates

#### **HR Defaults:**
- ✅ All user management events
- ✅ Leave requests requiring approval
- ✅ Compliance alerts
- ✅ Analytics alerts
- ❌ Individual task assignments

#### **Admin Defaults:**
- ✅ All system notifications
- ✅ Security alerts
- ✅ Critical business alerts
- ✅ Backup and maintenance updates

### Customization Options:
- **Frequency**: Immediate, Daily, Weekly, Off
- **Delivery Method**: In-app, Email (future), Mobile push (future)
- **Grouping Preference**: Individual, Grouped, Digest
- **Priority Threshold**: Only Critical, High+, All

## 🔗 Notification Relationships

### Related Entity Tracking:
- **Primary Entity**: The main subject (User, Project, Task, etc.)
- **Secondary Entity**: Related entity (Manager, Team, Skill, etc.)
- **Action Entity**: Who triggered the notification
- **Context Data**: Additional metadata for rich notifications

### Link Generation:
- Dynamic links based on notification type
- Deep links to specific views/forms
- Contextual actions (approve, reject, view details)

## 📈 Success Metrics

### User Engagement:
- Notification read rates by type
- Action completion rates from notifications
- User preference customization rates
- Notification search and filter usage

### System Performance:
- Notification delivery speed
- Database query performance
- Notification processing throughput
- Storage efficiency

### Business Impact:
- Reduced approval times
- Improved task completion rates
- Better skill verification compliance
- Enhanced project visibility

---

*This design will be implemented incrementally, starting with core notification types and expanding to cover all domains.*