export const ROLES = {
  ADMIN: "admin",
  HR: "hr",
  PM: "pm",
  LINE_MANAGER: "line_manager",
  EMPLOYEE: "employee",
};

export const PERMISSIONS = {
  USERS: {
    CREATE: ["admin", "hr"],
    UPDATE_PROFILE: ["admin", "hr"],
    VIEW_ALL: ["admin", "hr", "pm", "line_manager"],
    VIEW_BASIC: ["admin", "hr", "pm", "line_manager", "employee"],
    VIEW_SELF: ["admin", "hr", "pm", "line_manager", "employee"],
    UPDATE_STATUS: ["admin", "hr", "line_manager", "employee"],
    DELETE: ["admin", "hr"],
  },
  EVENTS: {
    CREATE_OWN: ["admin", "hr", "pm", "line_manager", "employee"],
    UPDATE_OWN: ["admin", "hr", "pm", "line_manager", "employee"],
    DELETE_OWN: ["admin", "hr", "pm", "line_manager", "employee"],
    VIEW_OWN: ["admin", "hr", "pm", "line_manager", "employee"],
    VIEW_TEAM: ["admin", "hr", "line_manager"],
    APPROVE: ["admin", "hr", "line_manager"],
  },
  PROJECTS: {
    CREATE: ["admin", "hr", "pm"],
    UPDATE: ["admin", "hr", "pm"],
    UPDATE_OWN: ["pm"],
    DELETE: ["admin", "hr"],
    VIEW_ALL: ["admin", "hr", "pm", "line_manager", "employee"],
  },
  ALLOCATIONS: {
    CREATE: ["admin", "hr"],
    UPDATE: ["admin", "hr"],
    DELETE: ["admin", "hr"],
    VIEW_ALL: ["admin", "hr", "pm", "line_manager"],
    VIEW_OWN: ["admin", "hr", "pm", "line_manager", "employee"],
  },
  SKILLS: {
    CREATE: ["admin", "hr"],
    UPDATE_OWN: ["admin", "hr", "pm", "line_manager", "employee"],
    UPDATE_OTHERS: ["admin", "hr"],
    VERIFY: ["admin", "hr", "line_manager"],
    DELETE: ["admin", "hr"],
    VIEW_ALL: ["admin", "hr", "pm", "line_manager"],
  },
  WORK_REQUESTS: {
    CREATE_OWN: ["admin", "hr", "pm", "line_manager", "employee"],
    APPROVE: ["admin", "hr", "line_manager"],
    VIEW_ALL: ["admin", "hr", "pm", "line_manager"],
    VIEW_OWN: ["admin", "hr", "pm", "line_manager", "employee"],
    DELETE_OWN: ["admin", "hr", "pm", "line_manager", "employee"],
  },
  RESOURCE_REQUESTS: {
    CREATE: ["pm"],
    APPROVE: ["admin", "hr"],
    VIEW_ALL: ["admin", "hr", "pm"],
    VIEW_OWN: ["pm"],
  },
  NOTIFICATIONS: {
    VIEW_OWN: ["admin", "hr", "pm", "line_manager", "employee"],
    MARK_READ: ["admin", "hr", "pm", "line_manager", "employee"],
    DELETE: ["admin", "hr", "pm", "line_manager", "employee"],
  },
  TASKS: {
    CREATE: ["admin", "hr", "pm"],
    UPDATE: ["admin", "hr", "pm"],
    UPDATE_OWN: ["admin", "hr", "pm", "employee"],
    DELETE: ["admin", "hr", "pm"],
    VIEW_ALL: ["admin", "hr", "pm", "line_manager"],
  },
};

export function checkPermission(userRole, permission) {
  return permission.includes(userRole);
}

export function requirePermission(userRole, permission) {
  if (!checkPermission(userRole, permission)) {
    throw new Error("You don't have permission to perform this action.");
  }
}

export function canViewUser(actor, targetUserId) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  if (["admin", "hr"].includes(actor.role)) return true;
  if (actor._id === targetUserId) return true;
  if (actor.role === "line_manager") {
    return true;
  }
  
  return false;
}

export function canEditUser(actor, targetUserId) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  if (["admin", "hr"].includes(actor.role)) return true;
  
  return false;
}

export function canViewProject(actor, project) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  if (["admin", "hr", "pm"].includes(actor.role)) return true;
  if (actor.role === "line_manager") return true;
  if (actor.role === "employee") return true;
  
  return false;
}

export function canEditProject(actor, project) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  if (["admin", "hr"].includes(actor.role)) return true;
  if (actor.role === "pm" && project.pmId === actor._id) return true;
  
  return false;
}

export function canManageAllocation(actor) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  return ["admin", "hr"].includes(actor.role);
}

export function canViewAllocations(actor) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  return ["admin", "hr", "pm", "line_manager", "employee"].includes(actor.role);
}

export function canManageSkill(actor, targetUserId) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  if (["admin", "hr"].includes(actor.role)) return true;
  if (actor._id === targetUserId) return true;
  
  return false;
}

export function canApproveWorkRequest(actor) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  return ["admin", "hr", "line_manager"].includes(actor.role);
}

export function canApproveResourceRequest(actor) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  return ["admin", "hr"].includes(actor.role);
}

export function canCreateTask(actor) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  return ["admin", "hr", "pm"].includes(actor.role);
}

export function canCreateEvent(actor) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  return checkPermission(actor.role, PERMISSIONS.EVENTS.CREATE_OWN);
}

export function canUpdateEvent(actor, eventOwnerId) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  if (actor._id === eventOwnerId) return true;
  return ["admin", "hr"].includes(actor.role);
}

export function canDeleteEvent(actor, eventOwnerId) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  if (actor._id === eventOwnerId) return true;
  return ["admin", "hr"].includes(actor.role);
}

export function canViewEvent(actor, eventOwnerId) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  if (actor._id === eventOwnerId) return true;
  return ["admin", "hr"].includes(actor.role);
}

export function canApproveEvent(actor) {
  if (!actor) throw new Error("Unauthorized: missing actor");
  
  return checkPermission(actor.role, PERMISSIONS.EVENTS.APPROVE);
}
