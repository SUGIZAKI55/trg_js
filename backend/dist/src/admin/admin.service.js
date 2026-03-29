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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const learning_log_entity_1 = require("../entities/learning-log.entity");
let AdminService = class AdminService {
    constructor(logRepository) {
        this.logRepository = logRepository;
    }
    async getAllLogs(currentUser) {
        const logs = await this.logRepository.find({
            where: currentUser.role !== 'MASTER' ? { user: { company: { id: currentUser.companyId } } } : {},
            relations: ['user', 'user.company', 'question'],
            order: { learned_at: 'DESC' }
        });
        return logs.map((log) => ({
            date: log.learned_at.toLocaleDateString('ja-JP'),
            name: log.user?.username || '',
            genre: log.question?.genre || '',
            question_id: log.question?.id || 0,
            question_title: log.question?.title || '',
            user_choice: [],
            correct_answers: log.question?.answer ? [log.question.answer] : [],
            result: log.is_correct ? '正解' : '不正解',
            kaisetsu: '',
            start_time: null,
            end_time: log.learned_at.toLocaleTimeString('ja-JP'),
            elapsed_time: null,
        }));
    }
    getRolePermissions() {
        const roles = [
            {
                role: 'MASTER',
                displayName: 'マスター管理者',
                icon: '👑',
                description: '最高権限。全システム機能にアクセス可能',
                features: [
                    { name: 'ユーザー管理', accessible: true, description: '全ユーザーの作成・編集・削除' },
                    { name: '会社管理', accessible: true, description: '全会社の管理' },
                    { name: '問題管理', accessible: true, description: '全問題の作成・編集・削除' },
                    { name: 'ログ閲覧', accessible: true, description: '全ユーザーのログ閲覧' },
                    { name: '分析', accessible: true, description: '全システム分析' },
                    { name: 'セキュリティ設定', accessible: true, description: 'システムセキュリティ設定' },
                ],
                actions: [
                    'ユーザー作成・編集・削除',
                    '会社作成・編集',
                    '問題作成・編集・削除',
                    'ログ全閲覧',
                    '学習分析（全ユーザー）',
                    'システム設定変更',
                    '権限管理',
                ],
            },
            {
                role: 'ADMIN',
                displayName: '管理者',
                icon: '🔐',
                description: '会社内の管理権限。同じ会社のデータのみ管理可能',
                features: [
                    { name: 'ユーザー管理', accessible: true, description: '同じ会社のユーザーのみ作成・編集・削除' },
                    { name: '会社管理', accessible: false, description: '会社管理は不可' },
                    { name: '問題管理', accessible: true, description: '同じ会社の問題のみ作成・編集・削除' },
                    { name: 'ログ閲覧', accessible: true, description: '同じ会社のログのみ閲覧' },
                    { name: '分析', accessible: true, description: '同じ会社の分析のみ可能' },
                    { name: 'セキュリティ設定', accessible: false, description: 'セキュリティ設定は不可' },
                ],
                actions: [
                    'ユーザー作成・編集・削除（同社のみ）',
                    '問題作成・編集・削除（同社のみ）',
                    'ログ閲覧（同社のみ）',
                    '学習分析（同社のみ）',
                    'スタッフ管理',
                ],
            },
            {
                role: 'USER',
                displayName: 'ユーザー',
                icon: '👤',
                description: '一般ユーザー。自分の学習データのみアクセス可能',
                features: [
                    { name: 'ユーザー管理', accessible: false, description: 'ユーザー管理は不可' },
                    { name: '会社管理', accessible: false, description: '会社管理は不可' },
                    { name: '問題管理', accessible: false, description: '問題管理は不可' },
                    { name: 'ログ閲覧', accessible: true, description: '自分のログのみ閲覧' },
                    { name: '分析', accessible: true, description: '自分の学習分析のみ可能' },
                    { name: 'セキュリティ設定', accessible: false, description: 'セキュリティ設定は不可' },
                ],
                actions: [
                    'クイズ実施',
                    '自分の学習ログ閲覧',
                    '自分の学習分析閲覧',
                    '学習パターン診断',
                    'プロフィール編集',
                ],
            },
        ];
        return {
            roles,
            flow: {
                step: 1,
                title: 'ユーザーログイン',
                options: [
                    {
                        role: 'MASTER',
                        access: '全機能アクセス可',
                        features: ['全ユーザー管理', '会社管理', '問題管理', '全ログ閲覧', '全体分析'],
                    },
                    {
                        role: 'ADMIN',
                        access: '管理機能アクセス可',
                        features: ['同社ユーザー管理', '問題管理', '同社ログ閲覧', '同社分析'],
                    },
                    {
                        role: 'USER',
                        access: '個人機能のみアクセス可',
                        features: ['自分のログ閲覧', '自分の分析', 'クイズ実施'],
                    },
                ],
            },
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(learning_log_entity_1.LearningLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map