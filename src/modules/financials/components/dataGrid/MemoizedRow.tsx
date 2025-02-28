'use client';

import React, { memo, forwardRef, RefCallback, useCallback, useState } from 'react';
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CommentIcon from '@mui/icons-material/Comment';
import { flexRender, Row } from '@tanstack/react-table';
import { ParsedRow } from '@/modules/financials/interfaces/financials';
import { highlightText } from '../../utils/highlightText';

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
  searchTerm?: string;
}

const MemoizedRow = memo(
  forwardRef<HTMLTableRowElement, MemoizedRowProps>(
    ({ row, rowKey, onCellClick, isSticky, headerHeight, setRowRef, isParent, sx, searchTerm }, ref) => {
      // Track both row hover and specific cell hover
      const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);

      const handleCopy = useCallback((value: string) => {
        navigator.clipboard.writeText(value);
      }, []);
      
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
                  {searchTerm 
                    ? highlightText(
                        row.getVisibleCells()[0].getValue() as string,
                        searchTerm
                      )
                    : flexRender(
                        row.getVisibleCells()[0].column.columnDef.cell,
                        row.getVisibleCells()[0].getContext()
                      )}
                </Box>
              </CustomTooltip>
            </Box>
          </StyledFirstColumnCell>
          {/* Handle barChart column separately without icons */}
          {row.getVisibleCells().slice(1, 2).map((cell, cellIndex) => (
            <StyledTableCell
              key={`${cell.id}-${cellIndex}`}
              sx={(theme) => ({
                width: DEFAULT_COLUMN_WIDTH / 2,
                minWidth: DEFAULT_COLUMN_WIDTH / 2,
                textAlign: 'center',
                ...(isSticky && {
                  position: 'sticky',
                  top: headerHeight,
                  zIndex: 9,
                  backgroundColor: theme.palette.background.default,
                  boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
                  opacity: 1,
                }),
                fontWeight: isParent ? 'bold' : 'normal',
              })}
              role="cell"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </StyledTableCell>
          ))}
          {/* Modified implementation for remaining columns */}
          {row.getVisibleCells().slice(2).map((cell, cellIndex) => {
            const cellId = `${row.id}-${cell.id}`;
            const cellValue = cell.getValue() as string;
            
            return (
              <StyledTableCell
                key={`${cell.id}-${cellIndex}`}
                sx={(theme) => ({
                  width: DEFAULT_COLUMN_WIDTH,
                  minWidth: DEFAULT_COLUMN_WIDTH,
                  position: 'relative',
                  paddingLeft: '2px',
                  paddingRight: '4px',
                  ...(isSticky && {
                    position: 'sticky',
                    top: headerHeight,
                    zIndex: 9,
                    backgroundColor: theme.palette.background.default,
                    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
                    opacity: 1,
                  }),
                  fontWeight: isParent ? 'bold' : 'normal',
                })}
                role="cell"
                onMouseEnter={() => setHoveredCellId(cellId)}
                onMouseLeave={() => setHoveredCellId(null)}
              >
                <Box sx={{ 
                  display: 'flex', 
                  width: '100%',
                  position: 'relative', 
                }}>
                  {/* Only render icons when specific cell is hovered */}
                  {hoveredCellId === cellId && (
                    <Box 
                      sx={{ 
                        display: 'flex',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '4px',
                        position: 'absolute',
                        left: 0,
                        zIndex: 2,
                        boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                      }}
                    >
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(cellValue);
                        }}
                        sx={{ padding: '2px' }}
                        title="Copy to clipboard"
                      >
                        <ContentCopyIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onCellClick(cellValue);
                        }}
                        sx={{ padding: '2px' }}
                        title="Audit"
                      >
                        <ReceiptIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Comment clicked for', cellValue);
                        }}
                        sx={{ padding: '2px' }}
                        title="Comment"
                      >
                        <CommentIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Box>
                  )}
                  
                  {/* Cell content */}
                  <Box sx={{
                    width: '100%',
                    textAlign: 'right',
                    padding: '0 4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={cellValue} // Native HTML tooltip instead of React component
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Box>
                </Box>
              </StyledTableCell>
            );
          })}
        </StyledTableRow>
      );
    }
  )
);

export default MemoizedRow;
