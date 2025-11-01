import { Router } from 'express';
import * as controller from '../controllers/reservation.controller'
import { validateReservation } from '../middleware/validator.middleware';

const router = Router();

//POST -> /reservations
router.post('/reservations', validateReservation, controller.createReservation);

//DELETE -> /reservations/:reservationId
router.delete('/reservations/:reservationId', controller.cancelReservation);

//GET -> /reservations 
router.get('/reservations', controller.getEventSummary);

export default router