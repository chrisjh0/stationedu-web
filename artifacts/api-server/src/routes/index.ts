import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import userRouter from "./user";
import clubsRouter from "./clubs";
import eventsRouter from "./events";
import enrollmentRouter from "./enrollment";
import calendarRouter from "./calendar";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(userRouter);
router.use(clubsRouter);
router.use(eventsRouter);
router.use(enrollmentRouter);
router.use(calendarRouter);

export default router;
