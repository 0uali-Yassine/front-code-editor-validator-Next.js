import type React from "react"

interface StatusPillProps {
  type: "pending" | "redo" | "pass"
  count: number
}

const StatusPill: React.FC<StatusPillProps> = ({ type, count }) => {
  const getColor = () => {
    switch (type) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "redo":
        return "bg-red-50 text-red-700 border-red-200"
      case "pass":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getIcon = () => {
    switch (type) {
      case "pending":
        return "⏳"
      case "redo":
        return "↩️"
      case "pass":
        return "✓"
      default:
        return ""
    }
  }

  return (
    <div className={`flex items-center px-3 py-1 rounded-md border ${getColor()}`}>
      <span className="mr-1">{getIcon()}</span>
      <span className="mr-2">{type}</span>
      <span className="font-bold text-lg">{count}</span>
    </div>
  )
}

export default StatusPill
