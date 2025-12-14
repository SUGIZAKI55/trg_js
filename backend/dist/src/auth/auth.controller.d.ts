import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
        user: {
            username: any;
            sub: any;
            role: any;
        };
    }>;
    getProfile(req: any): any;
    impersonate(body: {
        userId: number;
    }): Promise<{
        access_token: string;
    }>;
}
