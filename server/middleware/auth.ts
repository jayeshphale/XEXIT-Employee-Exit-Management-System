import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { dbStore } from "../dbStore";

const JWT_SECRET = process.env.JWT_SECRET || "xexit-jwt-super-secret-key-987654";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: "employee" | "admin";
    email: string;
    firstName: string;
    lastName: string;
    country: string;
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }

  // Handle mock admin token directly for easier development fallback
  if (token === "demo-admin-token") {
    req.user = {
      id: "user-admin",
      role: "admin",
      email: "admin@xexit.com",
      firstName: "HR",
      lastName: "Admin",
      country: "US",
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: "employee" | "admin"; email: string };
    const user = await dbStore.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User session not found." });
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
    };
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access forbidden. Admin role required." });
  }
  next();
};
