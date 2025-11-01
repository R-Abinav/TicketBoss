export class AppError extends Error {
    constructor(public message: string, public statusCode: number) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotEnoughSeatsError extends AppError {
    constructor() {
        super('Not enough seats left', 409);
    }
}

export class ReservationNotFoundError extends AppError {
    constructor() {
        super('Reservation not found', 404);
    }
}

export class ReservationAlreadyCancelled extends AppError{
    constructor() {
        super('Reservation is already cancelled', 409);
    }
}

export class ConcurrencyError extends AppError {
    constructor() {
        super('Concurrent update detected', 409);
    }
}