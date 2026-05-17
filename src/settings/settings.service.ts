import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './setting.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  async onModuleInit() {
    const count = await this.settingsRepository.count();
    if (count === 0) {
      const defaultSetting = this.settingsRepository.create({
        storeEmail: 'contact@ali-fadhil.com',
        facebook: '',
        instagram: '',
        twitter: '',
        discord: '',
        whatsapp: '',
      });
      await this.settingsRepository.save(defaultSetting);
    }
  }

  async findAll(): Promise<Setting> {
    const settings = await this.settingsRepository.find();
    return settings[0];
  }

  async update(data: Partial<Setting>): Promise<Setting> {
    const settings = await this.findAll();
    const updated = this.settingsRepository.merge(settings, data);
    return await this.settingsRepository.save(updated);
  }
}
