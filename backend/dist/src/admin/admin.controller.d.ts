import { AdminService, QuizLogEntry, RoleFlowData } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getLogs(req: any): Promise<QuizLogEntry[]>;
    getRoles(): RoleFlowData;
}
