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
import type * as activities from "../activities.js";
import type * as allocations from "../allocations.js";
import type * as cvCache from "../cvCache.js";
import type * as events from "../events.js";
import type * as files from "../files.js";
import type * as notifications from "../notifications.js";
import type * as projectFeedback from "../projectFeedback.js";
import type * as projects from "../projects.js";
import type * as resourceRequests from "../resourceRequests.js";
import type * as skills from "../skills.js";
import type * as tasks from "../tasks.js";
import type * as userSkills from "../userSkills.js";
import type * as users from "../users.js";
import type * as workRequests from "../workRequests.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  allocations: typeof allocations;
  cvCache: typeof cvCache;
  events: typeof events;
  files: typeof files;
  notifications: typeof notifications;
  projectFeedback: typeof projectFeedback;
  projects: typeof projects;
  resourceRequests: typeof resourceRequests;
  skills: typeof skills;
  tasks: typeof tasks;
  userSkills: typeof userSkills;
  users: typeof users;
  workRequests: typeof workRequests;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
