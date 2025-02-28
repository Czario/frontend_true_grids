import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, IconButton, InputBase, Paper, ClickAwayListener, Grow } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import useDebounce from '../../hooks/useDebounce';

interface TableSearchProps {
  onSearch: (term: string) => void;
  searchTerm: string;
}

const TableSearch: React.FC<TableSearchProps> = ({ onSearch, searchTerm }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchTerm);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Debounce search input to reduce render frequency
  const debouncedSearchTerm = useDebounce(inputValue, 200);

  // Handle input change with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  // Effect for when the debounced search term changes
  useEffect(() => {
    // Only trigger the search if the debounced value doesn't match current searchTerm
    if (debouncedSearchTerm !== searchTerm) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch, searchTerm]);

  // Sync state when searchTerm changes from outside
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // Use a safer approach to show/hide the search box
  const handleSearchClick = useCallback(() => {
    // Set a small delay to ensure any pending state updates complete first
    setTimeout(() => {
      setIsSearchOpen(true);
    }, 50);
  }, []);

  const handleCloseSearch = useCallback(() => {
    if (searchTerm) {
      setInputValue('');
      onSearch('');
    }
    setIsSearchOpen(false);
  }, [onSearch, searchTerm]);

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
      }, 150);
      return () => clearTimeout(timerId);
    }
  }, [isSearchOpen]);

  return (
    <Box 
      sx={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', mb: 1 }}
      ref={mountRef}
    >
      {!isSearchOpen && (
        <IconButton 
          onClick={handleSearchClick} 
          size="small"
          sx={{ color: 'grey.700' }}
        >
          <SearchIcon />
        </IconButton>
      )}
      
      {isSearchOpen && (
        <ClickAwayListener onClickAway={handleClickAway}>
          <div>  {/* Using div instead of Grow to avoid measurement issues */}
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
