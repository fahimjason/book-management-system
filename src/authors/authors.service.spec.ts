import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthorsService } from './authors.service';
import { Author } from './entities/author.entity';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let repository: Repository<Author>;

  const mockAuthor: Author = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Test bio',
    birthDate: new Date('1980-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    books: [],
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: getRepositoryToken(Author),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    repository = module.get<Repository<Author>>(getRepositoryToken(Author));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new author', async () => {
      const createAuthorDto = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test bio',
        birthDate: '1980-01-01',
      };

      mockRepository.create.mockReturnValue(mockAuthor);
      mockRepository.save.mockResolvedValue(mockAuthor);

      const result = await service.create(createAuthorDto);

      expect(result).toEqual(mockAuthor);
      expect(mockRepository.create).toHaveBeenCalledWith(createAuthorDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockAuthor);
    });
  });

  describe('findAll', () => {
    it('should return paginated authors', async () => {
      const authors = [mockAuthor];
      mockRepository.findAndCount.mockResolvedValue([authors, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: authors,
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should filter by firstName', async () => {
      const authors = [mockAuthor];
      mockRepository.findAndCount.mockResolvedValue([authors, 1]);

      await service.findAll({ page: 1, limit: 10, firstName: 'John' });

      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an author by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockAuthor);

      const result = await service.findOne('1');

      expect(result).toEqual(mockAuthor);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['books'],
        select: {
          books: { 
            id: true, 
            title: true, 
            isbn: true, 
            genre: true, 
            publishedDate: true 
          },
        },
      });
    });

    it('should throw NotFoundException if author not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an author', async () => {
      const updateDto = { bio: 'Updated bio' };
      const updatedAuthor = { ...mockAuthor, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockAuthor);
      mockRepository.save.mockResolvedValue(updatedAuthor);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedAuthor);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an author without books', async () => {
      mockRepository.findOne.mockResolvedValue(mockAuthor);
      mockRepository.remove.mockResolvedValue(mockAuthor);

      await service.remove('1');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockAuthor);
    });

    it('should throw ConflictException if author has books', async () => {
      const authorWithBooks = { ...mockAuthor, books: [{ id: '1' }] };
      mockRepository.findOne.mockResolvedValue(authorWithBooks);

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if author not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});