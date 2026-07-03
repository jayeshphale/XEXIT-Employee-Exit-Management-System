import { Request, Response } from "express";
import axios from "axios";

export const validateDate = async (req: Request, res: Response) => {
  try {
    const { date, country } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    const dateStr = date as string;
    const countryCode = (country as string) || "US";
    const year = dateStr.split("-")[0];

    const apiKey = process.env.CALENDARIFIC_API_KEY;

    if (apiKey) {
      try {
        const url = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${countryCode}&year=${year}`;
        const calRes = await axios.get(url);
        const holidays = calRes.data?.response?.holidays || [];

        const matchingHoliday = holidays.find((h: any) => {
          return h.date?.iso === dateStr || (h.date?.datetime && 
            `${h.date.datetime.year}-${String(h.date.datetime.month).padStart(2, "0")}-${String(h.date.datetime.day).padStart(2, "0")}` === dateStr);
        });

        if (matchingHoliday) {
          return res.json({
            isHoliday: true,
            holidayName: matchingHoliday.name,
          });
        }
      } catch (calErr) {
        console.warn("External Calendarific API call failed. Falling back to local holiday validation.");
      }
    }

    // Local static verification fallback
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
      return res.json({
        isHoliday: true,
        holidayName: commonHolidays[monthDay],
      });
    }

    return res.json({
      isHoliday: false,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to validate date." });
  }
};
