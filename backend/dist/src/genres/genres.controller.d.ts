import { GenresService } from './genres.service';
export declare class GenresController {
    private readonly genresService;
    constructor(genresService: GenresService);
    findAll(): Promise<import("../entities/genre.entity").Genre[]>;
    create(body: {
        name: string;
        description?: string;
    }, req: any): Promise<import("../entities/genre.entity").Genre>;
    update(id: string, body: {
        name?: string;
        description?: string;
    }, req: any): Promise<import("../entities/genre.entity").Genre>;
    remove(id: string, req: any): Promise<void>;
}
