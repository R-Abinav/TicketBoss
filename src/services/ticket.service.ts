import { v4 as uuidv4 } from 'uuid';
import { AppError, NotEnoughSeatsError, ReservationNotFoundError } from '../utils/errors.util';

export async function reserveSeats(
    partnerId: string,
    seats: number
){

}

export async function cancelReservation(
    reservationId: string
){

}

export async function getEventSummary(){
    
}

