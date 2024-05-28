export interface IReservation {
  id: string;
  seatId: string;
  userId: string;
  eventId: string;
  expirationAt: Date;
  isClaimed: boolean;
}
