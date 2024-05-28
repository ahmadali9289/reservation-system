// import { ISeat } from '@components/seat/seat.interface';
// import { createClient } from 'redis';
// import { promisify } from 'util';

// interface EventData {
//   name: string;
//   date: string;
//   location: string;
// }

// interface SeatData {
//   seatId: string;
//   status: string;
// }

// interface ReservationData {
//   seatId: string;
//   userId: string;
//   status: string;
// }

// class RedisUtility {
//   private client;

//   get Client() {
//     return this.client;
//   }

//   constructor(url = 'redis://localhost:6379') {
//     this.client = createClient({ url });
//     this.client.on('error', (err) => {
//       console.error('Redis error:', err);
//     });

//     // Promisify Redis commands for easier async/await usage
//     this.client.lpushAsync = promisify(this.client.lPush).bind(this.client);
//     this.client.lrangeAsync = promisify(this.client.lRange).bind(this.client);
//     this.client.setAsync = promisify(this.client.set).bind(this.client);
//     this.client.getAsync = promisify(this.client.get).bind(this.client);
//     this.client.lremAsync = promisify(this.client.lRem).bind(this.client);
//     this.client.lpopAsync = promisify(this.client.lPop).bind(this.client); // Add this line
//     this.client.hsetAsync = promisify(this.client.hSet).bind(this.client);
//   }

//   async addSeats(
//     eventId: string,
//     seatId: string,
//     seatData: ISeat,
//   ): Promise<void> {
//     await this.client.hset(`event:${eventId}:seats:${seatId}`, seatData);
//   }

//   async addEvent(eventId: string, eventData: EventData): Promise<void> {
//     await this.client.setAsync(eventId, JSON.stringify(eventData));
//   }

//   async getEvent(eventId: string): Promise<EventData | null> {
//     const eventData = await this.client.getAsync(eventId);
//     return eventData ? JSON.parse(eventData) : null;
//   }

//   async addSeat(eventId: string, seatData: SeatData): Promise<void> {
//     await this.client.lpushAsync(`${eventId}:seats`, JSON.stringify(seatData));
//   }

//   async getSeat(eventId: string): Promise<SeatData> {
//     const seat = await this.client.lpopAsync(`${eventId}:seats`);
//     return seat ? JSON.parse(seat) : null;
//   }

//   async getSeats(eventId: string): Promise<SeatData[]> {
//     const seats = await this.client.lrangeAsync(`${eventId}:seats`, 0, -1);
//     return seats.map((seat) => JSON.parse(seat));
//   }

//   async reserveSeat(
//     eventId: string,
//     seatId: string,
//     userId: string,
//   ): Promise<void> {
//     const seatData: ReservationData = { seatId, userId, status: 'reserved' };
//     await this.client.lpushAsync(
//       `${eventId}:reservations`,
//       JSON.stringify(seatData),
//     );
//   }

//   async getReservations(eventId: string): Promise<ReservationData[]> {
//     const reservations = await this.client.lrangeAsync(
//       `${eventId}:reservations`,
//       0,
//       -1,
//     );
//     return reservations.map((reservation) => JSON.parse(reservation));
//   }

//   async cancelReservation(
//     eventId: string,
//     reservationId: string,
//   ): Promise<void> {
//     await this.client.lremAsync(`${eventId}:reservations`, 0, reservationId);
//   }
// }

// const redisClient = new RedisUtility();

// export default redisClient;

import Redis from 'ioredis';

class RedisClient {
  private static instance: RedisClient;

  private client;

  private constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async set(key: string, value: string, expire?: number): Promise<void> {
    if (expire) {
      await this.client.set(key, value, 'EX', expire);
    } else {
      await this.client.set(key, value);
    }
  }

  public async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  public async getValuesByKeys(pattern: string) {
    const keys = await this.client.keys(pattern);
    const values = await this.client.mget(...keys);

    // Combine keys and values into an object
    return keys.reduce((acc, key, index) => {
      acc[key] = values[index];
      return acc;
    }, {});
  }

  public async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  public async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
  }

  public async setMultiple(
    pairs: { key: string; value: string; expire?: number }[],
  ): Promise<any[]> {
    const pipeline = this.client.pipeline();
    pairs.forEach((pair) => {
      if (pair.expire) {
        pipeline.set(pair.key, pair.value, 'EX', pair.expire);
      } else {
        pipeline.set(pair.key, pair.value);
      }
    });
    return pipeline.exec();
  }
}

export default RedisClient;
