import { Request, Response, NextFunction } from 'express';

export async function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
){
    
}