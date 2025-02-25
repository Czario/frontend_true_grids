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
import { parseData } from '../../utils/parseData';
import { DataItem, ParsedRow } from '@/modules/financials/interfaces/financials';
import MemoizedRow from './MemoizedRow';
import ChartModal from '../chartsViewer/ChartModal';

const pdfUrl = "/doc_files/tesla_doc_1.pdf";

// Dynamically import the PdfHighlighterModal so that it only loads on the client.
const EnhancedDocViewer = dynamic(() => import('../docViewer/DocViewerModal'), {
  ssr: false,
});

const DEFAULT_HEADER_HEIGHT = 56;
const FIRST_COLUMN_WIDTH = 400;
const DEFAULT_COLUMN_WIDTH = 200;
const cellPadding = 8;

const StyledTableHeadCell = styled('th')(({ theme }: { theme: Theme }) => ({
  boxSizing: 'border-box',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: cellPadding,
  fontWeight: 'bold',
  margin: 0,
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

  // State for the Bar Chart Modal.
  const [ChartModalOpen, setChartModalOpen] = useState(false);
  const [clickedRowId, setClickedRowId] = useState<string | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const headerRowRef = useRef<HTMLTableRowElement>(null);
  const parentRowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  // State for managing expanded rows
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
  };

  const handleCollapseAll = () => {
    setExpanded({});
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
          sx={{ color: 'primary.main' }}
        >
          <BarChartIcon sx={{ color: 'primary.main' }} />
        </IconButton>
      ),
      size: DEFAULT_COLUMN_WIDTH / 2,
    };

    const newColumns = [mappedColumns[0], barChartColumn, ...mappedColumns.slice(1)];
    return { columns: newColumns, rows: parsedData.rows, headerRow };
  }, [data, years, maxYears, handleOpenChartModal]);

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
        <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
          <RadioGroup row>
            <FormControlLabel
              value="expand"
              control={<Radio />}
              label="Expand All"
              onClick={handleExpandAll}
            />
            <FormControlLabel
              value="collapse"
              control={<Radio />}
              label="Collapse All"
              onClick={handleCollapseAll}
            />
          </RadioGroup>
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
                    width: header.column.id === 'barChart' ? DEFAULT_COLUMN_WIDTH / 2 : DEFAULT_COLUMN_WIDTH,
                    minWidth: header.column.id === 'barChart' ? DEFAULT_COLUMN_WIDTH / 2 : DEFAULT_COLUMN_WIDTH,
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