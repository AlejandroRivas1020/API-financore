import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { GraphicsScheduler } from './graphics.scheduler';

@Controller('graphics')
export class GraphicsController {
  constructor(private readonly graphicsScheduler: GraphicsScheduler) {}

  @Get('broadcast')
  @HttpCode(HttpStatus.OK)
  async triggerBroadcastOnce() {
    try {
      const result = await this.graphicsScheduler.broadcastOnce();
      return {
        status: 200,
        data: result,
        message: 'Broadcasting executed successfully.',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'An error occurred during broadcasting.',
        error: error.message,
      };
    }
  }
}
