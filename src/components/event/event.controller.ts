import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  create,
  read,
  update,
  deleteById,
} from '@components/event/event.service';
import { IEvent } from '@components/event/event.interface';

const createEvent = (req: Request, res: Response) => {
  try {
    const event = req.body as IEvent;
    if (event.totalSeats > 1000 || event.totalSeats < 1) {
      throw new Error('Total seats should be between 1 and 1000');
    }
    const eventId = create(event);
    res.status(httpStatus.CREATED);
    res.send({ message: 'Event created successfully', id: eventId });
  } catch (error) {
    res.status(httpStatus.BAD_GATEWAY);
    res.send({ message: error.message });
  }
};

const readEvent = (req: Request, res: Response) => {
  res.status(httpStatus.OK);
  const event = read(req.params.id);
  res.send({
    message: 'Read',
    output: event || 'Event not found',
  });
};

const updateEvent = (req: Request, res: Response) => {
  const event = req.body as IEvent;
  update(event);
  res.status(httpStatus.OK);
  res.send({ message: 'Updated Event' });
};

const deleteEvent = (req: Request, res: Response) => {
  deleteById(req.params.eventId);
  res.status(httpStatus.ACCEPTED);
  res.send({ message: 'Removed' });
};

export { createEvent, readEvent, updateEvent, deleteEvent };
