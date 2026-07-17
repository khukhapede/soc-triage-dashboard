import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { DispositionsService } from './dispositions.service';
import { CreateDispositionDto } from './dto/create-disposition.dto';

@Controller('alerts/:id/disposition')
export class DispositionsController {
    constructor(private readonly dispositionsService: DispositionsService) { }

    @Post()
    setDisposition(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: CreateDispositionDto,
    ) {
        return this.dispositionsService.setDisposition(id, dto);
    }
}