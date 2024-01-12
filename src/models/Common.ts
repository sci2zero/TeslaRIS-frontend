export interface Page<Type> {
    content: Type[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}