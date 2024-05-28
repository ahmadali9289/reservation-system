import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  create,
  read,
  readEventSeats,
  update,
  deleteById,
  bookEventSeat,
} from '@components/seat/seat.service';
import { ISeat } from '@components/seat/seat.interface';

const createSeat = async (req: Request, res: Response) => {
  try {
    const seat = req.body as ISeat;
    await create(seat);
    res.status(httpStatus.CREATED);
    res.send({ message: 'Created' });
  } catch (error) {
    res.status(httpStatus.BAD_GATEWAY);
    res.send({ message: error.message });
  }
};

const bookSeat = async (req: Request, res: Response) => {
  try {
    const { eventId, seatId } = req.params;
    await bookEventSeat(eventId, seatId);
    res.status(httpStatus.CREATED);
    res.send({ message: 'Seat has been booked!' });
  } catch (error) {
    res.status(httpStatus.BAD_GATEWAY);
    res.send({ message: error.message });
  }
};

const readSeat = async (req: Request, res: Response) => {
  try {
    res.status(httpStatus.OK);
    res.send({
      message: 'Read',
      output: await read(req.params.eventId, req.params.seatId),
    });
  } catch (error) {
    res.status(httpStatus.BAD_GATEWAY);
    res.send({ message: error.message });
  }
};

const readAllEventSeats = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  res.status(httpStatus.OK);
  res.send({ message: 'Read', output: await readEventSeats(eventId) });
};

const updateSeat = async (req: Request, res: Response) => {
  try {
    const seat = req.body as ISeat;
    await update(seat);
    res.status(httpStatus.OK);
    res.send({ message: 'Updated' });
  } catch (error) {
    res.status(httpStatus.BAD_GATEWAY);
    res.send({ message: error.message });
  }
};

const deleteSeat = async (req: Request, res: Response) => {
  try {
    await deleteById(req.params.eventId, req.params.seatId);
    res.status(httpStatus.ACCEPTED);
    res.send({ message: 'Removed' });
  } catch (error) {
    res.status(httpStatus.BAD_GATEWAY);
    res.send({ message: error.message });
  }
};

export {
  bookSeat,
  createSeat,
  readSeat,
  readAllEventSeats,
  updateSeat,
  deleteSeat,
};
