import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IngestionModule } from './ingestion/ingestion.module';
import { DatabaseModule } from './database/database.module';
import { AlertsModule } from './alerts/alerts.module';
import { DispositionsModule } from './dispositions/dispositions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    IngestionModule,
    AlertsModule,
    DispositionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }