import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { EarningsService } from 'src/earnings/earnings.service';
import { parseMoney } from '../utils/typeMoney-validation.service';

@Injectable()
@WebSocketGateway({ cors: true })
export class EarningGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EarningGateway');

  constructor(private readonly earningService: EarningsService) {}

  async calculateEarningsData() {
    try {
      const earnings = await this.earningService.getEarningsData();

      const processedEarnings = earnings.map((earning) => {
        const generalAmountParsed = parseMoney(earning.generalAmount);
        const amountBudgetedParsed = parseMoney(earning.amountBudgeted);
        const amountAvailable = generalAmountParsed - amountBudgetedParsed;
        const percentageBudgeted =
          (amountBudgetedParsed / generalAmountParsed) * 100;
        const percentageAvailable =
          (amountAvailable / generalAmountParsed) * 100;

        return {
          ...earning,
          amountAvailable,
          percentageBudgeted: parseFloat(percentageBudgeted.toFixed(2)),
          percentageAvailable: parseFloat(percentageAvailable.toFixed(2)),
        };
      });

      return processedEarnings;
    } catch (error) {
      this.logger.error('Error calculating earnings data:', error);
      throw error;
    }
  }

  @SubscribeMessage('getAmountsEvent')
  async handleEarningsUpdate() {
    this.logger.log('Handling WebSocket event for earnings update.');
    try {
      const processedEarnings = await this.calculateEarningsData();
      this.server.emit('earningsUpdate', processedEarnings);
      return processedEarnings;
    } catch (error) {
      this.logger.error('Error handling earnings update:', error);
      return { error: 'Failed to process earnings data.' };
    }
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Server Initialized');
  }

  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
