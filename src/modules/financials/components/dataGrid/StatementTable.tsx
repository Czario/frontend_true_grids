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
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  styled,
  Theme,
  Slider,
  IconButton,
  TextField,
  Autocomplete,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { parseData } from '../../utils/parseData';
import { DataItem, ParsedRow } from '@/modules/financials/interfaces/financials';
import MemoizedRow from './MemoizedRow';
import ChartModal from '../chartsViewer/ChartModal';

const pdfUrl = '/doc_files/tesla_doc_1.pdf';

const EnhancedDocViewer = dynamic(() => import('../docViewer/DocViewerModal'), {
  ssr: false,
});

const DEFAULT_HEADER_HEIGHT = 56;
const FIRST_COLUMN_WIDTH = 300;
const DEFAULT_COLUMN_WIDTH = 100;
const cellPadding = 8;

const StyledTableHeadCell = styled('th')(({ theme }: { theme: Theme }) => ({
  boxSizing: 'border-box',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: cellPadding,
  fontWeight: 'bold',
  margin: 0,
  boxShadow: theme.shadows[1],
  fontFamily: 'Roboto, sans-serif',
  fontSize: '0.875rem',
}));

const StyledSlider = styled(Slider)(({ theme }: { theme: Theme }) => ({
  width: '50%',
  '& .MuiSlider-thumb': {
    width: 10,
    height: 10,
    borderRadius: 0,
    backgroundColor: theme.palette.grey[700],
    boxShadow: theme.shadows[2],
  },
  '& .MuiSlider-track': {
    backgroundColor: theme.palette.grey[500],
  },
  '& .MuiSlider-rail': {
    backgroundColor: theme.palette.grey[300],
  },
  fontFamily: 'Roboto, sans-serif',
  fontSize: '0.875rem',
}));

// Define a new type for flattened rows.
type FlatParsedRow = ParsedRow & { parentIds: string[] };

interface StatementTableProps {
  data: DataItem[];
}

// Define our search option type.
interface SearchOption {
  id: string;
  label: string;
}

const StatementTable: React.FC<StatementTableProps> = ({ data }) => {
  const [years, setYears] = useState(3);
  const [maxYears, setMaxYears] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCellValue, setSelectedCellValue] = useState<string | null>(null);
  const [stickyRowId, setStickyRowId] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
  const [reversed, setReversed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // highlightedRowId now will store the composite key for the row.
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [clickedRowId, setClickedRowId] = useState<string | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const headerRowRef = useRef<HTMLTableRowElement>(null);
  const parentRowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse data once.
  const parsedData = useMemo(() => parseData(data), [data]);

  // Flatten all rows (including children) while tracking parent IDs.
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

  // Create unique search options ensuring label is a string.
  const searchOptions: SearchOption[] = useMemo(
    () =>
      flatRows.map((row, index) => ({
        id: `${row.id}-${index}`,
        label: String(row.col0),
      })),
    [flatRows]
  );

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

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    if (newValue === 11) {
      setMaxYears(true);
    } else {
      setYears(newValue as number);
      setMaxYears(false);
    }
  };

  const valueLabelFormat = (value: number) => (value === 11 ? 'Max' : `${value}Y`);

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
    const mappedColumns: ColumnDef<ParsedRow>[] = parsedData.columns
      .filter((_, index) => maxYears || index < years * 4)
      .map((col, index) => ({
        id: `col${index}`,
        header: col.header,
        accessorFn: (row: ParsedRow) => {
          const value = row[`col${index}`];
          return typeof value === 'number' ? value.toLocaleString() : value;
        },
        size: index === 0 ? FIRST_COLUMN_WIDTH : DEFAULT_COLUMN_WIDTH,
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
          sx={{ color: 'red' }}
        >
          <BarChartIcon sx={{ color: 'red' }} />
        </IconButton>
      ),
      size: DEFAULT_COLUMN_WIDTH / 2,
    };

    let newColumns = [mappedColumns[0], barChartColumn, ...mappedColumns.slice(1)];
    if (reversed) {
      newColumns = [mappedColumns[0], barChartColumn, ...mappedColumns.slice(1).reverse()];
    }
    return { columns: newColumns, rows: parsedData.rows, headerRow };
  }, [parsedData, years, maxYears, handleOpenChartModal, reversed]);

  // Update the search term.
  const handleSearchChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: string | number | boolean | (ParsedRow | string)[] | null
  ) => {
    setSearchTerm((value as string) || '');
  };

  // When a search suggestion is selected, find the first rendered row whose first cell value matches the search option.
  const handleSearchSelect = (
    event: React.SyntheticEvent<Element, Event>,
    value: SearchOption | string | null
  ) => {
    if (!value || typeof value === 'string') return;
    // Get the currently rendered rows from react-table.
    const renderedRows = table.getRowModel().rows;
    const targetIndex = renderedRows.findIndex(
      (row) => String(row.getVisibleCells()[0].getValue()) === value.label
    );
    if (targetIndex !== -1) {
      // Compute the composite key for the row.
      const compositeKey = `${renderedRows[targetIndex].id}-${targetIndex}`;
      setHighlightedRowId(compositeKey);
      // Expand parent rows by finding the matching flat row.
      const flatMatch = flatRows.find((r) => String(r.col0) === value.label);
      if (flatMatch) {
        setExpanded((prev) => {
          const newExpanded = { ...prev };
          flatMatch.parentIds.forEach((parentId) => {
            newExpanded[parentId] = true;
          });
          return newExpanded;
        });
      }
    }
  };

  // Scroll the highlighted row into view in the table container.
  useEffect(() => {
    if (highlightedRowId && tableContainerRef.current) {
      const element = tableContainerRef.current.querySelector(
        `[data-row-key="${highlightedRowId}"]`
      );
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedRowId]);

  const table = useReactTable<ParsedRow>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.children,
    state: {
      expanded,
    },
    onExpandedChange: (updaterOrValue) =>
      setExpanded(updaterOrValue as Record<string, boolean>),
  });

  const marks = [
    { value: 1, label: '1Y' },
    { value: 3, label: '3Y' },
    { value: 5, label: '5Y' },
    { value: 7, label: '7Y' },
    { value: 11, label: 'Max' },
  ];

  const setParentRowRef = (rowId: string) => (el: HTMLTableRowElement | null) => {
    parentRowRefs.current[rowId] = el;
  };

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = container.scrollTop;
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
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [rows, headerHeight]);

  return (
    <>
      <Box sx={{ paddingDown: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {/* Autocomplete with custom renderOption that explicitly sets key from option.id */}
          <Autocomplete<SearchOption, false, false, true>
            freeSolo
            options={searchOptions}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
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
          <StyledSlider
            value={maxYears ? 11 : years}
            onChange={handleSliderChange}
            aria-labelledby="years-slider"
            valueLabelDisplay="auto"
            valueLabelFormat={valueLabelFormat}
            marks={marks}
            min={1}
            max={11}
            step={null}
            sx={{ width: '28%', boxShadow: 3 }}
          />
          <Box sx={{ marginLeft: 2, display: 'flex', alignItems: 'center', boxShadow: 3 }}>
            <IconButton size="small" onClick={handleReverseColumns} aria-label="Reverse Columns">
              <SwapHorizIcon />
            </IconButton>
            
          </Box>
        </Box>
      </Box>
      <TableContainer
        ref={tableContainerRef}
        sx={{
          maxHeight: '60vh',
          overflow: 'auto',
          position: 'relative',
          backgroundColor: 'background.paper',
          boxShadow: 3,
        }}
        role="table"
      >
        <Table
          stickyHeader
          sx={{
            tableLayout: 'fixed',
            minWidth: FIRST_COLUMN_WIDTH + DEFAULT_COLUMN_WIDTH * (columns.length - 1),
            borderCollapse: 'collapse',
            boxShadow: 3,
          }}
        >
          <TableHead>
            <TableRow ref={headerRowRef} role="rowgroup">
              <StyledTableHeadCell
                sx={{
                  position: 'sticky',
                  top: 0,
                  left: 0,
                  zIndex: 3,
                  backgroundColor: 'background.paper',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  width: FIRST_COLUMN_WIDTH,
                  minWidth: FIRST_COLUMN_WIDTH,
                  textAlign: 'left',
                  boxShadow: 3,
                }}
                role="columnheader"
              >
                {isExpanded ? (
                  <IconButton size="small" onClick={handleCollapseAll} aria-label="Collapse All">
                    <UnfoldLessIcon />
                  </IconButton>
                ) : (
                  <IconButton size="small" onClick={handleExpandAll} aria-label="Expand All">
                    <UnfoldMoreIcon />
                  </IconButton>
                )}
                {flexRender(
                  table.getHeaderGroups()[0].headers[0].column.columnDef.header,
                  table.getHeaderGroups()[0].headers[0].getContext()
                )}
              </StyledTableHeadCell>
              {table.getHeaderGroups()[0].headers.slice(1).map((header) => (
                <StyledTableHeadCell
                  key={header.id}
                  sx={{
                    width: header.column.id === 'barChart' ? DEFAULT_COLUMN_WIDTH / 2 : DEFAULT_COLUMN_WIDTH,
                    minWidth: header.column.id === 'barChart' ? DEFAULT_COLUMN_WIDTH / 2 : DEFAULT_COLUMN_WIDTH,
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    backgroundColor: 'background.paper',
                    textAlign: 'right',
                    boxShadow: 3,
                  }}
                  role="columnheader"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </StyledTableHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody role="rowgroup">
            {table.getRowModel().rows.map((row, index) => {
              const compositeKey = `${row.id}-${index}`;
              const isParent = row.depth === 0;
              const isHighlighted = compositeKey === highlightedRowId;
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
                  sx={{ backgroundColor: isHighlighted ? 'grey.300' : 'inherit' }}
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