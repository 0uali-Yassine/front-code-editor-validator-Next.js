import type React from "react"

interface StatsCardProps {
  icon?: string
  title: string
  value: number | string
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start">
        {icon && <span className="text-2xl mr-2">{icon}</span>}
        <div>
          <h3 className="text-gray-500 text-sm">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default StatsCard
