export interface ISeat {
  id: string;
  eventId: string;
  seatNumber: number;
  isHold?: boolean;
  isBooked: boolean;
  bookedBy: string;
  bookedAt: string;
}
