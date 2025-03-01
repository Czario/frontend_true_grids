import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, IconButton, InputBase, Paper, ClickAwayListener, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import useDebounce from '../../hooks/useDebounce';

interface TableSearchProps {
  onSearch: (term: string) => void;
  searchTerm: string;
  resultCount?: number; // New prop to show result count
}

const TableSearch: React.FC<TableSearchProps> = ({ onSearch, searchTerm, resultCount }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchTerm);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Faster debounce for better UX
  const debouncedSearchTerm = useDebounce(inputValue, 150);

  // Handle input change with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  // Effect for when the debounced search term changes
  useEffect(() => {
    // Only trigger search if the debounced value actually changed
    if (debouncedSearchTerm !== searchTerm) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch, searchTerm]);

  // Sync state when searchTerm changes from outside
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // Open search box
  const handleSearchClick = useCallback(() => {
    setIsSearchOpen(true);
    // Schedule focus after state update completes
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);
  }, []);

  // Close and clear search
  const handleCloseSearch = useCallback(() => {
    if (searchTerm) {
      setInputValue('');
      onSearch('');
    }
    setIsSearchOpen(false);
  }, [onSearch, searchTerm]);

  // Handle click away
  const handleClickAway = useCallback(() => {
    if (!inputValue) {
      setIsSearchOpen(false);
    }
  }, [inputValue]);

  // Focus the input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      const timerId = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timerId);
    }
  }, [isSearchOpen]);

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        display: 'flex',
        justifyContent: 'flex-start',
        // Remove the mb: 1 that was here previously to rely on parent spacing
      }}
      ref={mountRef}
    >
      {!isSearchOpen && (
        <IconButton 
          onClick={handleSearchClick} 
          size="small"
          sx={{ 
            color: 'grey.700',
            padding: '4px', // Consistent padding
            height: 32, // Match height with button
            width: 32,
          }}
        >
          <SearchIcon />
        </IconButton>
      )}
      
      {isSearchOpen && (
        <ClickAwayListener onClickAway={handleClickAway}>
          <div>
            <Paper
              elevation={2}
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: 200,
                height: 32,
                borderRadius: 1,
              }}
            >
              <SearchIcon sx={{ color: 'grey.500', ml: 1 }} fontSize="small" />
              <InputBase
                inputRef={searchInputRef}
                placeholder="Search table..."
                value={inputValue}
                onChange={handleInputChange}
                sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
                inputProps={{ 'aria-label': 'search table' }}
              />
              
              {/* Show result count when searching */}
              {inputValue && typeof resultCount === 'number' && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mx: 0.5, 
                    color: resultCount > 0 ? 'success.main' : 'text.disabled',
                    fontSize: '0.7rem',
                    userSelect: 'none'
                  }}
                >
                  {resultCount}
                </Typography>
              )}
              
              {inputValue && (
                <IconButton 
                  size="small" 
                  onClick={handleCloseSearch}
                  sx={{ p: 0.5, mr: 0.5 }}
                >
                  <CloseIcon fontSize="small" sx={{ color: 'grey.500' }} />
                </IconButton>
              )}
            </Paper>
          </div>
        </ClickAwayListener>
      )}
    </Box>
  );
};

export default React.memo(TableSearch);
