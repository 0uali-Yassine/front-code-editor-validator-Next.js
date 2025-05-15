export interface ExerciseStatus {
    pending: number
    redo: number
    pass: number
}
  
export interface ExerciseSection {
    title: string
    submitted: number
    total: number
    status: ExerciseStatus
}
  
  export interface DashboardData {
    title: string
    totalStudents: number
    exerciseSections: ExerciseSection[]
    overallCompletion: number
}
  