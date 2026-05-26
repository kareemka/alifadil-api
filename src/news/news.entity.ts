import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  slug: string | null;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  seoImage: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })

  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
