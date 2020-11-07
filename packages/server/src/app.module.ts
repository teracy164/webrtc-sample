import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GLOBAL_PREFIX } from './shared/constants/config.constants';
import { ConnectionGateway } from './gateways/connection.gateway';

@Module({
  imports: [
    ServeStaticModule.forRoot({
        rootPath: join(__dirname, '../../', 'client/dist/client'),
        exclude: [`/${GLOBAL_PREFIX}*`],
      }),
  ],
  controllers: [AppController],
  providers: [AppService, ConnectionGateway],
})
export class AppModule {}