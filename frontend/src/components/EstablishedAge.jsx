import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

const EstablishedAge = ({ createdAt, themeColor = '#1E40AF' }) => {
  if (!createdAt) return null;

  const calculateAge = () => {
    const created = new Date(createdAt);
    const now = new Date();
    
    const years = now.getFullYear() - created.getFullYear();
    const months = now.getMonth() - created.getMonth();
    const days = now.getDate() - created.getDate();

    let totalYears = years;
    let totalMonths = months;
    let totalDays = days;

    if (totalDays < 0) {
      totalMonths--;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      totalDays += lastMonth.getDate();
    }

    if (totalMonths < 0) {
      totalYears--;
      totalMonths += 12;
    }

    // Format output
    if (totalYears > 0) {
      return {
        value: totalYears,
        unit: totalYears === 1 ? 'year' : 'years',
        detailed: totalMonths > 0 ? `${totalYears}y ${totalMonths}m` : `${totalYears}y`
      };
    } else if (totalMonths > 0) {
      return {
        value: totalMonths,
        unit: totalMonths === 1 ? 'month' : 'months',
        detailed: totalDays > 0 ? `${totalMonths}m ${totalDays}d` : `${totalMonths}m`
      };
    } else {
      return {
        value: totalDays,
        unit: totalDays === 1 ? 'day' : 'days',
        detailed: `${totalDays}d`
      };
    }
  };

  const age = calculateAge();

  return (
    <div 
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
      style={{ 
        backgroundColor: `${themeColor}10`,
        borderColor: `${themeColor}30`,
        color: themeColor
      }}
    >
      <FaCalendarAlt />
      <span>
        Established <strong>{age.value} {age.unit}</strong> ago
      </span>
    </div>
  );
};

export default EstablishedAge;