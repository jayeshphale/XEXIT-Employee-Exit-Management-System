import mongoose, { Schema, Document } from "mongoose";

// --- User Schema ---
export interface IUserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Opt in for local email/pass authentication
  role: "employee" | "admin";
  country: string;
  department: string;
  employeeId: string;
  phoneNumber: string;
  joiningDate: Date;
  designation: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["employee", "admin"], default: "employee" },
    country: { type: String, required: true, default: "US" },
    department: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true, index: true },
    phoneNumber: { type: String, required: true },
    joiningDate: { type: Date, required: true, default: Date.now },
    designation: { type: String, required: true },
    profileImage: { type: String },
  },
  { timestamps: true }
);

// --- Resignation Schema ---
export interface IResignationDocument extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  employeeEmail: string;
  reason: string;
  detailedDescription: string;
  lastWorkingDate: string; // YYYY-MM-DD
  managerName: string;
  comments?: string;
  noticePeriod: number;
  attachmentUrl?: string;
  status: "pending" | "approved" | "rejected";
  remarks?: string;
  finalLastWorkingDate?: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

const ResignationSchema = new Schema<IResignationDocument>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employeeName: { type: String, required: true },
    employeeEmail: { type: String, required: true },
    reason: { type: String, required: true },
    detailedDescription: { type: String, required: true },
    lastWorkingDate: { type: String, required: true },
    managerName: { type: String, required: true },
    comments: { type: String },
    noticePeriod: { type: Number, required: true, default: 30 },
    attachmentUrl: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    remarks: { type: String },
    finalLastWorkingDate: { type: String },
  },
  { timestamps: true }
);

// --- Exit Response Schema ---
export interface IExitResponseDocument extends Document {
  resignationId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  employeeEmail: string;
  whyLeaving: string;
  whatLiked: string;
  whatDisliked: string;
  recommendCompany: "yes" | "no" | "maybe";
  suggestions: string;
  overallRating: number;
  additionalFeedback?: string;
  isSubmitted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExitResponseSchema = new Schema<IExitResponseDocument>(
  {
    resignationId: { type: Schema.Types.ObjectId, ref: "Resignation", required: true, unique: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employeeName: { type: String, required: true },
    employeeEmail: { type: String, required: true },
    whyLeaving: { type: String, required: true },
    whatLiked: { type: String, required: true },
    whatDisliked: { type: String, required: true },
    recommendCompany: { type: String, enum: ["yes", "no", "maybe"], required: true },
    suggestions: { type: String, required: true },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    additionalFeedback: { type: String },
    isSubmitted: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

// Compile models (checking existing ones to handle multiple hot-reload/compilation instances)
export const UserModel: any = mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
export const ResignationModel: any = mongoose.models.Resignation || mongoose.model<IResignationDocument>("Resignation", ResignationSchema);
export const ExitResponseModel: any = mongoose.models.ExitResponse || mongoose.model<IExitResponseDocument>("ExitResponse", ExitResponseSchema);
