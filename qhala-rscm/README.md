//project structure.
stormchaser-resource-manager/
├── app/
│ ├── api/
│ │ ├── auth/
│ │ │ └── [...nextauth]/
│ │ │ └── route.js # NextAuth.js handler
│ │ ├── projects/ # API routes for projects
│ │ │ └── route.js # (Example: GET list, POST new)
│ │ ├── users/ # API routes for users/profiles
│ │ │ └── route.js
│ │ ├── skills/ # API routes for skills taxonomy
│ │ │ └── route.js
│ │ ├── allocations/ # API routes for allocations
│ │ │ └── route.js
│ │ └── recommendations/ # API routes for AI recommendations
│ │ └── [projectId]/
│ │ └── route.js # (Example: GET recommendations for a project)
│ │
│ ├── (auth)/ # Route group for auth pages (optional)
│ │ └── signin/
│ │ └── page.jsx # Custom sign-in page (if needed, otherwise NextAuth default)
│ │
│ ├── (main)/ # Route group for main authenticated app layout
│ │ ├── layout.jsx # Layout for authenticated users (includes Navbar, Sidebar?)
│ │ │
│ │ ├── dashboard/ # Main dashboard (might differ by role)
│ │ │ └── page.jsx
│ │ │
│ │ ├── profile/ # User's own profile page
│ │ │ └── page.jsx
│ │ │
│ │ ├── projects/ # Project section
│ │ │ ├── page.jsx # List of projects (viewable by all/most roles)
│ │ │ └── [projectId]/ # Dynamic route for specific project details
│ │ │ ├── page.jsx # Project detail view
│ │ │ └── allocate/ # Sub-route for allocating resources (PM/HR only?)
│ │ │ └── page.jsx
│ │ │
│ │ ├── resources/ # Resource management section (likely HR/PM focused)
│ │ │ ├── page.jsx # Overview/Search for resources
│ │ │ └── availability/ # Specific availability view?
│ │ │ └── page.jsx
│ │ │
│ │ └── admin/ # Admin section (HR only?)
│ │ ├── layout.jsx # Specific layout/auth check for admin routes
│ │ ├── page.jsx # Admin dashboard
│ │ ├── users/ # User management (HR)
│ │ │ └── page.jsx
│ │ └── skills/ # Skill taxonomy management (HR?)
│ │ └── page.jsx
│ │
│ ├── layout.jsx # Root layout (contains SessionProvider, basic HTML structure)
│ ├── page.jsx # Root page (often redirects or shows landing/login)
│ └── globals.css # Global styles
│ └── loading.jsx # Optional: Root loading UI
│ └── error.jsx # Optional: Root error UI
│
├── components/
│ ├── auth/
│ │ └── AuthProvider.jsx # Client component wrapper for SessionProvider
│ ├── common/ # General reusable components
│ │ ├── Button.jsx
│ │ ├── LoadingSpinner.jsx
│ │ └── Modal.jsx
│ ├── navigation/
│ │ ├── Navbar.jsx # Main navigation bar (uses useSession)
│ │ └── Sidebar.jsx # Optional sidebar navigation
│ ├── profile/
│ │ └── SkillSelector.jsx # Component for adding/editing skills
│ ├── projects/
│ │ ├── ProjectCard.jsx
│ │ ├── ProjectForm.jsx
│ │ └── AllocationTable.jsx
│ │ └── RecommendationList.jsx
│ ├── resources/
│ │ └── UserCard.jsx
│ │ └── AvailabilityCalendar.jsx # Example
│ └── ui/ # Base UI elements if not using a library like Shadcn
│ └── Card.jsx
│
├── lib/ # Utility functions, helpers, DB connection
│ ├── authOptions.js # Separate file for NextAuth configuration object
│ ├── db.js # Database connection logic (e.g., MongoDB/Mongoose)
│ └── utils.js # General utility functions
│
├── models/ # Mongoose Schemas / DB Models
│ ├── User.js
│ ├── Project.js
│ ├── Skill.js
│ ├── Allocation.js
│
├── public/ # Static assets (images, icons)
│ └── images/
│
├── .env.local # Environment variables (API keys, DB URI, NEXTAUTH_SECRET)
├── next.config.js # Next.js configuration
├── package.json
└── tailwind.config.js # Tailwind CSS configuration (if using)
