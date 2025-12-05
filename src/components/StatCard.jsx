// src/components/StatCard.jsx
import React from "react";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center">
      <div className={`shrink-0 p-3 rounded-md ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd>
            <div className="text-lg font-medium text-gray-900">{value}</div>
          </dd>
        </dl>
      </div>
    </div>
  </div>
);

export default StatCard;
