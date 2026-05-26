import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commercial } from './commercial.entity';

@Injectable()
export class CommercialsService {
  constructor(
    @InjectRepository(Commercial)
    private commercialsRepository: Repository<Commercial>,
  ) {}

  findAll(): Promise<Commercial[]> {
    return this.commercialsRepository.find({
      order: { sortOrder: 'ASC', id: 'DESC' },
    });
  }

  async findAllPaginated(page: number, limit: number) {
    const [data, total] = await this.commercialsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { sortOrder: 'ASC', id: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: number): Promise<Commercial | null> {
    return this.commercialsRepository.findOne({ where: { id } });
  }

  async create(commercial: Partial<Commercial>): Promise<Commercial> {
    const entity = this.commercialsRepository.create(commercial);
    return this.commercialsRepository.save(entity);
  }

  async update(id: number, commercial: Partial<Commercial>): Promise<Commercial | null> {
    await this.commercialsRepository.update(id, commercial);
    return this.commercialsRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.commercialsRepository.delete(id);
  }
}
