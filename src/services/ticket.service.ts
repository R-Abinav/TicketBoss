import { v4 as uuidv4 } from 'uuid';
import { AppError, NotEnoughSeatsError, ReservationNotFoundError, ConcurrencyError, ReservationAlreadyCancelled } from '../utils/errors.util';
import { prisma } from '../config/db.config';
import type { Prisma } from '@prisma/client';
import { pseudoRandomBytes } from 'crypto';

const EVENT_ID = process.env.EVENT_ID || 'node-meetup-2025';

export async function reserveSeats(
    partnerId: string,
    seats: number
){
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        //Lock and fetch current event
        const event = await tx.event.findUnique({
            where: {
                eventId: EVENT_ID
            }
        });
        
        if(!event){
            throw new AppError('Event not found', 404);
        }

        if(event.availableSeats < seats){
            throw new NotEnoughSeatsError();
        }

        //Update the details now (With version check - the locking mechanism)
        const updatedEvent = await tx.event.updateMany({
            where: {
                eventId: EVENT_ID,
                version: event.version
            },
            data: {
                availableSeats: event.availableSeats - seats,
                version: event.version + 1
            }
        });

        if(updatedEvent.count === 0){
            throw new ConcurrencyError();
        }

        //confirm the reservation
        const reservation = await tx.reservation.create({
            data: {
                reservationId: uuidv4(),
                eventId: EVENT_ID,
                partnerId,
                seats,
                status: 'confirmed',
            }
        });

        return {
            reservationId: reservation.reservationId,
            seats: reservation.seats,
            status: reservation.status
        };
    }, {
        isolationLevel: 'Serializable',
        maxWait: 5000,
        timeout: 10000
    });
}

export async function cancelReservation(
    reservationId: string
){
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        //look for the reservation to cancel
        const reservation = await tx.reservation.findUnique({
            where: {
                reservationId: reservationId
            }
        });

        if(!reservation){
            throw new ReservationNotFoundError();
        }

        if(reservation.status === 'cancelled'){
            throw new ReservationAlreadyCancelled();
        }

        await tx.reservation.update({
            where: {
                reservationId: reservationId,
            },
            data: {
                status: 'cancelled',
                cancelledAt: new Date(),
            }
        });

        //Update events
        await tx.event.update({
            where: {
                eventId: reservation.eventId,
            },
            data: {
                availableSeats: {
                    increment: reservation.seats,
                },
                version: {
                    increment: 1
                }
            }
        });

        //We return nothing -> Controller sends 204
    }, {
        isolationLevel: 'Serializable',
        maxWait: 5000,
        timeout: 10000
    });
}

export async function getEventSummary(){
    const event = await prisma.event.findUnique({
        where: {
            eventId: EVENT_ID
        }
    });

    if(!event){
        throw new AppError('Event not found', 404);
    }

    const reservationCount = await prisma.reservation.count({
        where: {
            eventId: EVENT_ID,
            status: 'confirmed',
        }
    });

    return {
        eventId: event.eventId,
        name: event.name,
        totalSeats: event.totalSeats,
        availableSeats: event.availableSeats,
        reservationCount: reservationCount,
        version: event.version
    };
}

