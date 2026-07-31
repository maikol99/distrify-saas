import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductDto } from './products.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['shopId'] as const),
) {}
