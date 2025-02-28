'use client';

import React, {
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from 'react';
import dynamic from 'next/dynamic';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  FilterFn,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  IconButton,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { parseData } from '../../utils/parseData';
import { DataItem, ParsedRow } from '@/modules/financials/interfaces/financials';
import MemoizedRow from './MemoizedRow';
import ChartModal from '../chartsViewer/ChartModal';
import { StyledTableHeadCell } from './StyledComponents';
import { FlatParsedRow, StatementTableProps } from './types';
import TableSearch from './TableSearch';
import { highlightText } from '../../utils/highlightText';
import { normalizeSearchText, prepareForSearch, multiTermSearch } from '../../utils/searchUtils';
import useDebounce from '../../hooks/useDebounce';

const pdfUrl = '/doc_files/tesla_doc_1.pdf';

const EnhancedDocViewer = dynamic(() => import('../docViewer/DocViewerModal'), {
  ssr: false,
});

const DEFAULT_HEADER_HEIGHT = 28; // Reduced header height
const FIRST_COLUMN_WIDTH = 470; // Fixed width for the first column
const DEFAULT_COLUMN_WIDTH = 120; // Fixed width for other columns

// Much more robust search filter function
const globalFilterFn: FilterFn<ParsedRow> = (row, columnId, searchTerm) => {
  // Exit quickly if no search term
  if (!searchTerm || searchTerm.length === 0) return true;
  
  try {
    // Prepare row data for search
    const searchableText = prepareForSearch(row.original);
    
    // Use advanced multi-term search
    return multiTermSearch(searchableText, searchTerm);
  } catch (error) {
    console.error('Search filter error:', error);
    // Don't filter out rows if there's an error
    return true;
  }
};

const StatementTable: React.FC<StatementTableProps> = ({ data }) => {
  const [years, setYears] = useState(3);
  const [maxYears, setMaxYears] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCellValue, setSelectedCellValue] = useState<string | null>(null);
  const [stickyRowId, setStickyRowId] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
  const [reversed, setReversed] = useState(false);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [clickedRowId, setClickedRowId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResultCount, setSearchResultCount] = useState<number>(0);
  const [rawSearchTerm, setRawSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(rawSearchTerm, 200);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const headerRowRef = useRef<HTMLTableRowElement>(null);
  const parentRowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTableMounted, setIsTableMounted] = useState(false);

  const parsedData = useMemo(() => parseData(data), [data]);

  const flatRows: FlatParsedRow[] = useMemo(() => {
    const result: FlatParsedRow[] = [];
    const recurse = (rows: ParsedRow[], parentIds: string[] = []) => {
      rows.forEach((row) => {
        const flatRow = { ...row, parentIds } as FlatParsedRow;
        result.push(flatRow);
        if (row.children) {
          recurse(row.children, [...parentIds, row.id]);
        }
      });
    };
    recurse(parsedData.rows);
    return result;
  }, [parsedData]);

  const handleExpandAll = () => {
    const newExpanded: Record<string, boolean> = {};
    interface Row {
      id: string;
      subRows?: Row[];
    }
    const expandAllRows = (rows: Row[]) => {
      rows.forEach((row) => {
        newExpanded[row.id] = true;
        if (row.subRows) {
          expandAllRows(row.subRows);
        }
      });
    };
    expandAllRows(table.getRowModel().rows);
    setExpanded(newExpanded);
    setIsExpanded(true);
  };

  const handleCollapseAll = () => {
    setExpanded({});
    setIsExpanded(false);
  };

  const handleReverseColumns = () => {
    setReversed(!reversed);
  };

  // Update the handleSearch function
  const handleSearch = useCallback((term: string) => {
    setRawSearchTerm(term);
  }, []);

  useLayoutEffect(() => {
    const measureHeaderOffset = () => {
      if (headerRowRef.current && tableContainerRef.current) {
        const headerRect = headerRowRef.current.getBoundingClientRect();
        const containerRect = tableContainerRef.current.getBoundingClientRect();
        setHeaderHeight(headerRect.bottom - containerRect.top);
      }
    };
    measureHeaderOffset();
    window.addEventListener('resize', measureHeaderOffset);
    return () => window.removeEventListener('resize', measureHeaderOffset);
  }, []);

  const handleCellClick = (value: string) => {
    setSelectedCellValue(value);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCellValue(null);
  };

  const handleOpenChartModal = useCallback((rowId: string) => {
    setClickedRowId(rowId);
    setChartModalOpen(true);
  }, []);

  const handleCloseChartModal = () => {
    setChartModalOpen(false);
    setClickedRowId(null);
  };

  const { columns, rows, headerRow } = useMemo(() => {
    const headerRow = parsedData.columns.map((col) => col.header);
    const mappedColumns: ColumnDef<ParsedRow>[] = parsedData.columns.map((col, index) => ({
      id: `col${index}`,
      header: col.header,
      accessorFn: (row: ParsedRow) => {
        const value = row[`col${index}`];
        return typeof value === 'number' ? value.toLocaleString() : value;
      },
      size: index === 0 ? FIRST_COLUMN_WIDTH : DEFAULT_COLUMN_WIDTH,
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return searchTerm ? highlightText(value, searchTerm) : value;
      }
    }));

    const barChartColumn: ColumnDef<ParsedRow> = {
      id: 'barChart',
      header: '',
      cell: ({ row }) => (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handleOpenChartModal(row.id);
          }}
          size="small"
          sx={{ color: 'grey' }}
        >
          <BarChartIcon sx={{ color: 'grey' }} />
        </IconButton>
      ),
      size: DEFAULT_COLUMN_WIDTH / 2,
    };

    let newColumns = [mappedColumns[0], barChartColumn, ...mappedColumns.slice(1)];
    if (reversed) {
      newColumns = [mappedColumns[0], barChartColumn, ...mappedColumns.slice(1).reverse()];
    }
    return { columns: newColumns, rows: parsedData.rows, headerRow };
  }, [parsedData, handleOpenChartModal, reversed, searchTerm]);

  const table = useReactTable<ParsedRow>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSubRows: (row) => row.children,
    state: {
      expanded,
      globalFilter: searchTerm,
    },
    filterFns: {
      customSearch: globalFilterFn,
    },
    globalFilterFn: globalFilterFn,
    enableGlobalFilter: true,
    onExpandedChange: (updaterOrValue) =>
      setExpanded(updaterOrValue as Record<string, boolean>),
  });

  const setParentRowRef = (rowId: string) => (el: HTMLTableRowElement | null) => {
    parentRowRefs.current[rowId] = el;
  };

  useEffect(() => {
    if (tableContainerRef.current) {
      setIsTableMounted(true);
    }
    return () => {
      setIsTableMounted(false);
    };
  }, []);

  useEffect(() => {
    // Only set up the scroll handler if the table is mounted
    if (!isTableMounted || !tableContainerRef.current) return;
    
    const container = tableContainerRef.current;
    let scrollHandler: (() => void) | null = null;
    let ticking = false;
    
    scrollHandler = () => {
      // Safety check - if container disappeared during execution, remove the handler
      if (!tableContainerRef.current) {
        if (container && scrollHandler) {
          container.removeEventListener('scroll', scrollHandler);
        }
        return;
      }
      
      if (!ticking) {
        ticking = true;
        
        // Use requestIdleCallback if available, otherwise use requestAnimationFrame
        const scheduleUpdate = window.requestIdleCallback || window.requestAnimationFrame;
        
        scheduleUpdate(() => {
          try {
            // Additional safety checks
            if (!tableContainerRef.current || !isTableMounted) {
              ticking = false;
              return;
            }
            
            const currentContainer = tableContainerRef.current;
            const scrollTop = currentContainer.scrollTop;
            
            let currentStickyId: string | null = null;
            let maxOffset = -Infinity;
            
            Object.entries(parentRowRefs.current).forEach(([rowId, el]) => {
              if (el) {
                const offset = el.offsetTop;
                if (offset <= scrollTop + headerHeight && offset > maxOffset) {
                  maxOffset = offset;
                  currentStickyId = rowId;
                }
              }
            });
            
            setStickyRowId(currentStickyId);
          } catch (error) {
            console.error('Error in scroll handler:', error);
          } finally {
            ticking = false;
          }
        });
      }  
    };

    // Use a small delay to ensure the DOM is ready
    const timerId = setTimeout(() => {
      if (container && scrollHandler) {
        container.addEventListener('scroll', scrollHandler);
      }
    }, 100); // Longer timeout for extra safety

    return () => {
      clearTimeout(timerId);
      if (container && scrollHandler) {
        container.removeEventListener('scroll', scrollHandler);
      }
    };
  }, [headerHeight, rows, isTableMounted]);

  useEffect(() => {
    if (searchTerm) {
      // Count visible rows after filtering
      const visibleRowsCount = table.getRowModel().rows.length;
      setSearchResultCount(visibleRowsCount);
    } else {
      setSearchResultCount(0);
    }
  }, [searchTerm, table.getRowModel().rows.length]);

  // Use the debounced search term for filtering
  useEffect(() => {
    // This ensures search only happens after debounce
    setSearchTerm(debouncedSearchTerm);
    
    // Expand all rows when searching for better visibility
    if (debouncedSearchTerm) {
      handleExpandAll();
    }
  }, [debouncedSearchTerm]);

  // New effect: offload filtering to a web worker
  useEffect(() => {
    if (!window.Worker) return; // Fallback if unsupported

    const worker = new Worker(new URL('../../workers/searchWorker.ts', import.meta.url));
    // Pass rows in a light format (using flatRows or preprocessed data)
    worker.postMessage({ rows: flatRows, searchTerm });
    
    worker.onmessage = (e) => {
      const { filteredIds, error } = e.data;
      if (error) {
        console.error(error);
        setSearchResultCount(0);
      } else if (filteredIds === null) {
        // null means no filtering; show all
        setSearchResultCount(flatRows.length);
      } else {
        setSearchResultCount(filteredIds.length);
      }
      worker.terminate();
    };

    return () => {
      worker.terminate();
    };
  }, [searchTerm, flatRows]);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <TableSearch 
          onSearch={handleSearch}
          searchTerm={rawSearchTerm}
          resultCount={searchTerm ? searchResultCount : undefined}
        />
      </Box>
      
      <TableContainer
        ref={tableContainerRef}
        sx={{
          maxHeight: '60vh',
          overflow: 'auto',
          position: 'relative',
          backgroundColor: 'background.paper', // Ensure container is opaque
          boxShadow: 3,
          border: '1px solid', // Add main border to table container
          borderColor: 'divider',
        }}
        role="table"
      >
        <Table
          stickyHeader
          sx={{
            tableLayout: 'fixed',
            minWidth: FIRST_COLUMN_WIDTH + DEFAULT_COLUMN_WIDTH * (columns.length - 1),
            borderCollapse: 'separate', // Changed from collapse to separate for better border rendering
            borderSpacing: 0, // Ensure no spaces between cells
            boxShadow: 3,
            '& th, & td': {
              border: '1px solid', // Add border to all cells
              borderColor: 'divider',
            },
          }}
        >
          <TableHead>
            <TableRow
              ref={headerRowRef}
              role="rowgroup"
              sx={{
                backgroundColor: 'grey.200',
                height: '28px',
                opacity: 1, // Fully opaque header row
              }}
            >
              <StyledTableHeadCell
                sx={{
                  position: 'sticky',
                  top: 0,
                  left: 0,
                  zIndex: 11, // Higher than sticky rows (which was 10)
                  backgroundColor: 'grey.200',
                  opacity: 1,
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  width: FIRST_COLUMN_WIDTH,
                  minWidth: FIRST_COLUMN_WIDTH,
                  textAlign: 'left',
                  boxShadow: `0px 2px 4px -1px rgba(0,0,0,0.2), inset -1px 0 0 0 ${(theme: any) => theme.palette.divider}`, // Consistent with sticky rows
                }}
                role="columnheader"
              >
                <Box display="flex" alignItems="center">
                  {isExpanded ? (
                    <IconButton 
                      size="small" 
                      onClick={handleCollapseAll} 
                      aria-label="Collapse All" 
                      disableRipple
                      sx={{ 
                        color: 'grey.700', 
                        paddingLeft: 0,
                        backgroundColor: 'transparent !important',
                        transition: 'none',
                        '&:hover': { 
                          backgroundColor: 'transparent !important',
                          boxShadow: 'none !important',
                        },
                        '&.MuiIconButton-root': {
                          backgroundColor: 'transparent !important',
                        },
                        '&.MuiButtonBase-root': {
                          backgroundColor: 'transparent !important',
                        },
                        '&:active': {
                          backgroundColor: 'transparent !important',
                        },
                        '&::before': {
                          display: 'none !important',
                        },
                        '&::after': {
                          display: 'none !important',
                        }
                      }}
                    >
                      <UnfoldLessIcon />
                    </IconButton>
                  ) : (
                    <IconButton 
                      size="small" 
                      onClick={handleExpandAll} 
                      aria-label="Expand All" 
                      disableRipple
                      sx={{ 
                        color: 'grey.700', 
                        paddingLeft: 0,
                        backgroundColor: 'transparent !important',
                        transition: 'none',
                        '&:hover': { 
                          backgroundColor: 'transparent !important',
                          boxShadow: 'none !important',
                        },
                        '&.MuiIconButton-root': {
                          backgroundColor: 'transparent !important',
                        },
                        '&.MuiButtonBase-root': {
                          backgroundColor: 'transparent !important',
                        },
                        '&:active': {
                          backgroundColor: 'transparent !important',
                        },
                        '&::before': {
                          display: 'none !important',
                        },
                        '&::after': {
                          display: 'none !important',
                        }
                      }}
                    >
                      <UnfoldMoreIcon />
                    </IconButton>
                  )}
                  <Box 
                    ml={-1}
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 'calc(100% - 24px)',
                    }}
                  >
                    {flexRender(
                      table.getHeaderGroups()[0].headers[0].column.columnDef.header,
                      table.getHeaderGroups()[0].headers[0].getContext()
                    )}
                  </Box>
                </Box>
              </StyledTableHeadCell>
              {table.getHeaderGroups()[0].headers.slice(1).map((header, index) => (
                <StyledTableHeadCell
                  key={header.id}
                  sx={{
                    width: header.column.id === 'barChart' ? DEFAULT_COLUMN_WIDTH / 2 : DEFAULT_COLUMN_WIDTH,
                    minWidth: header.column.id === 'barChart' ? DEFAULT_COLUMN_WIDTH / 2 : DEFAULT_COLUMN_WIDTH,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10, // Match z-index with sticky rows but lower than first column
                    backgroundColor: 'grey.200',
                    opacity: 1,
                    textAlign: 'right',
                    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)', // Consistent shadow
                  }}
                  role="columnheader"
                >
                  {index === 0 ? (
                    <Box position="relative" width="100%" display="flex" justifyContent="center" alignItems="center">
                      {/* Centered button */}
                      <IconButton
                        size="small"
                        onClick={handleReverseColumns}
                        aria-label="Reverse Columns"
                        sx={{
                          color: 'grey.700',
                          padding: '2px',
                          '&:hover': {
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        <SwapHorizIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </StyledTableHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody role="rowgroup">
            {table.getRowModel().rows.map((row, index) => {
              const compositeKey = `${row.id}-${index}`;
              const isParent = row.depth === 0;
              return (
                <MemoizedRow
                  key={compositeKey}
                  row={row}
                  rowKey={compositeKey}
                  onCellClick={handleCellClick}
                  isSticky={isParent && row.id === stickyRowId}
                  headerHeight={headerHeight}
                  setRowRef={isParent ? setParentRowRef(row.id) : undefined}
                  isParent={isParent}
                  searchTerm={searchTerm}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <EnhancedDocViewer
        open={modalOpen}
        onClose={handleCloseModal}
        searchTerm={selectedCellValue || ''}
        pdfUrl={pdfUrl}
      />

      <ChartModal
        open={chartModalOpen}
        onClose={handleCloseChartModal}
        rowData={rows}
        clickedRowId={clickedRowId}
        headers={headerRow}
      />
    </>
  );
};

export default React.memo(StatementTable);
