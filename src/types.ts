/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "employee" | "admin";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  country: string;
  department: string;
  employeeId: string;
  phoneNumber: string;
  joiningDate: string; // ISO String format
  designation: string;
  profileImage?: string;
}

export type ResignationStatus = "pending" | "approved" | "rejected";

export interface Resignation {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  reason: string;
  detailedDescription: string;
  lastWorkingDate: string; // YYYY-MM-DD
  managerName: string;
  comments?: string;
  noticePeriod: number; // in days
  attachmentUrl?: string;
  status: ResignationStatus;
  remarks?: string; // HR rejection/approval feedback
  finalLastWorkingDate?: string; // YYYY-MM-DD (HR modified or original)
  createdAt: string;
  updatedAt: string;
}

export interface ExitResponse {
  id: string;
  resignationId: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  whyLeaving: string;
  whatLiked: string;
  whatDisliked: string;
  recommendCompany: "yes" | "no" | "maybe";
  suggestions: string;
  overallRating: number; // 1 to 5
  additionalFeedback?: string;
  isSubmitted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ResignationState {
  resignations: Resignation[];
  activeResignation: Resignation | null;
  isLoading: boolean;
  error: string | null;
}

export interface ExitResponseState {
  exitResponses: ExitResponse[];
  activeResponse: ExitResponse | null;
  isLoading: boolean;
  error: string | null;
}
