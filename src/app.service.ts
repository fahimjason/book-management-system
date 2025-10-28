import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    const appName = this.configService.get<string>('app.name');
    const port = this.configService.get<number>('PORT');
    return `Hello from ${appName} on port ${port}!`;
  }
}
