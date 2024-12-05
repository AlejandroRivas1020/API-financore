import { Injectable } from '@nestjs/common';
import { EarningGateway } from 'src/common/gateways/earnings.gateway';

@Injectable()
export class GraphicsScheduler {
  constructor(private readonly earningGateway: EarningGateway) {}

  async broadcastOnce() {
    try {
      const data = await this.earningGateway.calculateEarningsData();
      console.log('Broadcasting data:', data);
      return data;
    } catch (error) {
      console.error('Error broadcasting data:', error);
      throw error;
    }
  }

  startBroadcasting(interval: number = 10000) {
    setInterval(async () => {
      try {
        const data = await this.earningGateway.calculateEarningsData();
        console.log('Processed Earnings Data (Periodic):', data);
      } catch (error) {
        console.error('Error broadcasting earnings data (Periodic):', error);
      }
    }, interval);
  }
}
