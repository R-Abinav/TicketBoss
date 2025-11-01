import { Request, Response, NextFunction } from 'express';
import * as ticketService from '../services/ticket.service';

import { AppError } from '../utils/errors.util';

export async function createReservation(
    req: Request,
    res: Response,
    next: NextFunction
){
    try{
        const { partnerId, seats } = req.body;

        const reservation = await ticketService.reserveSeats(partnerId, seats);

        return res.status(201).json({
            reservationId: reservation.Id,
            seats: reservation.seats,
            status: reservation.status
        });
    }catch(err){
        //pass to the global error handler
        next(err);
    }
}


