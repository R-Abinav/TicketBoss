import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.util'

export async function validateReservation(
    req: Request,
    res: Response,
    next: NextFunction
){
    const { partnerId, seats } = req.body;

    if(!partnerId || typeof partnerId !== 'string'){
        return next(new AppError('partnerId is required and must be of the type "string"', 400));
    }

    if(!seats || typeof seats !== 'number' || seats <= 0 || seats > 10 ){
        return next(new AppError('seats is required and must of the type "number"', 400));
    }

    if(seats <=0 || seats > 10){
        return next(new AppError('seats must be between 1 and 10 only', 400));
    }

    next();
}