import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Backstage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image: string;

  @Column({ nullable: true })
  title: string;

  @CreateDateColumn()
  createdAt: Date;
}
