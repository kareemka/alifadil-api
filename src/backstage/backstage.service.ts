import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Backstage } from './backstage.entity';

@Injectable()
export class BackstageService {
  constructor(
    @InjectRepository(Backstage)
    private readonly backstageRepository: Repository<Backstage>,
  ) {}

  findAll(limit?: number): Promise<Backstage[]> {
    return this.backstageRepository.find({
      order: { createdAt: 'DESC' },
      ...(limit ? { take: limit } : {}),
    });
  }

  async findAllPaginated(page: number, limit: number) {
    const [data, total] = await this.backstageRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data: Partial<Backstage>): Promise<Backstage> {
    const backstage = this.backstageRepository.create(data);
    return this.backstageRepository.save(backstage);
  }

  findOne(id: number): Promise<Backstage | null> {
    return this.backstageRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.backstageRepository.delete(id);
  }
}
