import type React from "react"
import type { DashboardData } from "../types/dashboard"
import StatsCard from "./stats-card"
import ExerciseSectionCard from "./exercise-section-card"
import ProgressBar from "./progress-bar"
import { useRouter } from "next/router"

interface DashboardProps {
  data: DashboardData
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
   const router = useRouter()

    const logOut = async () => {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
          });
          
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            router.push('/');
          }
        } catch (error) {
          console.error('Logout error:', error);
        }
      };
  return (
    <div className="max-w-5xl mx-auto p-6">
        <button onClick={logOut} className='bg-red-500 hover:bg-red-400 px-4 py-2 rounded text-white'>
            Log out
          </button>
          <h1 className="text-center bg-red-300 p-3 m-2 rounded-md border-2 border-red-500">it just overview of progress Not part of checker because i use AI</h1>
      <h1 className="text-3xl font-bold mb-6">{data.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard icon="👥" title="Total Students" value={data.totalStudents} />
        <StatsCard icon="3️⃣" title="Exercise Sections" value={data.exerciseSections.length} />
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-gray-500 text-sm">Overall Completion</h3>
          <p className="text-2xl font-bold mb-2">{data.overallCompletion}%</p>
          <ProgressBar percentage={data.overallCompletion} />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Exercise Sections</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.exerciseSections.map((section, index) => (
          <ExerciseSectionCard key={index} section={section} />
        ))}
      </div>
    </div>
  )
}

export default Dashboard
