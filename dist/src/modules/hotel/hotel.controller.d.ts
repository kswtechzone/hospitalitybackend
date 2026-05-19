import { HotelService } from './hotel.service';
export declare class HotelController {
    private readonly hotelService;
    constructor(hotelService: HotelService);
    createHotel(data: any, req: any): Promise<any>;
    getHotels(req: any): Promise<any>;
    addRoom(data: any, req: any): Promise<any>;
    getRooms(hotelId: string): Promise<any>;
    createBooking(data: any, req: any): Promise<any>;
    getRoomBookings(roomId: string): Promise<any>;
    getRecentBookings(req: any): Promise<any>;
}
