export interface Event{

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

