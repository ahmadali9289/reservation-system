import request from 'supertest';
import app from '@app'; // import your Express app
import httpStatus from 'http-status';
import { ISeat } from './seat.interface'; // import your ISeat interface

describe('Seat Controller', () => {
  it('should create a seat', async () => {
    const eventId = '1';
    await request(app)
      .post(`/api/event/${eventId}/seats`)
      .set('x-api-key', 'token')
      .send({
        eventId,
        seatNumber: 1,
        isBooked: false,
        bookedBy: 'Ahmad',
      })
      .expect(httpStatus.CREATED);

    // read the event created
    await request(app).get(`/api/event/${eventId}/seats`).expect(httpStatus.OK);
  });

  it('should reserve a seat', async () => {
    const eventId = '1';
    const seatId = '1';
    await request(app)
      .post(`/api/event/${eventId}/seat/${seatId}/reserve`)
      .set('x-api-key', 'token')
      .expect(httpStatus.OK);

    // read the event created
    const res2 = await request(app)
      .get(`/api/event/${eventId}/seats/${seatId}`)
      .expect(httpStatus.OK);

    console.log(res2.body);
  });

  // it('should read all event seats', async () => {
  //   const eventId = '1';
  //   const res = await request(app)
  //     .get(`/api/seats/${eventId}`)
  //     .expect(httpStatus.OK);

  //   expect(res.body).toHaveProperty('message', 'Read');
  //   expect(res.body).toHaveProperty('output');
  // });

  // it('should update a seat', async () => {
  //   const seat: ISeat = {
  //     // your seat data
  //   };
  //   const res = await request(app)
  //     .put('/api/seats')
  //     .send(seat)
  //     .expect(httpStatus.OK);

  //   expect(res.body).toHaveProperty('message', 'Updated');
  // });
});
