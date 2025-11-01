export interface Event{
    eventId: string,
    name: string,
    totalSeats: number,
    reservationCount: number,
    version: number
}

export interface ReserveRequest{
    partnerId: string;
    seats: number;
}

export interface ReserveResponse{
    reservationId: string;
    seats: number;
    status: string;
}

export interface EventSummary extends Event {
    reservationCount: number;
}


