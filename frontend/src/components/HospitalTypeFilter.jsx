import React, { useState } from 'react';

const HOSPITAL_TYPES = [
  { label: 'All',                        value: 'all',              icon: '🏥', color: 'blue'   },
  { label: 'Private Multispecialty',     value: 'multispecialty',   icon: '🌟', color: 'yellow' }, 
  { label: 'Government Multispecialty',  value: 'gov_multispecialty',icon: '🏛️🌟', color: 'indigo' }, // ✅ FIX: Added Government Multispecialty
  { label: 'General Hospital',           value: 'general',          icon: '🏥', color: 'green'  },
  { label: 'Government',                 value: 'government',       icon: '🏛️', color: 'indigo' },
  { label: 'Private',                    value: 'private',          icon: '💼', color: 'blue'   },
  { label: 'Charitable / NGO',           value: 'charitable',       icon: '❤️', color: 'red'    },
  { label: 'Cardiology (Heart)',         value: 'cardiology',       icon: '💓', color: 'red'    },
  { label: 'Neurology (Brain)',          value: 'neurology',        icon: '🧠', color: 'purple' },
  { label: 'Orthopedic (Bone)',          value: 'orthopedic',       icon: '🦴', color: 'amber'  },
  { label: 'Maternity (Women)',          value: 'maternity',        icon: '🤱', color: 'pink'   },
  { label: 'Pediatrics (Child)',         value: 'pediatrics',       icon: '🧸', color: 'orange' },
  { label: 'Oncology (Cancer)',          value: 'cancer',           icon: '🎗️', color: 'rose'   },
  { label: 'Dental (Teeth)',             value: 'dental',           icon: '🦷', color: 'cyan'   },
  { label: 'Ophthalmology (Eye)',        value: 'eye',              icon: '👁️', color: 'sky'    },
  { label: 'ENT (Ear, Nose, Throat)',    value: 'ent',              icon: '👂', color: 'amber'  },
  { label: 'Gastroenterology',           value: 'gastroenterology', icon: '🫄', color: 'orange' },
  { label: 'Pulmonology (Lungs)',        value: 'pulmonology',      icon: '🫁', color: 'sky'    },
  { label: 'Nephrology (Kidney)',        value: 'nephrology',       icon: '🩸', color: 'red'    },
  { label: 'Urology',                    value: 'urology',          icon: '💧', color: 'yellow' },
  { label: 'Dermatology (Skin)',         value: 'dermatology',      icon: '🩺', color: 'orange' },
  { label: 'Psychiatric (Mental)',       value: 'psychiatric',      icon: '🧘', color: 'violet' },
  { label: 'IVF / Fertility',            value: 'ivf',              icon: '👶', color: 'pink'   },
  { label: 'Physiotherapy',              value: 'physiotherapy',    icon: '🏃‍♂️', color: 'teal'  },
  { label: 'Ayurvedic',                  value: 'ayurvedic',        icon: '🌿', color: 'green'  },
  { label: 'Homeopathic',                value: 'homeopathic',      icon: '💊', color: 'cyan'   },
  { label: 'Military / Cantt',           value: 'military',         icon: '⚕️', color: 'green'  },
];

const LABORATORY_TYPES = [
  { label: 'All',                 value: 'all',            icon: '🔬', color: 'blue'   },
  { label: 'Pathology',           value: 'pathology',      icon: '🩸', color: 'red'    },
  { label: 'Radiology / Imaging', value: 'radiology',      icon: '🩻', color: 'purple' },
  { label: 'Microbiology',        value: 'microbiology',   icon: '🧫', color: 'green'  },
  { label: 'Biochemistry',        value: 'biochemistry',   icon: '🧪', color: 'yellow' },
  { label: 'Hematology',          value: 'hematology',     icon: '🩸', color: 'red'    },
  { label: 'Immunology',          value: 'immunology',     icon: '🛡️', color: 'indigo' },
  { label: 'Genetics / DNA',      value: 'genetics',       icon: '🧬', color: 'cyan'   },
  { label: 'Histopathology',      value: 'histopathology', icon: '🔬', color: 'rose'   },
  { label: 'Diagnostic Center',   value: 'diagnostic',     icon: '🏥', color: 'blue'   },
  { label: 'Blood Bank',          value: 'bloodbank',      icon: '🩸', color: 'red'    },
];

// Show only first 8, rest in dropdown
const VISIBLE_COUNT = 8;

const HospitalTypeFilter = ({ selected = 'all', onChange, facilityType = 'hospital' }) => {
  const [showAll, setShowAll] = useState(false);

  // Decide which list to use based on the page
  const currentTypes = facilityType === 'laboratory' ? LABORATORY_TYPES : HOSPITAL_TYPES;
  const visibleTypes = showAll ? currentTypes : currentTypes.slice(0, VISIBLE_COUNT);

  const getButtonStyle = (type) => {
    const isSelected = selected === type.value;
    if (isSelected) {
      return 'bg-blue-600 text-white shadow-md scale-105 border-blue-600';
    }
    return 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50';
  };

  return (
    <div className="w-full">
      {selected !== 'all' && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => onChange('all')}
            className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        {visibleTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${getButtonStyle(type)}`}
          >
            <span>{type.icon}</span>
            <span className="whitespace-nowrap">{type.label}</span>
          </button>
        ))}

        {currentTypes.length > VISIBLE_COUNT && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-medium border border-dashed border-gray-400 text-gray-600 hover:bg-gray-50 transition whitespace-nowrap"
          >
            {showAll ? (
              <>▲ Show Less</>
            ) : (
              <>+ {currentTypes.length - VISIBLE_COUNT} More</>
            )}
          </button>
        )}
      </div>

      {selected !== 'all' && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">Currently showing:</span>
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
            {currentTypes.find(t => t.value === selected)?.icon}{' '}
            {currentTypes.find(t => t.value === selected)?.label} {facilityType === 'laboratory' ? 'Labs' : 'Hospitals'}
            <button
              onClick={() => onChange('all')}
              className="ml-1 text-blue-500 hover:text-blue-800 focus:outline-none"
            >
              ✕
            </button>
          </span>
        </div>
      )}
    </div>
  );
};

export { HOSPITAL_TYPES, LABORATORY_TYPES };
export default HospitalTypeFilter;