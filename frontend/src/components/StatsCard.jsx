import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function StatsCard({ title, value, icon, color, description, progress, isAlert = false }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={clsx(
        "bg-white rounded-2xl shadow-sm p-6 border transition-all",
        isAlert ? "border-rose-200 bg-rose-50/30" : "border-gray-100"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-black text-gray-900">{value}</h3>
          
          {description && (
            <p className="text-xs text-gray-500 mt-2 font-medium">{description}</p>
          )}

          {progress !== undefined && (
            <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={clsx("h-full", colorMap[color]?.split(' ')[1].replace('text-', 'bg-'))}
              />
            </div>
          )}
        </div>
        <div className={clsx("p-3 rounded-xl flex-shrink-0", colorMap[color] || colorMap.blue)}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
