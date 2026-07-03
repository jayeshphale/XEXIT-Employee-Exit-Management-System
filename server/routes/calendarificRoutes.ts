import { Router } from "express";
import { validateDate } from "../controllers/calendarificController";

const router = Router();

router.get("/validate-date", validateDate);

export default router;
