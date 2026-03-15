"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenresService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const genre_entity_1 = require("../entities/genre.entity");
const question_entity_1 = require("../entities/question.entity");
let GenresService = class GenresService {
    constructor(genreRepository, questionRepository) {
        this.genreRepository = genreRepository;
        this.questionRepository = questionRepository;
    }
    async findAll() {
        return this.genreRepository.find({ order: { name: 'ASC' } });
    }
    async create(name, description) {
        if (!name || name.trim() === '') {
            throw new common_1.BadRequestException('ジャンル名は必須です');
        }
        const existing = await this.genreRepository.findOne({ where: { name } });
        if (existing) {
            throw new common_1.BadRequestException('このジャンルは既に存在します');
        }
        const genre = this.genreRepository.create({ name, description });
        return this.genreRepository.save(genre);
    }
    async update(id, name, description) {
        const genre = await this.genreRepository.findOne({ where: { id } });
        if (!genre)
            throw new common_1.NotFoundException('ジャンルが見つかりません');
        if (name)
            genre.name = name;
        if (description !== undefined)
            genre.description = description;
        return this.genreRepository.save(genre);
    }
    async remove(id) {
        const genre = await this.genreRepository.findOne({ where: { id } });
        if (!genre)
            throw new common_1.NotFoundException('ジャンルが見つかりません');
        const usageCount = await this.questionRepository.count({
            where: { genre: genre.name },
        });
        if (usageCount > 0) {
            throw new common_1.BadRequestException(`このジャンルは${usageCount}個の問題で使用されているため削除できません`);
        }
        await this.genreRepository.remove(genre);
    }
};
exports.GenresService = GenresService;
exports.GenresService = GenresService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(genre_entity_1.Genre)),
    __param(1, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GenresService);
//# sourceMappingURL=genres.service.js.map