import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';
import { IEvent } from './event.interface';
import { createAll } from '../seat/seat.service';

let eventStorage: Array<IEvent> = [];

const create = (event: IEvent): string => {
  const { totalSeats } = event;
  const seats = [];
  const eventId = uuidv4();
  if (eventStorage.push({ ...event, id: eventId })) {
    logger.debug(`Event created: %O`, event);
    // create seats for event
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= totalSeats; i++) {
      // eslint-disable-next-line
      const seat = { eventId: eventId, seatNumber: i, isBooked: false, isHold: false, bookedBy: 'Ahmad'};
      seats.push(seat);
    }
    createAll(eventId, seats);
    return eventId;
  }
  throw new AppError(httpStatus.BAD_GATEWAY, 'Event was not created!');
};

const read = (id: string): IEvent => {
  logger.debug(`Sent event.id ${id}`);
  return eventStorage.find((event) => event.id === id);
};

const update = (event: IEvent): boolean => {
  eventStorage = eventStorage.map((u) =>
    u.id === event.id ? { ...u, ...event } : u,
  );
  return true;
};

const deleteById = (id: string) => {
  eventStorage = eventStorage.filter((event) => event.id !== id);
  logger.debug(`Event ${id} has been removed`);
  return true;
};

export { create, read, update, deleteById };
