import { Controller, Get, Param, ParseUUIDPipe, UseGuards, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { QueryAlertsDto } from './dto/query-alerts.dto';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) { }

    @Get()
    findAll(@Query() query: QueryAlertsDto) {
        return this.alertsService.findAll(query.page ?? 1, query.limit ?? 20);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.alertsService.findOne(id);
    }
}