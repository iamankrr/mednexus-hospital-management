import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBalanceScale, FaTimes } from 'react-icons/fa';
import { useComparison } from '../context/ComparisonContext';

const CompareBar = () => {
  const navigate = useNavigate();
  const { compareList, compareType, removeFromCompare, clearCompare } = useComparison();

  // Don't show if empty
  if (!compareList || compareList.length === 0) return null;

  const getItemId = (item) => item._id || item.id || null;

  const handleCompareNow = () => {
    console.log('Compare Now clicked!');
    console.log('compareList:', compareList);
    console.log('compareType:', compareType);

    if (compareList.length < 2) {
      alert('Please add at least 2 items to compare!');
      return;
    }

    navigate('/compare', {
      state: {
        items: compareList,
        type: compareType || 'hospital'
      }
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* Left: Icon + Title */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="bg-white text-orange-600 p-2 rounded-full">
                <FaBalanceScale className="text-xl" />
              </div>
              <div className="hidden md:block">
                <p className="font-bold text-sm">
                  Compare {compareType === 'hospital' ? 'Hospitals' : 'Labs'}
                </p>
                <p className="text-xs text-orange-100">
                  {compareList.length}/3 selected
                </p>
              </div>
            </div>

            {/* Middle: Selected Items */}
            <div className="flex items-center gap-2 flex-1 overflow-x-auto py-1">
              {compareList.map((item, index) => {
                const itemId = getItemId(item);
                return (
                  <div
                    key={itemId || index}
                    className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg whitespace-nowrap flex-shrink-0"
                  >
                    <span className="text-sm font-semibold">
                      {item.name || 'Unknown'}
                    </span>
                    <button
                      onClick={() => removeFromCompare(itemId)}
                      className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                );
              })}

              {/* Empty slots */}
              {compareList.length < 2 && (
                <div className="flex items-center gap-2 border-2 border-dashed border-white border-opacity-40 px-3 py-2 rounded-lg whitespace-nowrap flex-shrink-0">
                  <span className="text-sm text-orange-100">
                    + Add {compareList.length === 0 ? '2 more' : '1 more'}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={clearCompare}
                className="px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition"
              >
                Clear
              </button>
              <button
                onClick={handleCompareNow}
                disabled={compareList.length < 2}
                className={`px-5 py-2 rounded-lg font-bold transition text-sm ${
                  compareList.length >= 2
                    ? 'bg-white text-orange-600 hover:bg-orange-50 cursor-pointer'
                    : 'bg-white bg-opacity-30 text-white cursor-not-allowed opacity-60'
                }`}
              >
                Compare Now ({compareList.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
