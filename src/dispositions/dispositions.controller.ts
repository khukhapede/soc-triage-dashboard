import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { DispositionsService } from './dispositions.service';
import { CreateDispositionDto } from './dto/create-disposition.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('alerts/:id/disposition')
@UseGuards(JwtAuthGuard)
export class DispositionsController {
    constructor(private readonly dispositionsService: DispositionsService) { }

    @Post()
    setDisposition(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: CreateDispositionDto,
        @GetUser('username') username: string,
    ) {
        return this.dispositionsService.setDisposition(id, dto, username);
    }
}