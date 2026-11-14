import { Router } from "express"
import { registerUser } from "../services/auth.service";

export const authRouter = Router();

authRouter.post("/register", async(req, res, next) => {
    try{
        const {email, password} = req.body;

        // not writing service login here
        // service login - servicefile
        await registerUser(email,password)

        res.status(201).json({
            success: true,
            message: "Registeration successfull. Please login to continue"
        });

    }catch(error) {
        next(error);
    };
});

