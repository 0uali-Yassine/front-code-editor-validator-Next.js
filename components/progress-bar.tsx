import type React from "react"

interface ProgressBarProps {
  percentage: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className="bg-gray-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
    </div>
  )
}

export default ProgressBar
