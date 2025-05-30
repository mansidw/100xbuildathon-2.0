import React, { useState, useEffect, useRef } from 'react';

const BlitzTournamentVolunteer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState('');
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingChange, setLoadingChange] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isVerified, setIsVerified] = useState(false);
  
  const searchRef = useRef(null);
  
  const matches = [
    // Round of 32
    ...Array.from({ length: 16 }, (_, i) => `ROUND-OF-32-${i + 1}`),
    // Round of 16
    ...Array.from({ length: 8 }, (_, i) => `ROUND-OF-16-${i + 1}`),
    // Quarter finals
    ...Array.from({ length: 4 }, (_, i) => `QUARTER-FINALS-${i + 1}`),
    // Semi finals
    ...Array.from({ length: 2 }, (_, i) => `SEMI-FINALS-${i + 1}`),
    // Finals
    'FINALS-1'
  ];

  // Filter matches when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = matches.filter(match => 
        match.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMatches(filtered);
    } else {
      setFilteredMatches([]);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    setIsVerified(false);
  };

  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
    setSearchQuery(match);
    setShowDropdown(false);
    setStatus({ message: '', type: '' });
    setIsVerified(false);
  };

  const verifyMatch = async () => {
    if (!selectedMatch) {
      setStatus({ message: 'Please select a match first', type: 'error' });
      return;
    }
    
    setLoadingVerify(true);
    setStatus({ message: 'Verifying match...', type: 'info' });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId: selectedMatch }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus({ message: 'Match verified successfully!', type: 'success' });
        setIsVerified(true);
      } else {
        setStatus({ message: data.message || 'Verification failed. Please change the question.', type: 'error' });
        setIsVerified(false);
      }
    } catch (error) {
      setStatus({ message: 'Network error during verification', type: 'error' });
      setIsVerified(false);
    } finally {
      setLoadingVerify(false);
    }
  };

  const changeQuestion = async () => {
    setLoadingChange(true);
    setStatus({ message: 'Changing question...', type: 'info' });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/changequestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId: selectedMatch }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus({ message: 'Question changed successfully. Please verify again.', type: 'success' });
      } else {
        setStatus({ message: data.message || 'Failed to change question', type: 'error' });
      }
    } catch (error) {
      setStatus({ message: 'Network error while changing question', type: 'error' });
    } finally {
      setLoadingChange(false);
    }
  };

  const startMatch = async () => {
    if (!isVerified) {
      setStatus({ message: 'Please verify the match first', type: 'error' });
      return;
    }
    
    setLoadingStart(true);
    setStatus({ message: 'Starting match...', type: 'info' });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/start-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId: selectedMatch }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus({ message: `Match ${selectedMatch} started successfully!`, type: 'success' });
        // Optional: Reset form or redirect
      } else {
        setStatus({ message: data.message || 'Failed to start match', type: 'error' });
      }
    } catch (error) {
      setStatus({ message: 'Network error while starting match', type: 'error' });
    } finally {
      setLoadingStart(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 text-white">
      <div className="w-full max-w-md bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800">
        <h1 className="text-2xl font-bold text-center mb-6 text-emerald-400">Blitz Tournament</h1>
        <h2 className="text-xl text-center mb-6 text-white">Volunteer Console</h2>
        
        <div className="mb-6 relative" ref={searchRef}>
          <label htmlFor="match-search" className="block text-sm font-medium text-gray-300 mb-2">
            Search Match
          </label>
          <input
            id="match-search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search for a match..."
            className="block w-full rounded-md border border-gray-700 bg-gray-800 py-2 px-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 text-white"
          />
          
          {showDropdown && filteredMatches.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredMatches.map(match => (
                <div 
                  key={match} 
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-200"
                  onClick={() => handleMatchSelect(match)}
                >
                  {match}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {status.message && (
          <div className={`mb-4 p-3 rounded-md ${
            status.type === 'error' ? 'bg-red-900/50 text-red-200 border border-red-800' : 
            status.type === 'success' ? 'bg-green-900/50 text-green-200 border border-green-800' :
            'bg-blue-900/50 text-blue-200 border border-blue-800'
          }`}>
            {status.message}
          </div>
        )}
        
        {!isVerified ? (
          <div className="flex flex-col space-y-3">
            <button
              onClick={verifyMatch}
              disabled={!selectedMatch || loadingVerify}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
            >
              {loadingVerify ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Match'
              )}
            </button>
            
            {status.type === 'error' && status.message && !status.message.includes('select') && (
              <button
                onClick={changeQuestion}
                disabled={loadingChange}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
              >
                {loadingChange ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Changing...
                  </span>
                ) : (
                  'Change Question'
                )}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={startMatch}
            disabled={loadingStart}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
          >
            {loadingStart ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting Match...
              </span>
            ) : (
              'Start Match'
            )}
          </button>
        )}
      </div>
      
      {selectedMatch && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg shadow-lg w-full max-w-md border border-gray-800">
          <h3 className="font-semibold text-gray-300 mb-2">Selected Match:</h3>
          <div className="flex items-center justify-between bg-black p-3 rounded-md border border-gray-800">
            <span className="font-mono text-emerald-400">{selectedMatch}</span>
            <span className={`text-xs px-2 py-1 rounded-full border ${
              isVerified 
                ? 'bg-emerald-900 text-emerald-200 border-emerald-800' 
                : 'bg-yellow-900 text-yellow-200 border-yellow-800'
            }`}>
              {isVerified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlitzTournamentVolunteer;