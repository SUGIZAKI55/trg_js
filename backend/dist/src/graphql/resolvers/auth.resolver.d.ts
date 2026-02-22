import { AuthService } from '../../auth/auth.service';
import { AuthPayload } from '../types/user.type';
export declare class AuthResolver {
    private authService;
    constructor(authService: AuthService);
    login(username: string, password: string): Promise<AuthPayload>;
    me(context: any): Promise<any>;
}
