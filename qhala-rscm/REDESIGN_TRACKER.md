# RSCM Complete Redesign & Rebrand Tracker

**Started:** November 8, 2025  
**Design Direction:** Intercom-inspired (clean, professional, modern SaaS)  
**Color Palette:** Dutch White (#EEE1CE / #E0E1CE), Lilac (#C398B5), Plum (#824C71), Violet (#4A2545), Dark Purple (#251323), Black (#000001)

---

## 🎨 Design System

### ✅ Completed
- [x] Logo assets added (RSCM-full.png, RSCM.png)
- [x] Color palette defined (added Lilac color)
- [x] Design direction established
- [x] Created new design system in globals.css
- [x] Removed dark mode completely
- [x] Updated tailwind.config.mjs with new colors
- [x] Defined typography system (sans-serif primary, monospace for code only)
- [x] Added Tailwind v4 @theme block for custom colors

### 🔄 In Progress
- [ ] Create component library documentation

---

## 🖼️ Brand Assets & Identity

### ✅ Completed
- [x] New logo created (network/nodes design)
- [x] Logo assets saved to /assets

### 🔄 To Do
- [ ] Create SVG versions with transparent backgrounds
- [ ] Generate favicon from logo
- [ ] Create logo variations (white version for dark backgrounds)
- [ ] Update all "Qhala" text references to "RSCM"
- [ ] Update meta tags and SEO information
- [ ] Update page titles

---

## 📄 Pages & Routes

### 🔴 Not Started

#### Public Pages
- [x] **Landing Page** (`app/page.jsx`)
  - [x] Complete redesign with new branding
  - [x] No Qhala references (clean start)
  - [x] Hero section with RSCM logo (top-left, larger size)
  - [x] New color scheme applied
  - [x] Dot grid background with character
  - [x] Geometric shapes grid (3x3) based on Design Academy reference
  - [x] Two feature cards with icons
  - [x] Responsive layout with proper spacing
  - [ ] **Polish needed:** Shape sizes, colors, positioning refinement

- [ ] **Login/Auth Pages**
  - [ ] Redesign sign-in experience
  - [ ] Split-screen or centered card layout
  - [ ] Background with personality (gradients/patterns)
  - [ ] Update Google sign-in button styling

#### Authenticated Pages
- [x] **Dashboard** (`app/(main)/dashboard/page.jsx`) - ✅ COMPLETED
  - [x] Main dashboard layout (uses AppLayout wrapper)
  - [x] Employee dashboard component (EmployeeDashboardNew.jsx)
  - [x] Line Manager dashboard component (LineManagerDashboardNew.jsx)
  - [x] PM dashboard component (PMDashboardNew.jsx)
  - [x] HR/Admin dashboard component (AdminDashboard.jsx)
  - [x] All RSCM brand colors applied
  - [x] Greeting cards with geometric shapes and avatars
  - [x] Role-based metrics and quick actions
  - [x] Integrated with custom hooks (useDashboard, useEnhancedNotifications)

- [ ] **Approvals Page** (`app/(main)/approvals/page.jsx`)
  - [ ] Update tab styling
  - [ ] Modernize card designs
  - [ ] Update button variants
  - [ ] Consistent with new design system

- [x] **Projects** (`app/(main)/projects/*`) - ✅ COMPLETED
  - [x] Project list view (ProjectsListNew.jsx)
  - [x] Project detail view (ProjectDetailPageNew.jsx)
  - [x] Project creation form with 3-step wizard (ProjectFormNew.jsx)
  - [x] Task management component (TaskManagerNew.jsx)
  - [x] Quick Ask AI skill search component (quick-ask.jsx)
  - [x] Skill selector component
  - [x] Double-click confirmation for project creation
  - [x] All components follow compact Intercom design patterns
  - [x] DatePicker integration for all date fields
  - [x] End-to-end CRUD operations with validations

- [ ] **Resources** (`app/(main)/resources/*`)
  - [ ] Resource allocation views
  - [ ] Capacity planning interfaces
  - [ ] Update visualizations

- [x] **Profile** (`app/(main)/profile/*`) - ✅ COMPLETED
  - [x] Profile view page (ProfilePageNew.jsx)
  - [x] Profile header with avatar, capacity, leave balance
  - [x] Skills section with current/desired skills and pending verifications
  - [x] Projects & employment details cards
  - [x] Line manager card
  - [x] Work requests history
  - [x] All modals (Leave, Overtime, Skills Editor, Employment Details)
  - [x] CV upload onboarding flow
  - [x] Skills verification workflow with proof requirements
  - [x] Scrollspy navigation integration with sidebar
  - [x] Smooth animations and transitions

- [ ] **Notifications** (`app/(main)/notifications/*`)
  - [ ] Notification center page
  - [ ] Update dropdown styling (already modern, but needs color update)

- [ ] **Admin Pages** (`app/admin/*`)
  - [ ] Admin dashboard
  - [ ] User management
  - [ ] Skills management
  - [ ] System settings
  - [ ] Analytics & reports

---

## 🧩 Components

### Layout Components (NEW)
- [x] **AppLayout** (`components/layout/AppLayout.jsx`) - ✅ COMPLETED
  - [x] Intercom-style layout structure
  - [x] Gray dot grid background pattern
  - [x] Unified surface design (no borders)
  - [x] Notification banner integration
  - [x] Flexible content area
  
- [x] **AppSidebar** (`components/layout/AppSidebar.jsx`) - ✅ COMPLETED
  - [x] Collapsed icon bar (56px width)
  - [x] Expandable context panels (white cards)
  - [x] RSCM logo at top
  - [x] Perfect icon centering (w-10 h-10 containers)
  - [x] Active state styling (violet background)
  - [x] Smooth animations (200ms transitions)
  - [x] Profile/Settings/Logout at bottom
  - [x] Role-based navigation filtering
  - [x] Role-based quick actions in expandable panels
  - [x] Removed notifications icon (moved to banner)
  
- [x] **NotificationRotator** (`components/layout/NotificationRotator.jsx`) - ✅ COMPLETED
  - [x] Card-style design with lilac tint
  - [x] Icon + message + button layout
  - [x] Auto-rotation every 8 seconds (increased from 5)
  - [x] Smooth ease-in-out animations (300ms)
  - [x] "View all" button navigates to /notifications
  - [x] RSCM color scheme
  - [x] Integrated with useEnhancedNotifications hook

### Navigation Components (OLD - DEPRECATED)
- [x] **Sidebar** (`components/navigation/Sidebar.jsx`) - DEPRECATED, replaced by AppSidebar
- [x] **AdminSidebar** (`components/navigation/AdminSidebar.jsx`) - DEPRECATED, replaced by AppSidebar
- [x] **app/(main)/layout.jsx** - ✅ SIMPLIFIED (now just handles auth)
- [ ] **Footer** (`components/navigation/Footer.jsx`) - Keep for landing page only

### Dashboard Components
- [x] **AdminDashboard.jsx** - ✅ COMPLETED (NEW)
  - [x] Greeting card with avatar and geometric shapes
  - [x] Organization overview stats (4 metrics)
  - [x] Pending approvals section
  - [x] Recent activity feed
  - [x] Quick actions section
  - [x] Uses useDashboard hook for data
  - [x] Fetches pending resource requests via useQuery

- [x] **PMDashboardNew.jsx** - ✅ COMPLETED (NEW)
  - [x] Greeting card with avatar
  - [x] PM-specific metrics (managed projects, team members, utilization)
  - [x] My resource requests section
  - [x] Recent activity from projects
  - [x] PM-specific quick actions
  - [x] Fixed permissions issue with requestedByPmId

- [x] **LineManagerDashboardNew.jsx** - ✅ COMPLETED (NEW)
  - [x] Greeting card with avatar
  - [x] Team management metrics (direct reports, verifications, approvals)
  - [x] Your team section
  - [x] Recent activity from team
  - [x] Line manager quick actions

- [x] **EmployeeDashboardNew.jsx** - ✅ COMPLETED (NEW)
  - [x] Greeting card with avatar
  - [x] Employee metrics (capacity, hours, projects, skills)
  - [x] My projects section
  - [x] Recent activity
  - [x] Employee quick actions

- [x] **main-dashboard.jsx** - ✅ UPDATED
  - [x] Routes to role-specific dashboards
  - [x] All dashboards wrapped in AppLayout
  - [x] Uses useAuth hook for complete user data

- [ ] **dashboard-components.jsx** - OLD (may deprecate)
  - [ ] MetricTile, ActivityFeed, etc. (old components)

### Common/UI Components
- [ ] **Button** (`components/ui/button.jsx`)
  - [ ] Primary button (Violet)
  - [ ] Secondary button (Plum)
  - [ ] Destructive button
  - [ ] Outline variants
  - [ ] Update all color references

- [ ] **Card** (`components/common/Card.jsx`)
  - [ ] Update default styling
  - [ ] Shadow adjustments
  - [ ] Border colors
  - [ ] Background colors

- [ ] **Badge** (`components/ui/badge.jsx`)
  - [ ] Update color variants
  - [ ] Status colors

- [ ] **Tabs** (`components/ui/tabs.jsx`)
  - [ ] Update active states
  - [ ] Color scheme

- [ ] **Select, Dropdown, Popover** - Update to new design system
- [ ] **Dialog/Modal** - Update overlay and card styling
- [ ] **LoadingSpinner** - Update colors
- [ ] **Avatar** - Ensure consistency

### Feature-Specific Components
- [ ] **Approvals Components** (`components/approvals/*`)
  - [x] WorkRequestsTab.jsx (update colors)
  - [x] ResourceRequestsTab.jsx (update colors)
  - [x] SkillVerificationsTab.jsx (update colors)

- [x] **Profile Components** (`components/profile/*`) - ✅ COMPLETED
  - [x] ProfilePageNew.jsx - Main profile layout with scrollspy
  - [x] ProfileHeaderNew.jsx - Avatar, capacity, leave balance stats
  - [x] SkillsSectionNew.jsx - Current/desired skills with pending verifications
  - [x] ProjectsEmploymentSectionNew.jsx - Projects and employment cards
  - [x] LineManagerCardNew.jsx - Line manager info
  - [x] WorkRequestsSectionNew.jsx - Request history
  - [x] LeaveRequestModal.jsx - Annual leave requests
  - [x] OvertimeRequestModal.jsx - Overtime logging
  - [x] SkillsEditorModal.jsx - Skills management with CV upload
  - [x] EmploymentDetailsModal.jsx - Employment details editing

- [ ] **Admin Components** (`components/admin/*`)
  - [ ] UserForm.jsx
  - [ ] PendingRequests.jsx
  - [ ] UserCreationForm.jsx
  - [ ] SkillForm.jsx
  - [ ] AllocationForm.jsx
  - [ ] CVUploader.jsx
  - [ ] CachedCVs.jsx

- [x] **Project Components** (`components/projects/*`) - ✅ COMPLETED
  - [x] ProjectFormNew.jsx - 3-step wizard (Details → Skills → Tasks)
  - [x] ProjectsListNew.jsx - Grid/list view with filters
  - [x] ProjectDetailPageNew.jsx - Tabbed detail view
  - [x] TaskManagerNew.jsx - Kanban board with compact design
  - [x] QuickAsk.jsx - AI-powered skill search
  - [x] SkillSelector.jsx - Already updated
  - [x] ProjectFilters.jsx - Search and filter controls
  - [x] RecommendedUserCardNew.jsx - AI recommendation cards
  - [x] All buttons have proper `type="button"` to prevent form issues
  - [x] Compact Intercom design patterns applied throughout

- [ ] **User Components** (`components/user/*`)
  - [ ] Profile components
  - [ ] Skill components

- [ ] **Notification Components** (`components/notifications/*`)
  - [ ] EnhancedNotificationDropdown.jsx
  - [ ] NotificationFilters.jsx
  - [ ] NotificationStats.jsx
  - [ ] Update colors only (structure is good)

---

## 🎨 Styling Files

### Core Styles
- [x] **globals.css** - Complete rewrite
  - [x] Removed all Qhala color variables
  - [x] Added new RSCM color variables (RGB format for CSS vars)
  - [x] Removed dark mode styles
  - [x] Updated typography (sans-serif primary, monospace for code only)
  - [x] Updated focus states
  - [x] Updated scrollbar styling
  - [x] Added Tailwind v4 @theme block with --color-* variables

- [x] **tailwind.config.mjs**
  - [x] Updated with RSCM color references
  - [x] Border radius maintained
  - [x] Dark mode config still present (for future reference, not used)

- [x] **app/layout.jsx** - ✅ UPDATED
  - [x] Removed unnecessary imports (react-toastify CSS, react-datepicker CSS)
  - [x] Customized Sonner toaster with RSCM brand colors
  - [x] Toast styling: Success (violet), Error (plum), Info (lilac), Warning (plum)
  - [x] Added custom toast CSS classes in globals.css

### Component-Specific Styles
- [ ] Audit all inline Tailwind classes for old color references
- [ ] Update RGB color variables usage
- [ ] Replace gradient references

---

## 📱 Responsive Design

- [ ] **Mobile Navigation** - Ensure hamburger menu works with new design
- [ ] **Tablet Layout** - Test all pages on tablet sizes
- [ ] **Desktop Layout** - Ensure proper spacing and layout
- [ ] **Touch Targets** - Verify button sizes for mobile

---

## 🔍 Text & Content Updates

### Brand Name Changes
- [ ] Search and replace all "Qhala" → "RSCM"
- [ ] Update metadata titles
- [ ] Update page headers
- [ ] Update footer text
- [ ] Update any hardcoded brand references

### Files to Update (Grep Results)
- [ ] `app/page.jsx`
- [ ] `app/layout.jsx`
- [ ] `components/navigation/Footer.jsx`
- [ ] `components/navigation/Sidebar.jsx`
- [ ] `components/navigation/AdminSidebar.jsx`
- [ ] `app/admin/page.jsx`
- [ ] `components/dashboard/PMDashboard.jsx`
- [ ] `components/dashboard/HRAdminDashboard.jsx`
- [ ] `components/dashboard/EmployeeDashboard.jsx`
- [ ] `convex/schema.js` (function field references)
- [ ] `package.json` (project name)
- [ ] `MIGRATION_REPORT.md` (references only)

---

## 🗄️ Schema & Data

- [ ] **Convex Schema** (`convex/schema.js`)
  - [ ] Review "function" field (q-trust, q-lab, consultants, qhala)
  - [ ] Decide if these need updating or are data-driven

---

## ✅ Testing Checklist

### Visual Testing
- [ ] Test all pages in light mode
- [ ] Verify color contrast (WCAG AA compliance)
- [ ] Check logo visibility on all backgrounds
- [ ] Verify all buttons have correct colors
- [ ] Check all cards and borders
- [ ] Verify loading states
- [ ] Check empty states
- [ ] Test error states

### Functional Testing
- [ ] Login/authentication flow
- [ ] Navigation between pages
- [ ] Dashboard data loading
- [ ] Approvals workflow
- [ ] Form submissions
- [ ] Notifications
- [ ] User profile updates
- [ ] Admin functions

### Cross-Browser Testing
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

---

## 📦 Deployment Preparation

- [ ] Update favicon files
- [ ] Update manifest.json (if exists)
- [ ] Update meta tags for social sharing
- [ ] Test build (`npm run build`)
- [ ] Check for console errors
- [ ] Verify no broken images
- [ ] Check all links work

---

## 📊 Progress Summary

**Total Tasks:** ~100+  
**Completed:** ~70  
**In Progress:** Feature pages (Resources, Approvals, Admin)  
**Not Started:** ~30  

**Estimated Time:** 2-3 full sessions (Session 2 Complete, Session 3 In Progress)

---

## 🎯 Session Goals

### Session 1 (Nov 8-9) - Foundation ✅
1. ✅ Design system planning
2. ✅ Logo assets
3. ✅ Create new globals.css
4. ✅ Update tailwind.config (Tailwind v4 compatible)
5. ✅ Redesign landing page (needs polish)
6. ⏳ Update core components (Button, Card, Badge) - NEXT

### Session 2 (Nov 9) - Core Pages ✅ 90% COMPLETE
1. ✅ Dashboard redesigns (all 4 roles complete)
2. ✅ Navigation components (AppLayout, AppSidebar, NotificationRotator)
3. ✅ Layout system (removed old layouts)
4. ✅ Toast notifications with RSCM colors
5. ✅ Avatar display with Google profile pictures
6. ✅ Role-based sidebar actions
7. ✅ Profile page complete redesign
8. ✅ Profile modals (Leave, Overtime, Skills, Employment)
9. ✅ Skills verification workflow with proof requirements
10. ✅ CV upload onboarding flow
11. ⏳ Common UI components (Button, Card, Badge) - NEXT
12. ⏳ Approvals page updates - NEXT

### Session 3 (Nov 10) - Feature Pages & Polish ⏳ IN PROGRESS
1. ✅ Projects pages (complete redesign)
2. ⏳ Resources pages - NEXT
3. ⏳ Approvals page updates - NEXT
4. ⏳ Admin pages
5. ⏳ Common UI components (Button, Card, Badge)
6. ⏳ Testing and refinement
7. ⏳ Final brand updates

---

---

## 📝 Design Notes

### Landing Page Design (Nov 9, 2025)
- Based on Design Academy reference screenshot
- Layout: 2-column grid (content left, shapes right)
- Shapes: 3x3 grid with gap-0 (touching)
  - **Left column:** Dutch white square (left rounded), white square (thick violet border), black square (3 corners rounded)
  - **Middle column:** Lilac diamond (rotated), violet circle, violet triangle (border only)
  - **Right column:** Three violet/black quarter-circles with 85% border radius
- Typography: Resource & Skill in violet, Capacity Management split violet/dark-purple
- Nav spacing: Minimal with -mt-8 on main content
- Using Tailwind v4 @theme block for color definitions

### Technical Notes
- Using Tailwind CSS v4 with `@tailwindcss/postcss`
- Colors defined in both CSS variables (--rscm-*) and @theme block (--color-rscm-*)
- Inline styles used for complex border-radius (geometric shapes)
- SVG used for triangle shape to achieve border-only effect

---

---

## 🎨 Design Pattern & System

### Core Design Principles

**Inspiration:** Intercom SaaS design - clean, professional, minimal

**Key Characteristics:**
1. **No Borders** - Visual separation through background color differences
2. **Card-Based Content** - White cards float on gray dot-grid background
3. **Unified Surface** - Sidebar and main area share same base color
4. **Minimal Chrome** - Clean, distraction-free interface
5. **Subtle Shadows** - Light shadows for depth, not heavy borders
6. **Smooth Animations** - 200ms transitions for all interactions

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ [Gray Dot Grid Background - bg-gray-100]                │
│ ┌──┬────────────────────────────────────────────────┐   │
│ │▓▓│ [Notification Banner - lilac card]            │   │
│ │▓▓├────────────────────────────────────────────────┤   │
│ │▓▓│                                                │   │
│ │I │  ┌──────────────────────────────────────┐     │   │
│ │C │  │ [White Card - Main Content]          │     │   │
│ │O │  │                                      │     │   │
│ │N │  │  Page content goes here              │     │   │
│ │S │  │                                      │     │   │
│ │  │  └──────────────────────────────────────┘     │   │
│ └──┴────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Color Usage Guidelines

**Background Hierarchy:**
- **Base:** `bg-gray-100` with dot grid pattern (main layout surface)
- **Cards:** `bg-white` with `rounded-lg` and subtle `shadow-sm`
- **Sidebar:** Transparent, inherits gray background
- **Highlights:** `bg-rscm-lilac/10` for notification banner

**Text Hierarchy:**
- **Primary Text:** `text-rscm-dark-purple` (headings, body)
- **Secondary Text:** `text-gray-600` or `text-rscm-dark-purple/70` (supporting)
- **Links/Actions:** `text-rscm-violet` with `hover:text-rscm-plum`

**Interactive States:**
- **Active/Selected:** `bg-rscm-violet text-white`
- **Hover:** `bg-white/50` (on gray) or `bg-gray-100` (on white)
- **Focus:** Maintain accessibility with proper focus rings

**Accent Colors:**
- **Primary Actions:** `bg-rscm-violet` buttons
- **Secondary Actions:** `bg-rscm-plum` or outlined
- **Success:** Green tones (to be defined as needed)
- **Warning:** Orange/amber tones (to be defined)
- **Error:** Red tones (to be defined)

### Component Patterns

**Cards:**
```jsx
<div className="bg-white rounded-lg shadow-sm p-6">
  {/* Content */}
</div>
```

**Section Headers:**
```jsx
<h2 className="text-2xl font-bold text-rscm-violet mb-4">
  Section Title
</h2>
```

**Buttons:**
- Primary: `bg-rscm-violet text-white hover:bg-rscm-plum`
- Secondary: `border border-rscm-violet text-rscm-violet hover:bg-rscm-violet hover:text-white`
- Ghost: `text-rscm-violet hover:bg-rscm-lilac/10`

**Lists/Tables:**
- Row hover: `hover:bg-gray-50`
- Alternating rows: Optional, prefer clean white
- Headers: `text-sm font-medium text-rscm-dark-purple`

### Spacing System

**Standard Spacing Scale (Tailwind):**
- **Tight:** `gap-1` (4px), `gap-2` (8px)
- **Normal:** `gap-4` (16px), `gap-6` (24px)  
- **Loose:** `gap-8` (32px), `gap-12` (48px)

**Page Padding:**
- Main content: `px-4` (mobile), `px-6` (desktop)
- Cards: `p-4` to `p-6` depending on content density

**Sidebar:**
- Icon bar width: `w-14` (56px)
- Icon containers: `w-10 h-10` (40px) - perfect centering
- Gap between icons: `gap-0.5` (2px) - tight spacing
- Expanded panel: `w-60` (240px) with `my-3 ml-1`

### Typography

**Font Stack:**
- **Primary:** System sans-serif (`-apple-system, BlinkMacSystemFont, Segoe UI...`)
- **Monospace:** Only for code/technical content
- **Display:** Same as primary, no special display font

**Size Scale:**
- **Hero/Page Title:** `text-3xl` to `text-4xl` (30-36px)
- **Section Headers:** `text-2xl` (24px)
- **Subsections:** `text-xl` (20px)
- **Body:** `text-base` (16px)
- **Small:** `text-sm` (14px)
- **Tiny:** `text-xs` (12px)

**Weight Scale:**
- **Black:** `font-black` (900) - Rare, only for emphasis
- **Bold:** `font-bold` (700) - Headers, labels
- **Semibold:** `font-semibold` (600) - Subheadings
- **Medium:** `font-medium` (500) - Body emphasis
- **Normal:** `font-normal` (400) - Body text

### Animation Guidelines

**Standard Duration:** `duration-200` (200ms)

**Transition Properties:**
- `transition-all` for multi-property changes
- `transition-colors` for color-only changes
- `transition-transform` for movement/scale

**Animations:**
- Fade in: `animate-in fade-in`
- Slide in: `slide-in-from-left`, `slide-in-from-top`
- Always use `duration-200` or `duration-300` max

### Accessibility

**Required:**
- Proper color contrast (WCAG AA minimum)
- Focus states on all interactive elements
- Semantic HTML (headings, landmarks, etc.)
- ARIA labels where needed
- Keyboard navigation support

**Icons:**
- Always include `title` attribute for icon-only buttons
- Use `aria-label` for screen readers
- Maintain 20px size for clickable icons

### Responsive Behavior

**Breakpoints:**
- **Mobile:** < 768px (sidebar hidden, hamburger menu)
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

**Mobile Considerations:**
- Sidebar becomes overlay with backdrop
- Reduce padding: `px-4` instead of `px-6`
- Stack cards vertically
- Touch-friendly targets (min 44px)

### File Organization

**New Structure:**
```
components/
  layout/          # AppLayout, AppSidebar, NotificationRotator
  ui/              # Shadcn components (Button, Card, etc.)
  dashboard/       # Dashboard-specific components
  projects/        # Project-specific components
  resources/       # Resource-specific components
  shared/          # Reusable components across features
```

**Naming Conventions:**
- PascalCase for component files
- Use descriptive names (NotificationRotator, not NotifBar)
- Suffix with purpose (Modal, Card, List, Form)

---

## 🧭 Navigation Strategy

### Sidebar Behavior Planning

**Context Panel Use Cases:**
The expandable sidebar panels should only be used for contextual navigation/filtering, not for direct page navigation.

**Direct Navigation (No Panel):**
- Dashboard - Goes directly to dashboard page
- Projects - Goes directly to projects list page  
- Resources - Goes directly to resources page
- Profile - Goes directly to user profile
- Settings/Admin - Goes directly to admin page

**Potential Panel Use Cases (Future):**
- Dashboard: Quick stats/widgets preview
- Projects: Filter by status, recent projects
- Resources: Filter by department, availability

**Current Implementation:**
- All nav items open context panels (placeholder content)
- Need to decide which items should navigate directly vs show panels
- Likely most items will be direct navigation with panels reserved for filtering/quick actions

**Next Steps:**
1. Define which nav items need panels vs direct navigation
2. Implement direct navigation for items that don't need panels
3. Design actual panel content for items that do need them
4. Consider adding keyboard shortcuts (optional)

---

## 🧪 QA Testing Checklist - Session 2

### Dashboard Testing (All Roles)
- [ ] **Admin/HR Dashboard**
  - [ ] Greeting card displays correctly with avatar
  - [ ] All 4 metrics display with correct data
  - [ ] Pending approvals section shows real data
  - [ ] Recent activity populates
  - [ ] Quick actions navigate correctly
  - [ ] Hover effects work on all interactive elements

- [ ] **PM Dashboard**
  - [ ] Greeting card with avatar
  - [ ] PM metrics (managed projects, team members, utilization, pending requests)
  - [ ] Resource requests section shows PM's requests
  - [ ] Recent activity from projects
  - [ ] Quick actions work (Create project, View all projects, Manage resources, Request resources)
  - [ ] No permission errors when fetching resource requests

- [ ] **Line Manager Dashboard**
  - [ ] Greeting card with avatar
  - [ ] Team metrics (direct reports, skill verifications, approvals needed, team size)
  - [ ] Your team section shows direct reports
  - [ ] Recent activity from team
  - [ ] Quick actions (Review approvals, View team, My profile, View projects)

- [ ] **Employee Dashboard**
  - [ ] Greeting card with avatar
  - [ ] Employee metrics (capacity, allocated hours, active projects, skills count)
  - [ ] My projects section
  - [ ] Recent activity
  - [ ] Quick actions (My profile, View projects, Manage skills, Notifications)

### Layout & Navigation Testing
- [ ] **AppLayout**
  - [ ] Dot grid background displays correctly
  - [ ] Layout responsive on different screen sizes
  - [ ] No layout shifts or jumps

- [ ] **AppSidebar**
  - [ ] RSCM logo displays at top
  - [ ] Correct navigation icons show based on role
  - [ ] Active state highlights current page
  - [ ] Expandable panels work smoothly
  - [ ] Quick actions filtered by role (no admin actions for employees)
  - [ ] Profile/Settings/Logout at bottom
  - [ ] Settings icon only shows for admin/hr

- [ ] **NotificationRotator**
  - [ ] Banner displays at top of layout
  - [ ] Notifications rotate every 8 seconds
  - [ ] Smooth ease-in-out transitions
  - [ ] "View all" button navigates to /notifications
  - [ ] Shows "All caught up!" when no unread notifications

### Cross-Role Testing
- [ ] Login as Admin → verify admin dashboard and sidebar actions
- [ ] Login as HR → verify admin dashboard and sidebar actions
- [ ] Login as PM → verify PM dashboard and sidebar actions
- [ ] Login as Line Manager → verify line manager dashboard and sidebar actions
- [ ] Login as Employee → verify employee dashboard and sidebar actions
- [ ] Verify no permission errors across all roles
- [ ] Session updates properly when switching roles (may need logout/login)

### Visual & UX Testing
- [ ] All RSCM brand colors used consistently
- [ ] Avatars display Google profile pictures correctly
- [ ] Geometric shapes on greeting cards render properly
- [ ] Hover effects smooth and consistent
- [ ] Toast notifications use RSCM colors (success=violet, error=plum, info=lilac)
- [ ] No old color schemes (blue, green, etc.) visible
- [ ] Typography consistent across all dashboards
- [ ] Spacing and padding consistent

### Data & Functionality Testing
- [ ] Dashboard metrics fetch real data from Convex
- [ ] Activities and recent items display correctly
- [ ] Quick action links navigate to correct pages
- [ ] Loading states show spinner and message
- [ ] Error states display properly
- [ ] Empty states show appropriate messages

### Performance Testing
- [ ] Dashboards load quickly (<2 seconds)
- [ ] No console errors
- [ ] No memory leaks with notification rotation
- [ ] Smooth animations (no jank)
- [ ] Images load efficiently (Next.js Image optimization)

---

**Last Updated:** November 9, 2025 - 16:10
