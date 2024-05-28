/* eslint-disable no-restricted-syntax */
import avro from 'avsc';
import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import kafkaService from '@core/utils/messaging';
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '@core/utils/redis';
import { ISeat } from './seat.interface';

// eslint-disable-next-line import/no-mutable-exports
export let seatStorage: Array<ISeat> = [];
export const type = avro.Type.forSchema({
  type: 'record',
  name: 'Seat',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'eventId', type: 'string' },
    { name: 'seatNumber', type: 'int' },
    { name: 'isBooked', type: 'boolean' },
    { name: 'bookedBy', type: 'string' },
  ],
});

export const setSeatStorage = (seats: ISeat[]): void => {
  seatStorage = seats;
};

const storeEventSeats = async (eventId, seats: ISeat[]) => {
  const keyValuePairs = [];
  for await (const seat of seats) {
    keyValuePairs.push({
      key: `event:${eventId}:seats:${seat.id}`.toString(),
      value: JSON.stringify(seat),
    });
  }
  await redisClient.getInstance().setMultiple(keyValuePairs);
};

const read = async (eventId: string, seatId: string): Promise<ISeat> => {
  const seat = await redisClient
    .getInstance()
    .get(`event:${eventId}:seats:${seatId}`);

  return JSON.parse(seat);
};

const update = async (seat: ISeat): Promise<boolean> => {
  await redisClient
    .getInstance()
    .set(`event:${seat.eventId}:seats:${seat.id}`, JSON.stringify(seat));
  return true;
};

const deleteById = async (eventId, seatId: string) => {
  const seat = await read(eventId, seatId);
  if (!seat) {
    throw new AppError(httpStatus.NOT_FOUND, 'Seat not found!');
  }
  await redisClient.getInstance().del(`event:${eventId}:seats:${seatId}`);
  return true;
};

const createAll = async (eventId, seats: ISeat[]): Promise<boolean> => {
  const seatsToBeStored = seats.map((seat) => {
    return {
      ...seat,
      id: uuidv4(),
      bookedAt: null,
    };
  });

  await storeEventSeats(eventId, seatsToBeStored);
  if (seatsToBeStored.length > 0) {
    logger.debug(`Seats created: %O`, seatsToBeStored);
    return true;
  }
  throw new AppError(httpStatus.BAD_GATEWAY, 'Seat was not created!');
};

export const checkIfSeatIsBooked = (
  expirationDate: Date,
  isBooked: boolean,
): boolean => {
  const now = new Date();
  return isBooked || expirationDate <= now;
};

const bookEventSeat = async (
  eventId: string,
  seatId: string,
): Promise<boolean> => {
  const seat = await read(eventId, seatId);
  if (!seat) {
    throw new AppError(httpStatus.NOT_FOUND, 'Seat not found!');
  }

  // check to see if the seat is already reserved or not
  if (seat.isBooked) {
    // throw error that seat is already booked
    throw new AppError(httpStatus.BAD_REQUEST, 'Seat is already reserved!');
  }
  if (seat.isHold) {
    // throw error that seat is already booked
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Seat is being held at the moment!',
    );
  }

  await kafkaService.connectProducer();

  const bufValue = type.toBuffer(seat);

  // Producing a message
  await kafkaService.produce('seat-reservation', bufValue);

  return true;
};

const create = async (seat: ISeat): Promise<boolean> => {
  const seatToBeStored = {
    ...seat,
    id: uuidv4(),
    bookedAt: null,
  };
  try {
    await redisClient
      .getInstance()
      .set(
        `event:${seat.eventId}:seats:${seatToBeStored.id}`,
        JSON.stringify(seatToBeStored),
      );
    return true;
  } catch (error) {
    throw new AppError(httpStatus.BAD_GATEWAY, 'Seat was not created!');
  }
};

const readEventSeats = async (eventId: string) => {
  logger.debug(`Sent seat.id ${eventId}`);
  const seats = await redisClient
    .getInstance()
    .getValuesByKeys(`event:${eventId}:seats:*`);

  const seatsArray = Object.keys(seats)
    .map((key) => {
      return JSON.parse(seats[key]);
    })
    .filter((seat) => !seat.isBooked && !seat.isHold);

  return seatsArray;
};

export {
  bookEventSeat,
  createAll,
  create,
  readEventSeats,
  read,
  update,
  deleteById,
};
