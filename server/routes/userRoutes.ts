import { Router } from "express";
import {
  updateProfile,
  changePassword,
  submitResignation,
  getResignations,
  submitExitResponse,
  getExitResponse,
} from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.post("/resign", submitResignation);
router.get("/resign", getResignations);
router.post("/responses", submitExitResponse);
router.get("/responses/resignation/:resignationId", getExitResponse);

export default router;
