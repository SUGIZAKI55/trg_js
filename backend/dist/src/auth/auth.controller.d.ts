import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        token: string;
        username: any;
        role: any;
        userId: any;
        companyId: any;
        company: {
            name: any;
        };
    }>;
    getProfile(req: any): any;
    impersonate(body: {
        userId: number;
    }): Promise<{
        token: string;
        username: string;
        role: string;
        companyId: number;
        company: {
            name: string;
        };
    }>;
}
