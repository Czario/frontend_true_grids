'use client';

import React, { memo, forwardRef, RefCallback, useCallback, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
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
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import FunctionsIcon from '@mui/icons-material/Functions';
import { flexRender, Row } from '@tanstack/react-table';
import { ParsedRow } from '@/modules/financials/interfaces/financials';
import { highlightText } from '../../utils/highlightText';
import { initializeTooltips } from '@/utils/tooltipInitializer';

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
  borderRight: `1px solid ${theme.palette.divider}`,
  margin: 0,
  fontSize: '0.875rem',
  fontWeight: 'normal',
  lineHeight: 1,
}));

const StyledTableRow = styled(TableRow)(({ theme }: { theme: Theme }) => ({
  lineHeight: 1,
  // Removed hover effect
  '& td:last-child': {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
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

// Fast tooltip for action buttons with no delay
const ActionTooltip = styled(({ className, ...props }: any) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }: { theme: Theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.grey[800],
    color: 'white',
    boxShadow: theme.shadows[1],
    fontSize: 11, // Reduced from 12 to 11
    padding: '4px 8px', // Compact padding
    borderRadius: 2, // Smaller rounded corners
    maxWidth: 120, // Limit maximum width
  },
  enterTouchDelay: 0,
  leaveTouchDelay: 0,
}));

// Create a portal-based tooltip component that renders outside the table DOM
const TextPopup = ({ 
  text, 
  searchTerm,
  anchorEl,
  onClose 
}: { 
  text: string, 
  searchTerm?: string,
  anchorEl: HTMLElement | null,
  onClose: () => void
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  // Calculate position based on anchor element
  useEffect(() => {
    if (!anchorEl) return;
    
    const rect = anchorEl.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    
    setPosition({
      top: rect.bottom + scrollTop + 5, // 5px below the element
      left: rect.left + scrollLeft,
    });
  }, [anchorEl]);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node) && 
          anchorEl && !anchorEl.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [anchorEl, onClose]);

  if (!anchorEl) return null;

  // Create portal to render outside table DOM structure
  return ReactDOM.createPortal(
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 9999, // Very high z-index
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '8px 12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        maxWidth: '400px',
        minWidth: '200px',
        wordBreak: 'break-word',
        whiteSpace: 'normal',
        fontSize: '0.875rem',
        lineHeight: 1.5,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {searchTerm ? highlightText(text, searchTerm) : text}
    </div>,
    document.body // Render directly in body
  );
};

// Modify the MemoizedTooltipContent component
const MemoizedTooltipContent = memo(({ 
  value, 
  searchTerm
}: { 
  value: string, 
  searchTerm?: string 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  
  // Check if content is actually overflowing
  useEffect(() => {
    if (contentRef.current) {
      const isTextOverflowing = contentRef.current.scrollWidth > contentRef.current.clientWidth;
      setIsOverflowing(isTextOverflowing);
    }
  }, [value]);
  
  return (
    <Box
      ml={-1}
      sx={{
        position: 'relative',
        display: 'inline-block',
        maxWidth: 'calc(100% - 24px)',
      }}
    >
      {/* Regular display with ellipsis */}
      <Box
        ref={contentRef}
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
          cursor: isOverflowing ? 'pointer' : 'default',
        }}
        onMouseEnter={() => isOverflowing && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => isOverflowing && setShowTooltip(prev => !prev)}
      >
        {searchTerm
          ? highlightText(String(value || ''), searchTerm)
          : value}
      </Box>
      
      {/* Portal-based tooltip */}
      <TextPopup 
        text={String(value || '')}
        searchTerm={searchTerm}
        anchorEl={showTooltip ? contentRef.current : null}
        onClose={() => setShowTooltip(false)}
      />
    </Box>
  );
});

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
  onChartClick?: (rowId: string) => void; // Add this prop
}

const MemoizedRow = memo(
  forwardRef<HTMLTableRowElement, MemoizedRowProps>(
    ({ row, rowKey, onCellClick, isSticky, headerHeight, setRowRef, isParent, sx, searchTerm, onChartClick }, ref) => {
      // Track both row hover and specific cell hover
      const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);

      const handleCopy = useCallback((value: string) => {
        navigator.clipboard.writeText(value);
      }, []);

      // Pre-load tooltips on mount
      useEffect(() => {
        const timer = setTimeout(() => {
          initializeTooltips();
        }, 50); // Short delay to allow the component to render

        return () => clearTimeout(timer); // Cleanup the timeout
      }, []);

      // Update the chart click handler
      const handleChartClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (onChartClick && row.id) {
          onChartClick(row.id);
        }
      }, [row.id, onChartClick]);
      
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
              borderLeft: `1px solid ${theme.palette.divider}`,
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
            onMouseEnter={() => setHoveredCellId(`${row.id}-firstcol`)}
            onMouseLeave={() => setHoveredCellId(null)}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              {/* Left side with expand/collapse and name */}
              <Box display="flex" alignItems="center" style={{ maxWidth: 'calc(100% - 90px)' }}>
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
                
                {/* Use direct component instead of CustomTooltip for better hover behavior */}
                <MemoizedTooltipContent 
                  value={row.getVisibleCells()[0].getValue() as string} 
                  searchTerm={searchTerm} 
                />
              </Box>
              
              {/* Row action icons - shown on hover for all rows */}
              {hoveredCellId === `${row.id}-firstcol` && (
                <Box display="flex" alignItems="center" sx={{ mr: 0.5 }}>
                  <ActionTooltip 
                    title="Settings" 
                    placement="top"
                    arrow
                    enterDelay={0}
                  >
                    <IconButton 
                      size="small"
                      sx={{ padding: '1px' }}
                    >
                      <SettingsIcon fontSize="small" sx={{ fontSize: '0.9rem', color: 'grey.500' }} />
                    </IconButton>
                  </ActionTooltip>
                  
                  <ActionTooltip 
                    title="Chart" 
                    placement="top"
                    arrow
                    enterDelay={0}
                  >
                    <IconButton 
                      size="small"
                      onClick={handleChartClick}
                      sx={{ padding: '1px' }}
                    >
                      <BarChartIcon fontSize="small" sx={{ fontSize: '0.9rem', color: 'grey.500' }} />
                    </IconButton>
                  </ActionTooltip>
                  
                  <ActionTooltip 
                    title="Formula" 
                    placement="top"
                    arrow
                    enterDelay={0}
                  >
                    <IconButton 
                      size="small"
                      sx={{ padding: '1px' }}
                    >
                      <FunctionsIcon fontSize="small" sx={{ fontSize: '0.9rem', color: 'grey.500' }} />
                    </IconButton>
                  </ActionTooltip>
                </Box>
              )}
            </Box>
          </StyledFirstColumnCell>
          {/* Fix: Handle all non-first columns uniformly */}
          {row.getVisibleCells().slice(1).map((cell, cellIndex) => {
            const cellId = `${row.id}-${cell.id}`;
            const cellValue = String(cell.getValue() || '');
            
            return (
              <StyledTableCell
                key={`${cell.id}-${cellIndex}`}
                sx={(theme) => ({
                  width: DEFAULT_COLUMN_WIDTH,
                  minWidth: DEFAULT_COLUMN_WIDTH,
                  position: 'relative',
                  paddingLeft: '2px',
                  paddingRight: '4px',
                  textAlign: 'right', // All non-first columns are right-aligned
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
                      <ActionTooltip 
                        title="Copy to clipboard" 
                        placement="top"
                        arrow
                        enterDelay={0}
                        TransitionProps={{ timeout: 50 }}
                        componentsProps={{
                          tooltip: {
                            sx: {
                              py: 0.5, // Smaller vertical padding
                              px: 1, // Smaller horizontal padding
                              minHeight: 'unset' // Remove minimum height
                            }
                          }
                        }}
                      >
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(cellValue);
                          }}
                          sx={{ padding: '2px' }}
                        >
                          <ContentCopyIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </ActionTooltip>
                      
                      <ActionTooltip 
                        title="Audit" 
                        placement="top"
                        arrow
                        enterDelay={0}
                        TransitionProps={{ timeout: 50 }}
                        componentsProps={{
                          tooltip: {
                            sx: {
                              py: 0.5,
                              px: 1,
                              minHeight: 'unset'
                            }
                          }
                        }}
                      >
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onCellClick(cellValue);
                          }}
                          sx={{ padding: '2px' }}
                        >
                          <ReceiptIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </ActionTooltip>
                      
                      <ActionTooltip 
                        title="Comment" 
                        placement="top"
                        arrow
                        enterDelay={0}
                        TransitionProps={{ timeout: 50 }}
                        componentsProps={{
                          tooltip: {
                            sx: {
                              py: 0.5,
                              px: 1,
                              minHeight: 'unset'
                            }
                          }
                        }}
                      >
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Comment clicked for', cellValue);
                          }}
                          sx={{ padding: '2px' }}
                        >
                          <CommentIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </ActionTooltip>
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
                    position: 'relative', // Add position relative
                  }}
                  title={cellValue} // Native HTML tooltip instead of React component
                  >
                    {searchTerm
                      ? highlightText(cellValue, searchTerm)
                      : flexRender(cell.column.columnDef.cell, cell.getContext())}
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
