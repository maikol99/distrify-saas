import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovements, StockMovementsSchema } from './stock-movements.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockMovements.name, schema: StockMovementsSchema },
    ]),
  ],
  controllers: [StockMovementsController],
  providers: [StockMovementsService],
  exports: [StockMovementsService],
})
export class StockMovementsModule {}
