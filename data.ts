import type { DashboardData } from "./types/dashboard"

export const mockDashboardData: DashboardData = {
  title: "Introduction to python",
  totalStudents: 3,
  exerciseSections: [
    {
      title: "Exercises",
      submitted: 1,
      total: 3,
      status: {
        pending: 0,
        redo: 1,
        pass: 0,
      },
    },
    {
      title: "Exercises XP Gold",
      submitted: 1,
      total: 3,
      status: {
        pending: 1,
        redo: 0,
        pass: 0,
      },
    },
    {
      title: "Exercises XP Ninja",
      submitted: 0,
      total: 3,
      status: {
        pending: 0,
        redo: 0,
        pass: 0,
      },
    },
  ],
  overallCompletion: 22,
}
