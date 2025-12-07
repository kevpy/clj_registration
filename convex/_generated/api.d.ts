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
import type * as ResendOTP from "../ResendOTP.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as events from "../events.js";
import type * as excelUpload from "../excelUpload.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as registrations from "../registrations.js";
import type * as reports from "../reports.js";
import type * as router from "../router.js";
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
  ResendOTP: typeof ResendOTP;
  analytics: typeof analytics;
  auth: typeof auth;
  events: typeof events;
  excelUpload: typeof excelUpload;
  helpers: typeof helpers;
  http: typeof http;
  registrations: typeof registrations;
  reports: typeof reports;
  router: typeof router;
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
