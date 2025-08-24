/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as allocations from "../allocations.js";
import type * as cvCache from "../cvCache.js";
import type * as files from "../files.js";
import type * as notifications from "../notifications.js";
import type * as projects from "../projects.js";
import type * as resourceRequests from "../resourceRequests.js";
import type * as skills from "../skills.js";
import type * as tasks from "../tasks.js";
import type * as userSkills from "../userSkills.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  allocations: typeof allocations;
  cvCache: typeof cvCache;
  files: typeof files;
  notifications: typeof notifications;
  projects: typeof projects;
  resourceRequests: typeof resourceRequests;
  skills: typeof skills;
  tasks: typeof tasks;
  userSkills: typeof userSkills;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
