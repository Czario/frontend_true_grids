'use client';

import React, { memo, forwardRef, RefCallback } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Box,
  styled,
  Theme,
  Tooltip,
  tooltipClasses,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { flexRender, Row } from '@tanstack/react-table';
import { ParsedRow } from '@/modules/financials/interfaces/financials';

const FIRST_COLUMN_WIDTH = 300;
const DEFAULT_COLUMN_WIDTH = 100;
const cellPadding = 1;

const StyledTableCell = styled(TableCell)(({ theme }: { theme: Theme }) => ({
  boxSizing: 'border-box',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: cellPadding,
  borderBottom: `1px solid ${theme.palette.divider}`,
  margin: 0,
  fontSize: '0.875rem',
  fontWeight: 'normal',
  lineHeight: 1,
}));

const StyledTableRow = styled(TableRow)(({ theme }: { theme: Theme }) => ({
  lineHeight: 1,
  // Removed hover effect
}));

const StyledFirstColumnCell = styled(StyledTableCell)(({ theme }: { theme: Theme }) => ({
  padding: cellPadding,
  margin: 0,
  backgroundColor: theme.palette.background.paper,
  fontWeight: 'normal',
  zIndex: 3, // Ensure the first column is above other content
  opacity: 1, // Ensure the first column is fully opaque
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
  rowKey?: string;
  onCellClick: (value: string) => void;
  isSticky?: boolean;
  headerHeight: number;
  setRowRef?: RefCallback<HTMLTableRowElement>;
  isParent: boolean;
  sx?: object;
}

const MemoizedRow = memo(
  forwardRef<HTMLTableRowElement, MemoizedRowProps>(
    ({ row, rowKey, onCellClick, isSticky, headerHeight, setRowRef, isParent, sx }, ref) => {
      return (
        <StyledTableRow
          ref={(node) => {
            if (setRowRef) setRowRef(node);
            if (typeof ref === 'function') ref(node);
          }}
          role="row"
          data-row-key={rowKey || row.id}
          sx={{ height: '10px', ...sx }}
        >
          <StyledFirstColumnCell
            sx={(theme) => ({
              position: 'sticky',
              left: 0,
              top: isSticky ? headerHeight : 'auto',
              zIndex: isSticky ? 10 : 3, // Increase z-index when sticky to match other columns
              borderRight: `1px solid ${theme.palette.divider}`,
              width: FIRST_COLUMN_WIDTH,
              minWidth: FIRST_COLUMN_WIDTH,
              paddingLeft: `${row.depth * 1.5}rem`, // Increased indentation
              textAlign: 'left',
              boxShadow: isSticky
                ? `0px 2px 4px -1px rgba(0,0,0,0.2), inset -1px 0 0 0 ${theme.palette.divider}`
                : `inset -1px 0 0 0 ${theme.palette.divider}`,
              backgroundColor: isSticky 
                ? theme.palette.background.default  // Use a slightly different color for sticky rows
                : theme.palette.background.paper,
              opacity: 1, // Ensure the first column is fully opaque
              fontWeight: isParent ? 'bold' : 'normal',
            })}
            role="cell"
          >
            <Box display="flex" alignItems="center">
              {/* Expand/Collapse Button placed before the name */}
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
                  ml={-1} // Reduced space between arrow and text
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
          {row.getVisibleCells().slice(1).map((cell, cellIndex) => (
            <StyledTableCell
              key={`${cell.id}-${cellIndex}`}
              sx={(theme) => ({
                width: DEFAULT_COLUMN_WIDTH,
                minWidth: DEFAULT_COLUMN_WIDTH,
                textAlign: 'right',
                ...(isSticky && {
                  position: 'sticky',
                  top: headerHeight,
                  zIndex: 9,
                  backgroundColor: theme.palette.background.default, // Match first column background
                  boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
                  opacity: 1, // Ensure sticky cells are opaque
                }),
                fontWeight: isParent ? 'bold' : 'normal',
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
