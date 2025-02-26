import React, { memo, forwardRef, RefCallback } from 'react';
import { TableRow, TableCell, IconButton, Box, styled, Theme, Tooltip, tooltipClasses } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { flexRender, Row } from '@tanstack/react-table';
import { ParsedRow } from '@/modules/financials/interfaces/financials';

const FIRST_COLUMN_WIDTH = 300; // Increased by 50%
const DEFAULT_COLUMN_WIDTH = 100;
const cellPadding = 8;

const StyledTableCell = styled(TableCell)(({ theme }: { theme: Theme }) => ({
  boxSizing: 'border-box',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: cellPadding,
  borderBottom: `1px solid ${theme.palette.divider}`,
  margin: 0,
  fontSize: '0.875rem', // Reduced text size
  fontWeight: 'normal', // Ensure normal weight for non-parent rows
}));

const StyledTableRow = styled(TableRow)(({ theme }: { theme: Theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const StyledFirstColumnCell = styled(StyledTableCell)(({ theme }: { theme: Theme }) => ({
  padding: cellPadding,
  margin: 0,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  fontWeight: 'normal', // Ensure normal weight for non-parent rows
}));

const CustomTooltip = styled(({ className, ...props }: any) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }: { theme: Theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
    color: 'white',
    boxShadow: theme.shadows[1],
    fontSize: 14,
    maxWidth: 300,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
}));

export interface MemoizedRowProps {
  row: Row<ParsedRow>;
  onCellClick: (value: string) => void;
  isSticky?: boolean; // true if this parent row should stick vertically.
  headerHeight: number; // measured header bottom offset relative to container.
  setRowRef?: RefCallback<HTMLTableRowElement>;
  isParent: boolean; // true if this is a parent row
}

const MemoizedRow = memo(
  forwardRef<HTMLTableRowElement, MemoizedRowProps>(
    ({ row, onCellClick, isSticky, headerHeight, setRowRef, isParent }, ref) => {
      return (
        <StyledTableRow
          ref={(node) => {
            if (setRowRef) setRowRef(node);
            if (typeof ref === 'function') ref(node);
          }}
          hover
          role="row"
          data-row-id={row.id}
          sx={{ height: '40px' }}
        >
          {/* First Column */}
          <StyledFirstColumnCell
            sx={(theme) => ({
              position: 'sticky',
              left: 0,
              top: isSticky ? headerHeight : 'auto',
              zIndex: isSticky ? 10 : 2,
              borderRight: `1px solid ${theme.palette.divider}`,
              width: FIRST_COLUMN_WIDTH,
              minWidth: FIRST_COLUMN_WIDTH,
              paddingLeft: `${row.depth * 0.75}rem`,
              textAlign: 'left',
              boxShadow: isSticky
                ? `inset -1px 0 0 0 ${theme.palette.divider}`
                : undefined,
              ...(isSticky && { backgroundColor: theme.palette.background.paper }),
              fontWeight: isParent ? 'bold' : 'normal', // Make parent rows bold
            })}
            role="cell"
          >
            <Box display="flex" alignItems="center">
              <IconButton
                size="small"
                onClick={row.getToggleExpandedHandler()}
                disabled={!row.original.hasChildren}
                aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
                sx={{
                  visibility: row.original.hasChildren ? 'visible' : 'hidden',
                  transition: 'transform 0.2s ease',
                }}
              >
                {row.getIsExpanded() ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
              </IconButton>
              <CustomTooltip title={row.getVisibleCells()[0].getValue() as string} arrow>
                <Box
                  ml={1}
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 'calc(100% - 24px)',
                  }}
                >
                  {flexRender(
                    row.getVisibleCells()[0].column.columnDef.cell,
                    row.getVisibleCells()[0].getContext()
                  )}
                </Box>
              </CustomTooltip>
            </Box>
          </StyledFirstColumnCell>

          {/* Other Cells */}
          {row.getVisibleCells().slice(1).map((cell) => (
            <StyledTableCell
              key={cell.id}
              sx={(theme) => ({
                width: DEFAULT_COLUMN_WIDTH,
                minWidth: DEFAULT_COLUMN_WIDTH,
                textAlign: 'right',
                ...(isSticky && {
                  position: 'sticky',
                  top: headerHeight,
                  zIndex: 9,
                  backgroundColor: theme.palette.background.paper,
                }),
                fontWeight: isParent ? 'bold' : 'normal', // Make parent rows bold
              })}
              role="cell"
              onClick={() => onCellClick(cell.getValue() as string)}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </StyledTableCell>
          ))}
        </StyledTableRow>
      );
    }
  )
);

export default MemoizedRow;