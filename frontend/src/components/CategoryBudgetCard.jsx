import React from 'react';
import { formatNaira } from '../lib/utils';

export default function CategoryBudgetCard({ category, onEdit }) {
  const { name, icon, spent, total, color = "bg-blue-600" } = category;
  const percentage = total > 0 ? Math.round((spent / total) * 100) : 0;
  const isOverBudget = spent > total;

  return (
    <div className={`p-5 rounded-2xl border transition-all relative ${
      isOverBudget 
        ? 'bg-red-50/50 border-red-200 ring-1 ring-red-100' 
        : 'bg-white border-slate-100 hover:border-slate-200'
    }`}>
      {/* Edit Trigger Pen */}
      <button 
        onClick={onEdit} 
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        aria-label="Edit itemized category allocation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
        </svg>
      </button>

      {/* Meta Layout Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg border border-slate-100">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">{name}</h4>
          <p className="text-xs text-slate-400 font-medium">{percentage}% Used</p>
        </div>
      </div>

      {/* Numerical Data Rows */}
      <div className="flex items-baseline gap-1 mb-3 text-xs font-semibold">
        <span className={isOverBudget ? 'text-red-600' : 'text-slate-800'}>
          {formatNaira(spent)}
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-400">
          {formatNaira(total)}
        </span>
      </div>

      {/* Dynamic Cap Bar Slider */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-600' : color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}