import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Show } from './show.entity';

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show)
    private showsRepository: Repository<Show>,
  ) {}

  findAll(): Promise<Show[]> {
    return this.showsRepository.find({ order: { sortOrder: 'ASC', id: 'DESC' } });
  }

  async findAllPaginated(page: number, limit: number) {
    const [data, total] = await this.showsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { sortOrder: 'ASC', id: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: number): Promise<Show | null> {
    return this.showsRepository.findOne({ where: { id } });
  }

  async create(show: Partial<Show>): Promise<Show> {
    const newShow = this.showsRepository.create(show);
    return this.showsRepository.save(newShow);
  }

  async update(id: number, show: Partial<Show>): Promise<Show | null> {
    await this.showsRepository.update(id, show);
    return this.showsRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.showsRepository.delete(id);
  }
}
