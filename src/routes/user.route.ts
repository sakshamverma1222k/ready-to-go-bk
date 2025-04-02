import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.ts';
import { multerMiddleware } from '../middlewares/multer.middleware.ts';

const router = Router();

router.route("/register").post(multerMiddleware.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser);

export default router;