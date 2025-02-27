import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { SearchOption } from './types';

interface SearchBarProps {
  searchOptions: SearchOption[];
  searchTerm: string;
  handleSearchChange: (
    event: React.SyntheticEvent<Element, Event>,
    value: string | number | boolean | (string)[] | null
  ) => void;
  handleSearchSelect: (
    event: React.SyntheticEvent<Element, Event>,
    value: SearchOption | string | null
  ) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchOptions,
  searchTerm,
  handleSearchChange,
  handleSearchSelect,
}) => {
  return (
    <Autocomplete<SearchOption, false, false, true>
      freeSolo
      options={searchOptions}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.label
      }
      inputValue={searchTerm}
      onInputChange={handleSearchChange}
      onChange={handleSearchSelect}
      sx={{ minWidth: '250px', flex: 1, mr: 2 }}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {option.label}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search"
          variant="outlined"
          size="small"
          sx={{ width: '34%', boxShadow: 3 }}
        />
      )}
    />
  );
};

export default SearchBar;
