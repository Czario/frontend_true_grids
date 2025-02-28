import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, InputBase, Paper, ClickAwayListener, Grow } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface TableSearchProps {
  onSearch: (term: string) => void;
  searchTerm: string;
}

const TableSearch: React.FC<TableSearchProps> = ({ onSearch, searchTerm }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  // Use a safer approach to show/hide the search box
  const handleSearchClick = () => {
    // Set a small delay to ensure any pending state updates complete first
    setTimeout(() => {
      setIsSearchOpen(true);
    }, 50);
  };

  const handleCloseSearch = () => {
    if (searchTerm) {
      onSearch('');
    }
    setIsSearchOpen(false);
  };

  const handleClickAway = () => {
    if (!searchTerm) {
      setIsSearchOpen(false);
    }
  };

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
      
      {/* Replaced Fade with Grow which has fewer measurement issues */}
      {isSearchOpen && (
        <ClickAwayListener onClickAway={handleClickAway}>
          <Grow in={true} style={{ transformOrigin: 'top right' }}>
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
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
                inputProps={{ 'aria-label': 'search table' }}
              />
              {searchTerm && (
                <IconButton 
                  size="small" 
                  onClick={handleCloseSearch}
                  sx={{ p: 0.5, mr: 0.5 }}
                >
                  <CloseIcon fontSize="small" sx={{ color: 'grey.500' }} />
                </IconButton>
              )}
            </Paper>
          </Grow>
        </ClickAwayListener>
      )}
    </Box>
  );
};

export default TableSearch;
