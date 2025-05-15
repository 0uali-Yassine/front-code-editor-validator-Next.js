export interface UserType {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'manager';
  }
  
  export interface PageType {
    _id: string;
    title: string;
    description?: string;
  }
  
  export interface SectionType {
    _id: string;
    title: string;
    description: string;
    type: 'lecture' | 'exercise' | 'quiz';
  }
  
  export interface SectionWithCodeType {
    _id: string;
    userId: string;
    pageId: string;
    sectionId: string;
    code: string;
    isCorrect: 'Correct' | 'Incorrect' | 'Pending';
    createdAt: string;
    updatedAt: string;
}