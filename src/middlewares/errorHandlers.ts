import { Request, Response } from "express";
import { NextFunction } from "express";
import { logger } from "../lib/logger";


export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,

): void {

    logger.error({err}, "Unhandled Error");
    res.status(500).json({
        success: false,
        message: "Internet server error",
    });
};