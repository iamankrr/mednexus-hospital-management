import React, { useState } from 'react';

const HOSPITAL_TYPES = [
  { label: 'All',           value: 'all',           icon: '🏥', color: 'blue'   },
  { label: 'Government',    value: 'government',     icon: '🏛️', color: 'indigo' },
  { label: 'Private',       value: 'private',        icon: '🏥', color: 'blue'   },
  { label: 'Charitable',    value: 'charitable',     icon: '❤️', color: 'red'    },
  { label: 'Dental',        value: 'dental',         icon: '🦷', color: 'cyan'   },
  { label: 'Eye',           value: 'eye',            icon: '👁️', color: 'sky'    },
  { label: 'Cardiology',    value: 'cardiology',     icon: '💓', color: 'red'    },
  { label: 'Neurology',     value: 'neurology',      icon: '🧠', color: 'purple' },
  { label: 'Orthopedic',    value: 'orthopedic',     icon: '🦴', color: 'amber'  },
  { label: 'Maternity',     value: 'maternity',      icon: '🤱', color: 'pink'   },
  { label: 'Cancer',        value: 'cancer',         icon: '🎗️', color: 'rose'   },
  { label: 'General',       value: 'general',        icon: '🏥', color: 'green'  },
  { label: 'Psychiatric',   value: 'psychiatric',    icon: '🧘', color: 'violet' },
  { label: 'IVF/Fertility', value: 'ivf',            icon: '👶', color: 'pink'   },
  { label: 'Dermatology',   value: 'dermatology',    icon: '🩺', color: 'orange' },
  { label: 'Military',      value: 'military',       icon: '⚕️', color: 'green'  },
  { label: 'Multispecialty',value: 'multispecialty', icon: '🌟', color: 'yellow' },
];

// Show only first 8, rest in dropdown
const VISIBLE_COUNT = 8;

const HospitalTypeFilter = ({ selected = 'all', onChange }) => {
  const [showAll, setShowAll] = useState(false);

  const visibleTypes = showAll ? HOSPITAL_TYPES : HOSPITAL_TYPES.slice(0, VISIBLE_COUNT);

  const getButtonStyle = (type) => {
    const isSelected = selected === type.value;
    if (isSelected) {
      return 'bg-blue-600 text-white shadow-md scale-105 border-blue-600';
    }
    return 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50';
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-gray-600">🏥 Hospital Type:</span>
        {selected !== 'all' && (
          <button
            onClick={() => onChange('all')}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${getButtonStyle(type)}`}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}

        {/* More / Less button */}
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium border border-dashed border-gray-400 text-gray-600 hover:bg-gray-50 transition"
        >
          {showAll ? (
            <>▲ Less</>
          ) : (
            <>+ {HOSPITAL_TYPES.length - VISIBLE_COUNT} More</>
          )}
        </button>
      </div>

      {/* Selected type badge */}
      {selected !== 'all' && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-500">Showing:</span>
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {HOSPITAL_TYPES.find(t => t.value === selected)?.icon}{' '}
            {HOSPITAL_TYPES.find(t => t.value === selected)?.label} Hospitals
            <button
              onClick={() => onChange('all')}
              className="ml-1 text-blue-500 hover:text-blue-700 font-bold"
            >
              ×
            </button>
          </span>
        </div>
      )}
    </div>
  );
};

export { HOSPITAL_TYPES };
export default HospitalTypeFilter;
