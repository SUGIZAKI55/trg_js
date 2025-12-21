import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        token: string;
        username: any;
        role: any;
        companyId: any;
        userId: any;
    }>;
    getProfile(req: any): any;
    impersonate(body: {
        userId: number;
    }): Promise<{
        token: string;
        username: string;
        role: string;
        companyId: number;
    }>;
}
