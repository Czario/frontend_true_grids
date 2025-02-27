import React from 'react';
import { ButtonGroup } from '@mui/material';
import { StyledButton } from './StyledComponents';

interface YearSelectorProps {
  years: number;
  maxYears: boolean;
  handleYearsChange: (newYears: number) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({
  years,
  maxYears,
  handleYearsChange,
}) => {
  return (
    <ButtonGroup variant="contained" aria-label="outlined primary button group" sx={{ boxShadow: 3 }}>
      <StyledButton
        disableFocusRipple
        disableRipple
        size="small"
        onClick={() => handleYearsChange(1)}
        selected={years === 1 && !maxYears}
        disabled={years === 1 && !maxYears}
      >
        1Y
      </StyledButton>
      <StyledButton
        disableFocusRipple
        disableRipple
        size="small"
        onClick={() => handleYearsChange(3)}
        selected={years === 3 && !maxYears}
        disabled={years === 3 && !maxYears}
      >
        3Y
      </StyledButton>
      <StyledButton
        disableFocusRipple
        disableRipple
        size="small"
        onClick={() => handleYearsChange(5)}
        selected={years === 5 && !maxYears}
        disabled={years === 5 && !maxYears}
      >
        5Y
      </StyledButton>
      <StyledButton
        disableFocusRipple
        disableRipple
        size="small"
        onClick={() => handleYearsChange(11)}
        selected={maxYears}
        disabled={maxYears}
      >
        Max
      </StyledButton>
    </ButtonGroup>
  );
};

export default YearSelector;
