import { Response } from "express";
import bcrypt from "bcryptjs";
import axios from "axios";
import { dbStore } from "../dbStore";
import { AuthenticatedRequest } from "../middleware/auth";
import { sendResignationSubmissionEmail } from "../mailService";

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const updated = await dbStore.updateUser(req.user.id, req.body);
    return res.json({ user: updated });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to update profile." });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both current and new passwords." });
    }

    const userInDb = await dbStore.getUserByEmail(req.user.email);
    if (!userInDb) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, userInDb.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await dbStore.updateUser(req.user.id, { password: hashedNew });

    return res.json({ message: "Password updated successfully." });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to change password." });
  }
};

export const submitResignation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { reason, detailedDescription, lastWorkingDate, managerName, comments, noticePeriod } = req.body;

    if (!reason || !detailedDescription || !lastWorkingDate || !managerName) {
      return res.status(400).json({ message: "Please complete all mandatory resignation fields." });
    }

    // 1. Weekend Check (0 is Sunday, 6 is Saturday)
    const lwd = new Date(lastWorkingDate);
    const dayOfWeek = lwd.getDay();
    const utcDayOfWeek = lwd.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6 || utcDayOfWeek === 0 || utcDayOfWeek === 6) {
      return res.status(400).json({ message: "Your selected Last Working Date cannot fall on a weekend (Saturday or Sunday)." });
    }

    // 2. Calendarific & Holiday Validation
    const apiKey = process.env.CALENDARIFIC_API_KEY;
    const dateStr = lastWorkingDate.split("T")[0]; // "YYYY-MM-DD"
    const countryCode = req.user.country || "US";
    const year = dateStr.split("-")[0];

    let isHoliday = false;
    let holidayName = "";

    if (apiKey) {
      try {
        const url = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${countryCode}&year=${year}`;
        const calRes = await axios.get(url, { timeout: 6000 });
        const holidays = calRes.data?.response?.holidays || [];

        const matchingHoliday = holidays.find((h: any) => {
          return h.date?.iso === dateStr || (h.date?.datetime && 
            `${h.date.datetime.year}-${String(h.date.datetime.month).padStart(2, "0")}-${String(h.date.datetime.day).padStart(2, "0")}` === dateStr);
        });

        if (matchingHoliday) {
          isHoliday = true;
          holidayName = matchingHoliday.name;
        }
      } catch (calErr: any) {
        console.error("Calendarific API failed inside resignation submit:", calErr.message);
        return res.status(503).json({ message: "Holiday validation service (Calendarific) is currently unavailable. Please try again later." });
      }
    } else {
      // Fallback local checking if CALENDARIFIC_API_KEY is not defined
      const monthDay = dateStr.substring(5); // "MM-DD"
      const commonHolidays: { [key: string]: string } = {
        "01-01": "New Year's Day",
        "07-04": "Independence Day",
        "12-25": "Christmas Day",
        "05-01": "Labour Day",
        "10-02": "Gandhi Jayanti",
        "08-15": "Independence Day (India)",
        "01-26": "Republic Day (India)",
      };

      if (commonHolidays[monthDay]) {
        isHoliday = true;
        holidayName = commonHolidays[monthDay];
      }
    }

    if (isHoliday) {
      return res.status(400).json({ message: `Your selected Last Working Date falls on a public holiday (${holidayName}).` });
    }

    // Check if employee already has an active resignation that is not rejected
    const existing = await dbStore.getEmployeeResignations(req.user.id);
    const activeExists = existing.some((r) => r.status === "pending" || r.status === "approved");
    if (activeExists) {
      return res.status(400).json({ message: "You already have an active resignation file in progress." });
    }

    const resignation = await dbStore.createResignation({
      employeeId: req.user.id,
      employeeName: `${req.user.firstName} ${req.user.lastName}`,
      employeeEmail: req.user.email,
      reason,
      detailedDescription,
      lastWorkingDate,
      managerName,
      comments,
      noticePeriod: noticePeriod || 30,
      status: "pending",
    });

    // Send resignation notification emails in the background
    sendResignationSubmissionEmail(
      `${req.user.firstName} ${req.user.lastName}`,
      req.user.email,
      managerName,
      lastWorkingDate
    ).catch((err) => console.error("Nodemailer resignation submission mail error:", err));

    return res.status(201).json({ resignation });
  } catch (error: any) {
    console.error("Resignation Submit Error:", error);
    return res.status(500).json({ message: "Failed to file resignation." });
  }
};

export const getResignations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const list = await dbStore.getEmployeeResignations(req.user.id);
    return res.json({ resignations: list });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to fetch your resignation list." });
  }
};

export const submitExitResponse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { resignationId, whyLeaving, whatLiked, whatDisliked, recommendCompany, suggestions, overallRating, additionalFeedback } = req.body;

    if (!resignationId || !whyLeaving || !whatLiked || !whatDisliked || !recommendCompany || !overallRating) {
      return res.status(400).json({ message: "Please complete all mandatory interview fields." });
    }

    // Verify resignation exists, belongs to employee, and is approved
    const resignation = await dbStore.getResignationById(resignationId);
    if (!resignation) {
      return res.status(403).json({ message: "Access forbidden. Resignation request does not exist." });
    }

    if (resignation.employeeId !== req.user.id) {
      return res.status(403).json({ message: "Access forbidden. Resignation request belongs to another employee." });
    }

    if (resignation.status !== "approved") {
      return res.status(403).json({ message: "Access forbidden. Exit interview is only accessible after resignation is approved." });
    }

    // Check if exit response already exists for this resignation (prevent duplicate submissions)
    const existingResponse = await dbStore.getExitResponseByResignationId(resignationId);
    if (existingResponse) {
      return res.status(400).json({ message: "You have already submitted an exit interview response for this resignation." });
    }

    const exitResponse = await dbStore.createExitResponse({
      resignationId,
      employeeId: req.user.id,
      employeeName: `${req.user.firstName} ${req.user.lastName}`,
      employeeEmail: req.user.email,
      whyLeaving,
      whatLiked,
      whatDisliked,
      recommendCompany,
      suggestions: suggestions || "",
      overallRating: Number(overallRating),
      additionalFeedback,
      isSubmitted: true,
    });

    return res.status(201).json({ exitResponse });
  } catch (error: any) {
    console.error("Exit Interview Submit Error:", error);
    return res.status(500).json({ message: "Failed to submit exit interview responses." });
  }
};

export const getExitResponse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resignationId } = req.params;
    const exitResponse = await dbStore.getExitResponseByResignationId(resignationId);
    if (!exitResponse) {
      return res.status(404).json({ message: "Exit interview response not found." });
    }
    return res.json({ exitResponse });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to fetch exit interview response." });
  }
};
