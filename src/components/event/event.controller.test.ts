import { agent as request } from 'supertest';
import httpStatus from 'http-status';
import app from '@app';
import AppError from '@core/utils/appError';

const createEvent = jest.fn();
const updateEvent = jest.fn();
const deleteEvent = jest.fn();

const eventMock = {
  name: 'New Event',
  totalSeats: 100,
  dateTime: new Date().toISOString(),
};

const noDataEventMock = {};

// mock api key middleware to pass the test
jest.mock('@core/middlewares/apiKey.middleware', () =>
  jest.fn((req: Request, res: Response, next) => next()),
);

jest.mock('@components/event/event.service', () => ({
  create: () => createEvent(),
  update: () => updateEvent(),
  delete: () => deleteEvent(),
}));

describe('Event API', () => {
  describe('Create Event [POST] /event/', () => {
    test('should return 201 status if event is created succesfully', async () => {
      await request(app)
        .post('/api/event')
        .send(eventMock)
        .expect(httpStatus.CREATED);
    });

    test('should return 400 status with validation error message if missing event data', async () => {
      const res = await request(app)
        .post('/api/event')
        .send(noDataEventMock)
        .expect(httpStatus.BAD_REQUEST);
      expect(res.body.error).toContain('is required');
    });

    test('should return 400 status with error message if something went wrong with creating event', async () => {
      const ERROR_MESSAGE = 'Event was not created!';
      createEvent.mockImplementation(() => {
        throw new AppError(httpStatus.BAD_GATEWAY, ERROR_MESSAGE);
      });
      const res = await request(app)
        .post('/api/event')
        .send(eventMock)
        .expect(httpStatus.BAD_GATEWAY);
      expect(res.body.message).toBe(ERROR_MESSAGE);
    });
  });
});
