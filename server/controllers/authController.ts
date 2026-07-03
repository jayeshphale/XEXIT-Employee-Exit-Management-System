import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { dbStore } from "../dbStore";
import { AuthenticatedRequest } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "xexit-jwt-super-secret-key-987654";

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, country, department, employeeId, phoneNumber, joiningDate, designation } = req.body;

    if (!firstName || !lastName || !email || !password || !employeeId) {
      return res.status(400).json({ message: "Please provide all required registration fields." });
    }

    const existingUser = await dbStore.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    const newUser = await dbStore.createUser({
      firstName,
      lastName,
      email,
      password,
      role: "employee", // Default registration is employee
      country: country || "US",
      department: department || "General",
      employeeId,
      phoneNumber: phoneNumber || "+100000000",
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      designation: designation || "Associate",
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      token,
      user: newUser,
    });
  } catch (error: any) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: error.message || "Registration failed." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || "").trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please provide both email/username and password." });
    }

    // Direct check for admin/admin HR login (not stored in MongoDB)
    if (identifier.toLowerCase() === "admin" && password === "admin") {
      const adminUser = {
        id: "user-admin",
        firstName: "HR",
        lastName: "Admin",
        email: "admin@xexit.com",
        role: "admin",
        country: "US",
        department: "Human Resources",
        employeeId: "HR001",
        phoneNumber: "+15550199",
        joiningDate: new Date("2021-01-15T08:00:00.000Z").toISOString(),
        designation: "HR Administrator",
      };
      const token = jwt.sign(
        { id: adminUser.id, role: adminUser.role, email: adminUser.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({ token, user: adminUser });
    }

    // Direct match for demo fallback tokens
    if (identifier.toLowerCase() === "admin@xexit.com" && password === "password123") {
      const adminUser = await dbStore.getUserById("user-admin");
      if (adminUser) {
        const token = jwt.sign({ id: adminUser.id, role: adminUser.role, email: adminUser.email }, JWT_SECRET, { expiresIn: "7d" });
        return res.json({ token, user: adminUser });
      }
    }

    const userInDb = await dbStore.getUserByEmail(identifier);
    if (!userInDb) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, userInDb.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: userInDb._id ? userInDb._id.toString() : userInDb.id, role: userInDb.role, email: userInDb.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const formattedUser = await dbStore.getUserById(userInDb._id ? userInDb._id.toString() : userInDb.id);

    return res.json({
      token,
      user: formattedUser,
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: error.message || "Login failed." });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = await dbStore.getUserById(req.user.id);
    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to fetch user session." });
  }
};
