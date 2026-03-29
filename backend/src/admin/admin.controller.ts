import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AdminService, QuizLogEntry, RoleFlowData } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 全ログを取得（LogViewer用）
   * GET /api/admin/logs
   */
  @Get('logs')
  async getLogs(@Request() req): Promise<QuizLogEntry[]> {
    return this.adminService.getAllLogs(req.user);
  }

  /**
   * ロール権限情報を取得（ロール判定フロー用）
   * GET /api/admin/roles
   */
  @Get('roles')
  getRoles(): RoleFlowData {
    return this.adminService.getRolePermissions();
  }
}
