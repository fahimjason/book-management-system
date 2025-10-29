import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import { AuthorsService } from '../authors/authors.service';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    private authorsService: AuthorsService,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    try {
      await this.authorsService.findOne(createBookDto.authorId);
    } catch (error) {
      throw new BadRequestException(
        `Author with ID ${createBookDto.authorId} does not exist`,
      );
    }

    const existingBook = await this.booksRepository.findOne({
      where: { isbn: createBookDto.isbn },
    });

    if (existingBook) {
      throw new ConflictException(
        `Book with ISBN ${createBookDto.isbn} already exists`,
      );
    }

    const book = this.booksRepository.create(createBookDto);
    return await this.booksRepository.save(book);
  }

  async findAll(
    query: QueryBookDto,
  ): Promise<{ data: Book[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, title, isbn, authorId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (title) {
      where.title = ILike(`%${title}%`);
    }
    if (isbn) {
      where.isbn = ILike(`%${isbn}%`);
    }
    if (authorId) {
      where.authorId = authorId;
    }

    const [data, total] = await this.booksRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['author'],
      select: {
        author: {
          id: true,
          firstName: true,
          lastName: true,
          bio: true,
        },
      },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: ['author'],
      select: {
        author: {
          id: true,
          firstName: true,
          lastName: true,
          bio: true,
          birthDate: true,
        },
      }
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    if (updateBookDto.authorId) {
      try {
        await this.authorsService.findOne(updateBookDto.authorId);
      } catch (error) {
        throw new BadRequestException(
          `Author with ID ${updateBookDto.authorId} does not exist`,
        );
      }
    }

    if (updateBookDto.isbn && updateBookDto.isbn !== book.isbn) {
      const existingBook = await this.booksRepository.findOne({
        where: { isbn: updateBookDto.isbn },
      });

      if (existingBook) {
        throw new ConflictException(
          `Book with ISBN ${updateBookDto.isbn} already exists`,
        );
      }
    }

    Object.assign(book, updateBookDto);
    return await this.booksRepository.save(book);
  }

  async remove(id: string): Promise<void> {
    const book = await this.findOne(id);

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    await this.booksRepository.remove(book);
  }
}
