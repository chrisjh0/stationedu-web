import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import userRouter from "./user.js";
import clubsRouter from "./clubs.js";
import eventsRouter from "./events.js";
import enrollmentRouter from "./enrollment.js";
import calendarRouter from "./calendar.js";
import leadersRouter from "./leaders.js";
import storageRouter from "./storage.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(userRouter);
router.use(storageRouter);
router.use(clubsRouter);
router.use(eventsRouter);
router.use(enrollmentRouter);
router.use(calendarRouter);
router.use(leadersRouter);

export default router;
