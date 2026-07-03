import { Request, Response } from "express";
import { dbStore } from "../dbStore";
import { sendResignationConclusionEmail, sendLastWorkingDateChangeEmail } from "../mailService";

export const queryAllResignations = async (req: Request, res: Response) => {
  try {
    const { search, status, sort, page, limit } = req.query;
    const result = await dbStore.queryAllResignations({
      search: search as string,
      status: status as string,
      sort: sort as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to query resignations." });
  }
};

export const concludeResignation = async (req: Request, res: Response) => {
  try {
    const { resignationId, action, remarks, finalLastWorkingDate } = req.body;

    if (!resignationId || !action) {
      return res.status(400).json({ message: "Resignation ID and action are required." });
    }

    const existing = await dbStore.getResignationById(resignationId);
    if (!existing) {
      return res.status(404).json({ message: "Resignation file not found." });
    }

    const updated = await dbStore.concludeResignation(resignationId, action, remarks, finalLastWorkingDate);
    if (!updated) {
      return res.status(404).json({ message: "Resignation file not found." });
    }

    // Determine email trigger based on previous state and new actions
    if (existing.status !== updated.status) {
      // Status transitioned (e.g., pending -> approved/rejected)
      sendResignationConclusionEmail(
        updated.employeeName,
        updated.employeeEmail,
        updated.status as "approved" | "rejected",
        remarks,
        finalLastWorkingDate || updated.lastWorkingDate
      ).catch((err) => console.error("Error sending resignation conclusion email:", err));
    } else if (finalLastWorkingDate && existing.finalLastWorkingDate !== finalLastWorkingDate) {
      // Status stayed the same (already approved) but final Last Working Date was updated/changed
      sendLastWorkingDateChangeEmail(
        updated.employeeName,
        updated.employeeEmail,
        finalLastWorkingDate,
        remarks
      ).catch((err) => console.error("Error sending last working date change email:", err));
    }

    return res.json({ resignation: updated });
  } catch (error: any) {
    console.error("Conclude Resignation Error:", error);
    return res.status(500).json({ message: "Failed to conclude resignation." });
  }
};

export const queryAllExitResponses = async (req: Request, res: Response) => {
  try {
    const { search, rating, recommend, page, limit } = req.query;
    const result = await dbStore.queryAllExitResponses({
      search: search as string,
      rating: rating ? Number(rating) : undefined,
      recommend: recommend as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to query exit responses." });
  }
};
