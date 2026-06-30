/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_Skills_registry from "../ai/Skills/registry.js";
import type * as ai_chatAssistant from "../ai/chatAssistant.js";
import type * as ai_extractResume from "../ai/extractResume.js";
import type * as ai_outreach from "../ai/outreach.js";
import type * as ai_processJob from "../ai/processJob.js";
import type * as ai_tailorResume from "../ai/tailorResume.js";
import type * as ai_testNvidia from "../ai/testNvidia.js";
import type * as chat from "../chat.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as docx from "../docx.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_piiMask from "../lib/piiMask.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_uploadValidation from "../lib/uploadValidation.js";
import type * as onboarding from "../onboarding.js";
import type * as profiles from "../profiles.js";
import type * as resumes from "../resumes.js";
import type * as seeding from "../seeding.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/Skills/registry": typeof ai_Skills_registry;
  "ai/chatAssistant": typeof ai_chatAssistant;
  "ai/extractResume": typeof ai_extractResume;
  "ai/outreach": typeof ai_outreach;
  "ai/processJob": typeof ai_processJob;
  "ai/tailorResume": typeof ai_tailorResume;
  "ai/testNvidia": typeof ai_testNvidia;
  chat: typeof chat;
  crons: typeof crons;
  dashboard: typeof dashboard;
  docx: typeof docx;
  http: typeof http;
  jobs: typeof jobs;
  "lib/auth": typeof lib_auth;
  "lib/piiMask": typeof lib_piiMask;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/uploadValidation": typeof lib_uploadValidation;
  onboarding: typeof onboarding;
  profiles: typeof profiles;
  resumes: typeof resumes;
  seeding: typeof seeding;
  users: typeof users;
  webhooks: typeof webhooks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
