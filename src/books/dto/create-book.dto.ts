import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsUUID,
  IsISBN,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsISBN(13, { message: 'ISBN must be a valid 13-digit number' })
  @IsNotEmpty()
  isbn: string;

  @IsDateString()
  @IsOptional()
  publishedDate?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsUUID()
  @IsNotEmpty()
  authorId: string;
}
