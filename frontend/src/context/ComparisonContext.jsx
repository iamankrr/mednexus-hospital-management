import React, { createContext, useState, useContext } from 'react';

const ComparisonContext = createContext();

export const ComparisonProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);
  const [compareType, setCompareType] = useState(null);

  // Get consistent ID from item
  const getItemId = (item) => {
    return item._id || item.id || null;
  };

  const addToCompare = (item, type) => {
    const itemId = getItemId(item);

    if (!itemId) {
      console.error('Item has no ID:', item);
      return false;
    }

    // Check max limit
    if (compareList.length >= 3) {
      alert('Maximum 3 items can be compared at once!');
      return false;
    }

    // Check same type
    if (compareType && compareType !== type) {
      alert(`You can only compare ${compareType}s together! Clear current list first.`);
      return false;
    }

    // Check already added - using consistent ID check
    const alreadyAdded = compareList.find((i) => {
      const existingId = getItemId(i);
      return existingId === itemId;
    });

    if (alreadyAdded) {
      alert(`${item.name} is already in comparison list!`);
      return false;
    }

    // Add item with normalized _id
    const normalizedItem = { ...item, _id: itemId };
    setCompareList((prev) => [...prev, normalizedItem]);
    setCompareType(type);

    console.log('✅ Added to compare:', item.name, 'ID:', itemId);
    console.log('Current list:', [...compareList, normalizedItem].map(i => i.name));
    return true;
  };

  const removeFromCompare = (itemId) => {
    console.log('Removing item:', itemId);
    const updated = compareList.filter((i) => {
      const id = getItemId(i);
      return id !== itemId;
    });
    setCompareList(updated);
    if (updated.length === 0) {
      setCompareType(null);
    }
  };

  const clearCompare = () => {
    setCompareList([]);
    setCompareType(null);
  };

  const isInCompare = (itemId) => {
    return compareList.some((i) => getItemId(i) === itemId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        compareList,
        compareType,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
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
