import { Repository } from 'typeorm';
import { Genre } from '../entities/genre.entity';
import { Question } from '../entities/question.entity';
export declare class GenresService {
    private readonly genreRepository;
    private readonly questionRepository;
    constructor(genreRepository: Repository<Genre>, questionRepository: Repository<Question>);
    findAll(): Promise<Genre[]>;
    create(name: string, description?: string): Promise<Genre>;
    update(id: number, name?: string, description?: string): Promise<Genre>;
    remove(id: number): Promise<void>;
}
