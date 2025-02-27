import { styled, Theme, Button } from '@mui/material';

export const StyledTableHeadCell = styled('th')(({ theme }: { theme: Theme }) => ({
  boxSizing: 'border-box',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: 4,
  fontWeight: 'bold',
  margin: 0,
  boxShadow: theme.shadows[1],
  fontFamily: 'Roboto, sans-serif',
  fontSize: '0.875rem',
}));

export const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ theme, selected }) => ({
  fontWeight: selected ? 300 : 200,
  textTransform: 'capitalize',
  fontSize: '0.855rem',
  transition: 'all 0.3s ease',
  border: 'none',
  outline: 'none',
  backgroundColor: selected ? theme.palette.grey[700] : 'transparent',
  color: selected ? 'white' : theme.palette.text.primary,
  padding: '2px 6px',
  borderRadius: '8px',
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: selected
      ? theme.palette.grey[600]
      : theme.palette.action.hover,
  },
  '&:focus, &:focus-visible': {
    outline: 'none !important',
    boxShadow: 'none !important',
    border: 'none !important',
  },
  '&.Mui-focusVisible': {
    outline: 'none !important',
    boxShadow: 'none !important',
    border: 'none !important',
  },
}));
