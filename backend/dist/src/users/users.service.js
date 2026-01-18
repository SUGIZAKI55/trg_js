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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async findOneByUsername(username) {
        return this.usersRepository.findOne({
            where: { username },
            relations: ['company']
        });
    }
    async findAll(currentUser) {
        console.log('--- UserList Access Debug ---');
        console.log('Current User:', currentUser);
        const role = currentUser.role ? String(currentUser.role).toUpperCase() : '';
        console.log('Normalized Role:', role);
        if (role === 'MASTER') {
            return this.usersRepository.find({
                relations: ['company', 'department', 'section'],
            });
        }
        else {
            return this.usersRepository.find({
                where: {
                    company: { id: currentUser.companyId }
                },
                relations: ['company', 'department', 'section'],
            });
        }
    }
    async findOne(id) {
        return this.usersRepository.findOne({
            where: { id },
            relations: ['company', 'department', 'section']
        });
    }
    async create(createUserDto) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password || 'password123', salt);
        const normalizedRole = createUserDto.role ? createUserDto.role.toUpperCase() : 'USER';
        const newUser = this.usersRepository.create({
            ...createUserDto,
            role: normalizedRole,
            password: hashedPassword,
        });
        return this.usersRepository.save(newUser);
    }
    async remove(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`ID ${id} のユーザーは見つかりません。`);
        }
        await this.usersRepository.delete(id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map