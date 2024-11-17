import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState<string>('');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        style={{
          padding: '0.5rem',
          marginRight: '0.5rem',
          color: '#333', // Dark text color
          backgroundColor: '#f9f9f9', // Light background color
          border: '1px solid #ccc',
          borderRadius: '4px',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
