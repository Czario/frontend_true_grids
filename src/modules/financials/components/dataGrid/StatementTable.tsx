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
import { useReactTable, getCoreRowModel, getExpandedRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
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
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { parseData } from '../../utils/parseData';
import { DataItem, ParsedRow } from '@/modules/financials/interfaces/financials';
import MemoizedRow from './MemoizedRow';
import ChartModal from '../chartsViewer/ChartModal';

const pdfUrl = "/doc_files/tesla_doc_1.pdf";

// Dynamically import the PdfHighlighterModal
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
  fontWeight: 'bold', // Keep header bold
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

interface StatementTableProps {
  data: DataItem[];
}

const StatementTable: React.FC<StatementTableProps> = ({ data }) => {
  const [years, setYears] = useState(3);
  const [maxYears, setMaxYears] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCellValue, setSelectedCellValue] = useState<string | null>(null);
  const [stickyRowId, setStickyRowId] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
  const [reversed, setReversed] = useState(false); // State to track column order

  // State for the Bar Chart Modal.
  const [ChartModalOpen, setChartModalOpen] = useState(false);
  const [clickedRowId, setClickedRowId] = useState<string | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const headerRowRef = useRef<HTMLTableRowElement>(null);
  const parentRowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  // State for managing expanded rows
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);

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
    setReversed(!reversed); // Toggle the reversed state
  };

  // Measure header offset.
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

  // Handler to open the Bar Chart Modal.
  const handleOpenChartModal = useCallback((rowId: string) => {
    setClickedRowId(rowId);
    setChartModalOpen(true);
  }, []);

  const handleCloseChartModal = () => {
    setChartModalOpen(false);
    setClickedRowId(null);
  };

  // Build columns, header row, and rows.
  const { columns, rows, headerRow } = useMemo(() => {
    const parsedData = parseData(data);
    // headerRow will contain all header strings.
    const headerRow = parsedData.columns.map(col => col.header);
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

    // Define the Bar Chart column.
    const barChartColumn: ColumnDef<ParsedRow> = {
      id: 'barChart',
      header: '', // leave header empty
      cell: ({ row }) => (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handleOpenChartModal(row.id);
          }}
          size="small"
          sx={{ color: 'red' }} // Changed color to red
        >
          <BarChartIcon sx={{ color: 'red' }} /> {/* Changed color to red */}
        </IconButton>
      ),
      size: DEFAULT_COLUMN_WIDTH / 2,
    };

    let newColumns = [mappedColumns[0], barChartColumn, ...mappedColumns.slice(1)];
    if (reversed) {
      newColumns = [mappedColumns[0], barChartColumn, ...mappedColumns.slice(1).reverse()];
    }

    return { columns: newColumns, rows: parsedData.rows, headerRow };
  }, [data, years, maxYears, handleOpenChartModal, reversed]);

  const table = useReactTable<ParsedRow>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.children,
    state: {
      expanded,
    },
    onExpandedChange: (updaterOrValue) => setExpanded(updaterOrValue as Record<string, boolean>),
  });

  const marks = [
    { value: 1, label: '1Y' },
    { value: 3, label: '3Y' },
    { value: 5, label: '5Y' },
    { value: 7, label: '7Y' },
    { value: 11, label: 'Max' },
  ];

  // Capture parent row refs.
  const setParentRowRef = (rowId: string) => (el: HTMLTableRowElement | null) => {
    parentRowRefs.current[rowId] = el;
  };

  // Throttled scroll listener for sticky parent rows.
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
      <Box sx={{ padding: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
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
          <Box sx={{ marginLeft: 2, display: 'flex', alignItems: 'center', boxShadow: 3 }}> {/* Added shadow */}
            <IconButton size="small" onClick={handleReverseColumns} aria-label="Reverse Columns">
              <SwapHorizIcon />
            </IconButton>
            {isExpanded ? (
              <IconButton size="small" onClick={handleCollapseAll} aria-label="Collapse All">
                <UnfoldLessIcon />
              </IconButton>
            ) : (
              <IconButton size="small" onClick={handleExpandAll} aria-label="Expand All">
                <UnfoldMoreIcon />
              </IconButton>
            )}
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
          boxShadow: 3, // Added shadow
        }}
        role="table"
      >
        <Table
          stickyHeader
          sx={{
            tableLayout: 'fixed',
            minWidth:
              FIRST_COLUMN_WIDTH + DEFAULT_COLUMN_WIDTH * (columns.length - 1),
            borderCollapse: 'collapse',
            boxShadow: 3, // Added shadow
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
                  boxShadow: 3, // Added shadow
                }}
                role="columnheader"
              >
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
                    boxShadow: 3, // Added shadow
                  }}
                  role="columnheader"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </StyledTableHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody role="rowgroup">
            {table.getRowModel().rows.map((row) => {
              const isParent = row.depth === 0;
              const isSticky = isParent && row.id === stickyRowId;
              return (
                <MemoizedRow
                  key={row.id}
                  row={row}
                  onCellClick={handleCellClick}
                  isSticky={isSticky}
                  headerHeight={headerHeight}
                  setRowRef={isParent ? setParentRowRef(row.id) : undefined}
                  isParent={isParent} // Pass isParent prop to MemoizedRow
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
        open={ChartModalOpen}
        onClose={handleCloseChartModal}
        rowData={rows}
        clickedRowId={clickedRowId}
        headers={headerRow}
      />
    </>
  );
};

export default React.memo(StatementTable);