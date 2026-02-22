export declare class CompanyType {
    id: number;
    name: string;
    is_active: boolean;
    departments?: DepartmentType[];
    users?: any[];
    courses?: any[];
}
export declare class DepartmentType {
    id: number;
    name: string;
    company_id: number;
    sections?: SectionType[];
}
export declare class SectionType {
    id: number;
    name: string;
    department_id: number;
}
