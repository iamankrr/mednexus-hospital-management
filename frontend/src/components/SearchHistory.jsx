import React, { useState, useEffect } from 'react';
import { FaClock, FaTimes, FaTrash, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { searchHistoryAPI } from '../services/api';

const SearchHistory = ({ onSelectSearch }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchHistory();
    }
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await searchHistoryAPI.getAll();
      
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all search history?')) return;
    
    try {
      await searchHistoryAPI.clear();
      setHistory([]);
      alert('Search history cleared');
    } catch (error) {
      alert('Failed to clear history');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    
    try {
      await searchHistoryAPI.deleteOne(id);
      setHistory(history.filter(h => h._id !== id));
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const handleSelectSearch = (search) => {
    onSelectSearch({
      query: search.query,
      location: search.location,
      pinCode: search.pinCode
    });
    setShowHistory(false);
  };

  const formatSearchText = (search) => {
    if (search.pinCode) {
      return `Pin Code: ${search.pinCode}`;
    }
    const parts = [];
    if (search.query) parts.push(search.query);
    if (search.location) parts.push(search.location);
    return parts.join(' in ') || 'Empty search';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const token = localStorage.getItem('token');
  if (!token || history.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition text-sm"
      >
        <FaClock />
        Recent Searches ({history.length})
      </button>

      {showHistory && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowHistory(false)}
          />
          
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-800">Recent Searches</h3>
              <button
                onClick={handleClearAll}
                className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
              >
                <FaTrash className="text-xs" /> Clear All
              </button>
            </div>

            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : history.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No search history</div>
            ) : (
              <div>
                {history.map((search) => (
                  <div
                    key={search._id}
                    onClick={() => handleSelectSearch(search)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-gray-400 mt-1">
                          {search.pinCode ? <FaMapMarkerAlt /> : <FaSearch />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {formatSearchText(search)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {formatDate(search.createdAt)}
                            </span>
                            {search.resultsCount > 0 && (
                              <span className="text-xs text-gray-400">
                                • {search.resultsCount} results
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(search._id, e)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchHistory;