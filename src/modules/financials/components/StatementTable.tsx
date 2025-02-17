'use client';

import React, {
  useMemo,
  useState,
  memo,
  forwardRef,
  useRef,
  useLayoutEffect,
  useEffect,
  RefCallback,
} from 'react';
import dynamic from 'next/dynamic';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef,
  Row,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  styled,
  Theme,
  Slider,
  Tooltip,
  tooltipClasses,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { parseData } from '../utils/parseData';
import { DataItem, ParsedRow } from '@/modules/financials/interfaces/financials';

const pdfUrl = "/doc_files/tesla_doc_1.pdf";

// Dynamically import the PdfHighlighterModal so that it only loads on the client.
const EnhancedDocViewer = dynamic(() => import('./DocViewerModal'), {
  ssr: false,
});

// Default header height (in px) if measurement fails.
const DEFAULT_HEADER_HEIGHT = 56;
const FIRST_COLUMN_WIDTH = 400;
const DEFAULT_COLUMN_WIDTH = 200;

// Use consistent padding and no extra margins.
const cellPadding = 8;

const StyledTableCell = styled(TableCell)(({ theme }: { theme: Theme }) => ({
  boxSizing: 'border-box',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: cellPadding,
  borderBottom: `1px solid ${theme.palette.divider}`,
  margin: 0,
}));

const StyledTableRow = styled(TableRow)(({ theme }: { theme: Theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const StyledTableHeadCell = styled(StyledTableCell)(() => ({
  fontWeight: 'bold',
  padding: cellPadding,
  margin: 0,
}));

// Update the StyledFirstColumnCell to include hover effect.
const StyledFirstColumnCell = styled(StyledTableCell)(({ theme }: { theme: Theme }) => ({
  fontWeight: 'bold',
  padding: cellPadding,
  margin: 0,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const StyledSlider = styled(Slider)(({ theme }: { theme: Theme }) => ({
  width: '100%',
  '& .MuiSlider-thumb': {
    width: 10,
    height: 10,
    borderRadius: 0,
    backgroundColor: theme.palette.primary.main,
  },
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

/*
  MemoizedRow:
  - The first column cell is always sticky horizontally (left: 0).
  - For parent rows that are “active” (sticky vertically), the top offset is set to the measured header bottom.
  - Now, sticky behavior is extended to all cells in the parent row.
*/
interface MemoizedRowProps {
  row: Row<ParsedRow>;
  onCellClick: (value: string) => void;
  isSticky?: boolean; // true if this parent row should stick vertically.
  headerHeight: number; // measured header bottom offset relative to container.
  setRowRef?: RefCallback<HTMLTableRowElement>;
}

const MemoizedRow = memo(
  forwardRef<HTMLTableRowElement, MemoizedRowProps>(
    ({ row, onCellClick, isSticky, headerHeight, setRowRef }, ref) => {
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
          {/* First Column Cell */}
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
                  transform: row.getIsExpanded() ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                {row.getIsExpanded() ? <ExpandLess /> : <ExpandMore />}
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
                // If the row is sticky, make this cell sticky too.
                ...(isSticky && {
                  position: 'sticky',
                  top: headerHeight,
                  zIndex: 9, // lower than first column's zIndex
                  backgroundColor: theme.palette.background.paper,
                }),
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

interface StatementTableProps {
  data: DataItem[];
}

const StatementTable: React.FC<StatementTableProps> = ({ data }) => {
  const [years, setYears] = useState(3);
  const [maxYears, setMaxYears] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCellValue, setSelectedCellValue] = useState<string | null>(null);
  const [stickyRowId, setStickyRowId] = useState<string | null>(null);
  // headerHeight represents the header row's bottom offset (from container top)
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);

  // Refs for the scrollable container, header row, and parent rows.
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const headerRowRef = useRef<HTMLTableRowElement>(null);
  const parentRowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  // Measure the header's bottom offset relative to the container.
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

  const { columns, rows } = useMemo(() => {
    const parsedData = parseData(data);
    const cols: ColumnDef<ParsedRow>[] = parsedData.columns
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
    return { columns: cols, rows: parsedData.rows };
  }, [data, years, maxYears]);

  const table = useReactTable<ParsedRow>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.children,
  });

  const marks = [
    { value: 1, label: '1Y' },
    { value: 3, label: '3Y' },
    { value: 5, label: '5Y' },
    { value: 7, label: '7Y' },
    { value: 11, label: 'Max' },
  ];

  const handleCellClick = (value: string) => {
    setSelectedCellValue(value);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCellValue(null);
  };

  // Capture each parent row (depth 0) element.
  const setParentRowRef = (rowId: string) => (el: HTMLTableRowElement | null) => {
    parentRowRefs.current[rowId] = el;
  };

  // Throttled scroll listener (using requestAnimationFrame) to determine which parent row is sticky.
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
        <Box display="flex" alignItems="center" justifyContent="center">
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
            sx={{ width: '50%' }}
          />
        </Box>
      </Box>
      <TableContainer
        ref={tableContainerRef}
        sx={{
          maxHeight: '60vh',
          overflow: 'auto',
          position: 'relative',
          backgroundColor: 'background.paper',
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
                    width: DEFAULT_COLUMN_WIDTH,
                    minWidth: DEFAULT_COLUMN_WIDTH,
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    backgroundColor: 'background.paper',
                    textAlign: 'right',
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
    </>
  );
};

export default React.memo(StatementTable);