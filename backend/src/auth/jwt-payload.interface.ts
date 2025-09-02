export interface JwtPayload {
    name: string;
    role: string;
    userId: string;
    companyId?: string;
    studentId?: string;
}