import React, { createContext, useState, useContext } from 'react';
import toast from 'react-hot-toast';

const ComparisonContext = createContext();

export const ComparisonProvider = ({ children }) => {
  const [comparisonList, setComparisonList] = useState([]);
  const [compareType, setCompareType] = useState(null);

  // Get consistent ID from item (handles both _id and id)
  const getItemId = (item) => {
    return item._id || item.id || null;
  };

  const isInComparison = (itemId) => {
    // Also handles passing a full object instead of just an ID
    const idToCheck = typeof itemId === 'object' ? getItemId(itemId) : itemId;
    return comparisonList.some((i) => getItemId(i) === idToCheck);
  };

  const addToComparison = (facility, type = 'facility') => {
    const facilityId = getItemId(facility);

    if (!facilityId) {
      console.error('Facility has no ID:', facility);
      return false;
    }

    // Check max limit
    if (comparisonList.length >= 3) {
      toast.error('⚠️ You can only compare up to 3 facilities at once!');
      return false;
    }

    // Check same type (Prevents comparing a hospital with a lab)
    if (compareType && compareType !== type) {
      toast.error(`You can only compare ${compareType}s together! Clear current list first.`);
      return false;
    }

    // Check if already added
    if (isInComparison(facilityId)) {
      toast.error(`${facility.name} is already in comparison list!`);
      return false;
    }

    // Add facility with normalized _id
    const normalizedFacility = { ...facility, _id: facilityId };
    setComparisonList((prev) => [...prev, normalizedFacility]);
    setCompareType(type);

    console.log('✅ Added to compare:', facility.name, 'ID:', facilityId);
    toast.success('✅ Added to comparison');
    return true;
  };

  const removeFromComparison = (facilityId) => {
    const idToRemove = typeof facilityId === 'object' ? getItemId(facilityId) : facilityId;
    console.log('Removing facility:', idToRemove);
    
    const updated = comparisonList.filter((f) => getItemId(f) !== idToRemove);
    setComparisonList(updated);
    
    if (updated.length === 0) {
      setCompareType(null);
    }
    
    toast.success('✅ Removed from comparison');
  };

  const clearComparison = () => {
    setComparisonList([]);
    setCompareType(null);
  };

  return (
    <ComparisonContext.Provider
      value={{
        // ✅ NEW REQUESTED NAMES
        comparisonList,
        addToComparison,
        removeFromComparison,
        isInComparison,
        clearComparison,
        
        // ✅ ALIASES FOR BACKWARD COMPATIBILITY
        // (Ensures existing components like HospitalCard don't break)
        compareList: comparisonList,
        addToCompare: addToComparison,
        removeFromCompare: removeFromComparison,
        clearCompare: clearComparison,
        
        // Extra utility states
        compareType,
        getItemId
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
};

export default ComparisonContext;