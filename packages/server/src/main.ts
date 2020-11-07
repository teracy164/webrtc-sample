import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GLOBAL_PREFIX } from './shared/constants/config.constants';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // APIのURLが/apiとなるようにプレフィクスを設定
    app.setGlobalPrefix(GLOBAL_PREFIX);

    await app.listen(3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
