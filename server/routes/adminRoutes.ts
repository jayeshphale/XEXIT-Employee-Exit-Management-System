import { Router } from "express";
import {
  queryAllResignations,
  concludeResignation,
  queryAllExitResponses,
} from "../controllers/adminController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get("/resignations", queryAllResignations);
router.put("/conclude_resignation", concludeResignation);
router.get("/exit_responses", queryAllExitResponses);

export default router;
