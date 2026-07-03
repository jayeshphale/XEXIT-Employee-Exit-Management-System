import { isDBConnected } from "../config/db";
import { UserModel, ResignationModel, ExitResponseModel } from "../models";
import bcrypt from "bcryptjs";

// Types matching frontend requirements
import { User, Resignation, ExitResponse } from "../../src/types";

// Helper to hash password
const hashPasswordSync = (password: string) => {
  return bcrypt.hashSync(password, 10);
};

// --- Pre-seeded Demo Data for In-Memory Fallback ---
const mockUsers: any[] = [
  {
    id: "user-admin",
    firstName: "HR",
    lastName: "Admin",
    email: "admin@xexit.com",
    password: hashPasswordSync("password123"),
    role: "admin",
    country: "US",
    department: "Human Resources",
    employeeId: "HR001",
    phoneNumber: "+15550199",
    joiningDate: "2021-01-15T08:00:00.000Z",
    designation: "HR Administrator",
  },
  {
    id: "user-employee",
    firstName: "Alex",
    lastName: "Employee",
    email: "employee@xexit.com",
    password: hashPasswordSync("password123"),
    role: "employee",
    country: "IN",
    department: "Engineering",
    employeeId: "ENG124",
    phoneNumber: "+919876543210",
    joiningDate: "2022-06-01T09:00:00.000Z",
    designation: "Senior Software Engineer",
  },
  {
    id: "user-john",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@xexit.com",
    password: hashPasswordSync("password123"),
    role: "employee",
    country: "US",
    department: "Marketing",
    employeeId: "MKT042",
    phoneNumber: "+15554123",
    joiningDate: "2023-03-10T10:00:00.000Z",
    designation: "Marketing Specialist",
  },
  {
    id: "user-jane",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@xexit.com",
    password: hashPasswordSync("password123"),
    role: "employee",
    country: "US",
    department: "Product",
    employeeId: "PRD007",
    phoneNumber: "+15559876",
    joiningDate: "2022-09-15T09:30:00.000Z",
    designation: "Product Manager",
  }
];

const mockResignations: any[] = [
  {
    id: "res-john",
    employeeId: "user-john",
    employeeName: "John Doe",
    employeeEmail: "john.doe@xexit.com",
    reason: "Better opportunity",
    detailedDescription: "I have accepted a role at another company that aligns more closely with my long-term career goals in management.",
    lastWorkingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    managerName: "Sarah Peterson",
    comments: "Loved working with the marketing team!",
    noticePeriod: 30,
    status: "approved",
    remarks: "Approved as per team resource allocation.",
    finalLastWorkingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "res-jane",
    employeeId: "user-jane",
    employeeName: "Jane Smith",
    employeeEmail: "jane.smith@xexit.com",
    reason: "Career growth",
    detailedDescription: "Seeking a role that allows me to lead larger-scale initiatives and product strategy.",
    lastWorkingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    managerName: "Michael Chang",
    comments: "Request standard notice period override if possible.",
    noticePeriod: 45,
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const mockExitResponses: any[] = [
  {
    id: "exit-john",
    resignationId: "res-john",
    employeeId: "user-john",
    employeeName: "John Doe",
    employeeEmail: "john.doe@xexit.com",
    whyLeaving: "Accepted a higher-level role elsewhere offering career progression.",
    whatLiked: "Great team collaboration, flexible hours, supportive peers.",
    whatDisliked: "Lack of clear professional progression path and limited upward mobility.",
    recommendCompany: "yes",
    suggestions: "Establish more transparent internal promotion criteria.",
    overallRating: 4,
    additionalFeedback: "Thank you for the wonderful 3 years!",
    isSubmitted: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// --- Repository Helpers ---

// Transform mongoose doc to user type
function formatUser(userDoc: any): User {
  return {
    id: userDoc._id ? userDoc._id.toString() : userDoc.id,
    firstName: userDoc.firstName,
    lastName: userDoc.lastName,
    email: userDoc.email,
    role: userDoc.role,
    country: userDoc.country,
    department: userDoc.department,
    employeeId: userDoc.employeeId,
    phoneNumber: userDoc.phoneNumber,
    joiningDate: userDoc.joiningDate instanceof Date ? userDoc.joiningDate.toISOString() : userDoc.joiningDate,
    designation: userDoc.designation,
    profileImage: userDoc.profileImage,
  };
}

// Transform resignation
function formatResignation(resDoc: any): Resignation {
  return {
    id: resDoc._id ? resDoc._id.toString() : resDoc.id,
    employeeId: resDoc.employeeId ? resDoc.employeeId.toString() : resDoc.employeeId,
    employeeName: resDoc.employeeName,
    employeeEmail: resDoc.employeeEmail,
    reason: resDoc.reason,
    detailedDescription: resDoc.detailedDescription,
    lastWorkingDate: resDoc.lastWorkingDate,
    managerName: resDoc.managerName,
    comments: resDoc.comments,
    noticePeriod: resDoc.noticePeriod,
    attachmentUrl: resDoc.attachmentUrl,
    status: resDoc.status,
    remarks: resDoc.remarks,
    finalLastWorkingDate: resDoc.finalLastWorkingDate,
    createdAt: resDoc.createdAt instanceof Date ? resDoc.createdAt.toISOString() : resDoc.createdAt,
    updatedAt: resDoc.updatedAt instanceof Date ? resDoc.updatedAt.toISOString() : resDoc.updatedAt,
  };
}

// Transform exit interview
function formatExitResponse(exitDoc: any): ExitResponse {
  return {
    id: exitDoc._id ? exitDoc._id.toString() : exitDoc.id,
    resignationId: exitDoc.resignationId ? exitDoc.resignationId.toString() : exitDoc.resignationId,
    employeeId: exitDoc.employeeId ? exitDoc.employeeId.toString() : exitDoc.employeeId,
    employeeName: exitDoc.employeeName,
    employeeEmail: exitDoc.employeeEmail,
    whyLeaving: exitDoc.whyLeaving,
    whatLiked: exitDoc.whatLiked,
    whatDisliked: exitDoc.whatDisliked,
    recommendCompany: exitDoc.recommendCompany,
    suggestions: exitDoc.suggestions,
    overallRating: exitDoc.overallRating,
    additionalFeedback: exitDoc.additionalFeedback,
    isSubmitted: exitDoc.isSubmitted,
    createdAt: exitDoc.createdAt instanceof Date ? exitDoc.createdAt.toISOString() : exitDoc.createdAt,
    updatedAt: exitDoc.updatedAt instanceof Date ? exitDoc.updatedAt.toISOString() : exitDoc.updatedAt,
  };
}

export const dbStore = {
  // --- USER CONTROLS ---
  async getUserByEmail(email: string): Promise<any | null> {
    if (email && (email.toLowerCase() === "admin@xexit.com" || email.toLowerCase() === "admin")) {
      const adminUser = mockUsers.find((u) => u.id === "user-admin");
      return adminUser || null;
    }
    if (isDBConnected()) {
      const user = await UserModel.findOne({ email });
      return user ? user.toObject() : null;
    }
    const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },

  async getUserById(id: string): Promise<User | null> {
    if (id === "user-admin" || id === "admin-1") {
      const adminUser = mockUsers.find((u) => u.id === "user-admin");
      return adminUser ? formatUser(adminUser) : null;
    }
    if (isDBConnected()) {
      const user = await UserModel.findById(id);
      return user ? formatUser(user) : null;
    }
    const user = mockUsers.find((u) => u.id === id);
    return user ? formatUser(user) : null;
  },

  async createUser(userData: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password || "password123", 10);
    const withHashed = { ...userData, password: hashedPassword };

    if (isDBConnected()) {
      const created = await UserModel.create(withHashed);
      return formatUser(created);
    }

    const newId = `user-${Date.now()}`;
    const newUser = {
      ...withHashed,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return formatUser(newUser);
  },

  async updateUser(id: string, updateData: any): Promise<User | null> {
    if (isDBConnected()) {
      const updated = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
      return updated ? formatUser(updated) : null;
    }

    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) return null;

    mockUsers[index] = {
      ...mockUsers[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    return formatUser(mockUsers[index]);
  },

  // --- RESIGNATION CONTROLS ---
  async createResignation(resData: any): Promise<Resignation> {
    if (isDBConnected()) {
      const created = await ResignationModel.create(resData);
      return formatResignation(created);
    }

    const newId = `res-${Date.now()}`;
    const newRes = {
      ...resData,
      id: newId,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockResignations.push(newRes);
    return formatResignation(newRes);
  },

  async getEmployeeResignations(employeeId: string): Promise<Resignation[]> {
    if (isDBConnected()) {
      const list = await ResignationModel.find({ employeeId }).sort({ createdAt: -1 });
      return list.map(formatResignation);
    }
    const list = mockResignations
      .filter((r) => r.employeeId === employeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list.map(formatResignation);
  },

  async getResignationById(id: string): Promise<Resignation | null> {
    if (isDBConnected()) {
      const res = await ResignationModel.findById(id);
      return res ? formatResignation(res) : null;
    }
    const res = mockResignations.find((r) => r.id === id);
    return res ? formatResignation(res) : null;
  },

  async concludeResignation(
    resignationId: string,
    action: "approve" | "reject",
    remarks?: string,
    finalLastWorkingDate?: string
  ): Promise<Resignation | null> {
    const status = action === "approve" ? "approved" : "rejected";
    const update = {
      status,
      remarks,
      ...(finalLastWorkingDate ? { finalLastWorkingDate } : {}),
    };

    if (isDBConnected()) {
      const res = await ResignationModel.findByIdAndUpdate(resignationId, update, { new: true });
      return res ? formatResignation(res) : null;
    }

    const index = mockResignations.findIndex((r) => r.id === resignationId);
    if (index === -1) return null;

    mockResignations[index] = {
      ...mockResignations[index],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    return formatResignation(mockResignations[index]);
  },

  async queryAllResignations(params: {
    search?: string;
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ resignations: Resignation[]; totalPages: number; currentPage: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    if (isDBConnected()) {
      const query: any = {};
      if (params.status && params.status !== "all") {
        query.status = params.status;
      }
      if (params.search) {
        query.$or = [
          { employeeName: { $regex: params.search, $options: "i" } },
          { employeeEmail: { $regex: params.search, $options: "i" } },
          { reason: { $regex: params.search, $options: "i" } },
        ];
      }

      let sortOption: any = { createdAt: -1 };
      if (params.sort) {
        if (params.sort === "date_asc") sortOption = { lastWorkingDate: 1 };
        else if (params.sort === "date_desc") sortOption = { lastWorkingDate: -1 };
        else if (params.sort === "oldest") sortOption = { createdAt: 1 };
      }

      const totalDocs = await ResignationModel.countDocuments(query);
      const docs = await ResignationModel.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

      return {
        resignations: docs.map(formatResignation),
        totalPages: Math.ceil(totalDocs / limit),
        currentPage: page,
      };
    }

    // In-Memory filtering
    let list = [...mockResignations];

    if (params.status && params.status !== "all") {
      list = list.filter((r) => r.status === params.status);
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(searchLower) ||
          r.employeeEmail.toLowerCase().includes(searchLower) ||
          r.reason.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    if (params.sort) {
      if (params.sort === "date_asc") {
        list.sort((a, b) => a.lastWorkingDate.localeCompare(b.lastWorkingDate));
      } else if (params.sort === "date_desc") {
        list.sort((a, b) => b.lastWorkingDate.localeCompare(a.lastWorkingDate));
      } else if (params.sort === "oldest") {
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const totalDocs = list.length;
    const paginatedList = list.slice(skip, skip + limit);

    return {
      resignations: paginatedList.map(formatResignation),
      totalPages: Math.ceil(totalDocs / limit) || 1,
      currentPage: page,
    };
  },

  // --- EXIT INTERVIEW RESPONSES ---
  async createExitResponse(exitData: any): Promise<ExitResponse> {
    if (isDBConnected()) {
      const created = await ExitResponseModel.create(exitData);
      return formatExitResponse(created);
    }

    const newId = `exit-${Date.now()}`;
    const newExit = {
      ...exitData,
      id: newId,
      isSubmitted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockExitResponses.push(newExit);
    return formatExitResponse(newExit);
  },

  async getExitResponseByResignationId(resignationId: string): Promise<ExitResponse | null> {
    if (isDBConnected()) {
      const exit = await ExitResponseModel.findOne({ resignationId });
      return exit ? formatExitResponse(exit) : null;
    }
    const exit = mockExitResponses.find((e) => e.resignationId === resignationId);
    return exit ? formatExitResponse(exit) : null;
  },

  async queryAllExitResponses(params: {
    search?: string;
    rating?: number;
    recommend?: string;
    page?: number;
    limit?: number;
  }): Promise<{ exitResponses: ExitResponse[]; totalPages: number; currentPage: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    if (isDBConnected()) {
      const query: any = {};
      if (params.rating) {
        query.overallRating = params.rating;
      }
      if (params.recommend && params.recommend !== "all") {
        query.recommendCompany = params.recommend;
      }
      if (params.search) {
        query.$or = [
          { employeeName: { $regex: params.search, $options: "i" } },
          { employeeEmail: { $regex: params.search, $options: "i" } },
          { whyLeaving: { $regex: params.search, $options: "i" } },
        ];
      }

      const totalDocs = await ExitResponseModel.countDocuments(query);
      const docs = await ExitResponseModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        exitResponses: docs.map(formatExitResponse),
        totalPages: Math.ceil(totalDocs / limit),
        currentPage: page,
      };
    }

    // In-Memory filtering
    let list = [...mockExitResponses];

    if (params.rating) {
      list = list.filter((e) => e.overallRating === Number(params.rating));
    }

    if (params.recommend && params.recommend !== "all") {
      list = list.filter((e) => e.recommendCompany === params.recommend);
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.employeeName.toLowerCase().includes(searchLower) ||
          e.employeeEmail.toLowerCase().includes(searchLower) ||
          e.whyLeaving.toLowerCase().includes(searchLower)
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalDocs = list.length;
    const paginatedList = list.slice(skip, skip + limit);

    return {
      exitResponses: paginatedList.map(formatExitResponse),
      totalPages: Math.ceil(totalDocs / limit) || 1,
      currentPage: page,
    };
  }
};
