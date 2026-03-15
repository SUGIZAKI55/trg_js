import { CompanyType } from './company.type';
import { LearningLogType } from './learning-log.type';
export declare class CompanyInfo {
    name: string;
}
export declare class UserType {
    id: number;
    username: string;
    role: string;
    company: CompanyType;
    companyId: number;
    department?: any;
    section?: any;
    learningLogs?: LearningLogType[];
}
export declare class AuthPayload {
    token: string;
    user: UserType;
    userId: number;
    username: string;
    role: string;
    companyId: number;
    company?: CompanyInfo;
}
