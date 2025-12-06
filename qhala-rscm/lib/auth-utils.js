// lib/auth-utils.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

/**
 * Get the authenticated user's email from the session
 * @returns {Promise<string|null>} The user's email or null if not authenticated
 */
export async function getAuthenticatedEmail() {
  const session = await getServerSession(authOptions);
  return session?.user?.email || null;
}

/**
 * Get the full authenticated user from the session
 * @returns {Promise<object|null>} The user object or null if not authenticated
 */
export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

/**
 * Standard unauthorized response
 * @returns {NextResponse} 401 Unauthorized response
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: "Unauthorized" }, 
    { status: 401 }
  );
}

/**
 * Standard error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 500)
 * @param {string} code - Error code for frontend
 * @param {string} field - Field that caused validation error
 * @returns {NextResponse} Error response
 */
export function errorResponse(message, status = 500, code = "INTERNAL_ERROR", field = null) {
  const response = { success: false, error: message, code };
  if (field) response.field = field;
  return NextResponse.json(response, { status });
}

/**
 * Standard success response
 * @param {any} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 * @returns {NextResponse} Success response
 */
export function successResponse(data, status = 200) {
  return NextResponse.json(
    { success: true, ...data }, 
    { status }
  );
}