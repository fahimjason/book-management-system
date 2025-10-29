import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Author } from './entities/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { QueryAuthorDto } from './dto/query-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private authorsRepository: Repository<Author>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorsRepository.create(createAuthorDto);
    return await this.authorsRepository.save(author);
  }

  async findAll(
    query: QueryAuthorDto,
  ): Promise<{ data: Author[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, firstName, lastName } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (firstName) {
      where.firstName = ILike(`%${firstName}%`);
    }
    if (lastName) {
      where.lastName = ILike(`%${lastName}%`);
    }

    const [data, total] = await this.authorsRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Author> {
    const author = await this.authorsRepository.findOne({
      where: { id }
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    return author;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);
    Object.assign(author, updateAuthorDto);
    return await this.authorsRepository.save(author);
  }

  async remove(id: string): Promise<void> {
    const author = await this.authorsRepository.findOne({
      where: { id }
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    await this.authorsRepository.remove(author);
  }
}
