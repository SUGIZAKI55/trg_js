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
exports.GenresController = void 0;
const common_1 = require("@nestjs/common");
const genres_service_1 = require("./genres.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let GenresController = class GenresController {
    constructor(genresService) {
        this.genresService = genresService;
    }
    findAll() {
        return this.genresService.findAll();
    }
    create(body, req) {
        const role = req.user?.role?.toUpperCase();
        if (role !== 'MASTER' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
            throw new Error('ジャンル作成権限がありません');
        }
        return this.genresService.create(body.name, body.description);
    }
    update(id, body, req) {
        const role = req.user?.role?.toUpperCase();
        if (role !== 'MASTER' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
            throw new Error('ジャンル更新権限がありません');
        }
        return this.genresService.update(+id, body.name, body.description);
    }
    remove(id, req) {
        const role = req.user?.role?.toUpperCase();
        if (role !== 'MASTER') {
            throw new Error('ジャンル削除権限がありません');
        }
        return this.genresService.remove(+id);
    }
};
exports.GenresController = GenresController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenresController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], GenresController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], GenresController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GenresController.prototype, "remove", null);
exports.GenresController = GenresController = __decorate([
    (0, common_1.Controller)('api/genres'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [genres_service_1.GenresService])
], GenresController);
//# sourceMappingURL=genres.controller.js.map