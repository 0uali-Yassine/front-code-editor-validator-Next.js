import type React from "react"
import type { ExerciseSection } from "../types/dashboard"
import StatusPill from "./status-pill"
import ProgressBar from "./progress-bar"

interface ExerciseSectionCardProps {
  section: ExerciseSection
}

const ExerciseSectionCard: React.FC<ExerciseSectionCardProps> = ({ section }) => {
  const percentage = Math.round((section.submitted / section.total) * 100)

  return (
    <div className="bg-white rounded-lg border border-red-200 p-4 shadow-sm">
      <h3 className="text-lg font-medium mb-2">{section.title}</h3>
      <div className="flex items-center mb-2">
        <span className="text-gray-500 mr-1">👤</span>
        <span>
          {section.submitted} / {section.total} submitted
        </span>
        <span className="ml-auto">{percentage}%</span>
      </div>
      <ProgressBar percentage={percentage} />
      <div className="flex justify-between mt-4 gap-2">
        <StatusPill type="pending" count={section.status.pending} />
        <StatusPill type="redo" count={section.status.redo} />
        <StatusPill type="pass" count={section.status.pass} />
      </div>
    </div>
  )
}

export default ExerciseSectionCard
