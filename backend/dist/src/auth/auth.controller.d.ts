import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        token: string;
        username: string;
        role: string;
    }>;
    impersonate(body: any): Promise<{
        token: string;
        username: string;
        role: string;
    }>;
}
