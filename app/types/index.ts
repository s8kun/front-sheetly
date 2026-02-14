export interface Sheet {
    id: number;
    user_id?: number;
    title: string;
    type: string;
    file_url: string;
    downloads_count: number;
    status?: 'pending' | 'approved' | 'rejected';
    chapter_number?: number;
    created_at: string;
    subject_id?: number;
}

export interface Subject {
    id: number;
    code: string;
    name: string;
    chaptersCount?: number;
    color?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface SubjectData {
    subject: Subject;
    chapters: any[];
    midterms: Sheet[];
    finals: Sheet[];
}
