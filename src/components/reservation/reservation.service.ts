import { ISeat } from '@components/seat/seat.interface';
import { setTimeout as wait } from 'timers/promises';
import kafkaService from '@core/utils/messaging';
import redisClient from '@core/utils/redis';
import logger from '@core/utils/logger';
import { read, type, update } from '@components/seat/seat.service';

const holdDuration = 60000; // 60 seconds

async function holdSeat(eventId: string, seatId: string): Promise<boolean> {
  // find the seat in seatStorage[] and set it to hold
  const seat = await read(eventId, seatId);
  if (!seat) {
    logger.info(`Seat ${seatId} does not exist.`);
    return false;
  }
  if (seat.isBooked) {
    logger.info(`Seat ${seatId} is already booked.`);
    return false;
  }
  if (seat.isHold) {
    logger.info(`Seat ${seatId} is already on hold.`);
    return false;
  }
  await update({ ...seat, isHold: true });

  logger.info(`Seat ${seatId} is now on hold.`);
  return true;
}

async function mockPaymentProcess(): Promise<boolean> {
  const processingTime = Math.floor(Math.random() * 70000); // Random time between 0 and 70 seconds
  await wait(processingTime);
  return processingTime <= 60000; // Payment is successful if it completes within 60 seconds
}

const seatBooked = async (seatData: ISeat) => {
  await redisClient
    .getInstance()
    .set(
      `event:${seatData.eventId}:seats:${seatData.id}`,
      JSON.stringify({ ...seatData, isHold: false, isBooked: true }),
    );
  logger.info(
    '========RESERVED======================',
    JSON.stringify(seatData),
  );
};

async function reserveSeat(seat: ISeat) {
  const { eventId, id: seatId } = seat;
  if (await holdSeat(eventId, seatId)) {
    try {
      const paymentSuccessful = await Promise.race([
        mockPaymentProcess(),
        wait(holdDuration).then(() => false),
      ]);

      if (paymentSuccessful) {
        await seatBooked(seat);
        logger.info(`Seat ${seatId} has been successfully reserved.`);
      } else {
        await update({ ...seat, isHold: false });
        logger.error(
          `Payment failed or timed out for seat ${seatId}. Seat is now available.`,
        );
      }
    } catch (error) {
      await update({ ...seat, isHold: false });
      logger.error(
        `Error occurred: ${error}. Seat ${seatId} is now available.`,
      );
    }
  } else {
    logger.error(`Could not place seat ${seatId} on hold.`);
  }
}

// Connect to Kafka broker and consume messages
const run = async () => {
  await kafkaService.connectConsumer();

  await kafkaService.consume('seat-reservation', async (message) => {
    logger.info('Received message:', type.fromBuffer(message));

    const seat = type.fromBuffer(message);
    await reserveSeat(seat);
  });
};

// Run the consumer
run().catch((e) => logger.error(e));
