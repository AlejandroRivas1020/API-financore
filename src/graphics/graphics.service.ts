import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { EarningsService } from 'src/earnings/earnings.service';

@Injectable()
export class GraphicsService {
  constructor(private readonly earningService: EarningsService) {}

  async broadcastEarnings(server: Server) {
    const earningsData = await this.earningService.getEarningsData();
    server.emit('earningsUpdate', earningsData);
  }
}
