import React, { useMemo, useRef, memo, forwardRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef,
  Row,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
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
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { parseData } from '../utils/parseData';
import { DataItem, ParsedRow } from '@/modules/financials/interfaces/financials';

const FIRST_COLUMN_WIDTH = 400;
const DEFAULT_COLUMN_WIDTH = 200;

const StyledTableCell = styled(TableCell)(({ theme }: { theme: Theme }) => ({
  boxSizing: 'border-box',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledTableRow = styled(TableRow)(({ theme }: { theme: Theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const StyledTableHeadCell = styled(StyledTableCell)(({ theme }: { theme: Theme }) => ({
  fontWeight: 'bold',
}));

const StyledFirstColumnCell = styled(StyledTableCell)(({ theme }: { theme: Theme }) => ({
  fontWeight: 'bold',
}));

interface MemoizedRowProps {
  row: Row<ParsedRow>;
  isExpanded: boolean;
  measure: (el: HTMLElement) => void;
}

const MemoizedRow = memo(
  forwardRef<HTMLTableRowElement, MemoizedRowProps>(
    ({ row, isExpanded, measure }, ref) => {
      const rowRef = useRef<HTMLTableRowElement>(null);

      useEffect(() => {
        if (rowRef.current) {
          measure(rowRef.current);
        }
      }, [measure, isExpanded]);

      return (
        <StyledTableRow ref={ref} hover role="row" sx={{ height: '40px' }}>
          <StyledFirstColumnCell
            sx={{
              position: 'sticky',
              left: 0,
              zIndex: 2,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
              width: FIRST_COLUMN_WIDTH,
              minWidth: FIRST_COLUMN_WIDTH,
              paddingLeft: `${row.depth * 0.75}rem`, // Reduced indentation
              textAlign: 'left',
            }}
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
              <Box ml={1}>
                {flexRender(
                  row.getVisibleCells()[0].column.columnDef.cell,
                  row.getVisibleCells()[0].getContext()
                )}
              </Box>
            </Box>
          </StyledFirstColumnCell>

          {row.getVisibleCells().slice(1).map((cell) => (
            <StyledTableCell
              key={cell.id}
              sx={{
                width: DEFAULT_COLUMN_WIDTH,
                minWidth: DEFAULT_COLUMN_WIDTH,
                textAlign: 'right',
              }}
              role="cell"
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
  const { columns, rows } = useMemo(() => {
    const parsedData = parseData(data);
    const cols: ColumnDef<ParsedRow>[] = parsedData.columns.map((col, index) => ({
      id: `col${index}`,
      header: col.header,
      accessorFn: (row: ParsedRow) => row[`col${index}`],
      size: index === 0 ? FIRST_COLUMN_WIDTH : DEFAULT_COLUMN_WIDTH,
    }));
    return { columns: cols, rows: parsedData.rows };
  }, [data]);

  const table = useReactTable<ParsedRow>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.children,
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer<HTMLDivElement, Element>({
    count: table.getRowModel().rows.length,
    estimateSize: () => 40,
    getScrollElement: () => tableContainerRef.current,
    overscan: 10,
    scrollToFn: (offset, { behavior }) => {
      tableContainerRef.current?.scrollTo({
        top: offset,
        behavior,
      });
    },
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    rowVirtualizer.scrollToIndex(0);
  }, [data, rowVirtualizer]);

  return (
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
          minWidth: FIRST_COLUMN_WIDTH + DEFAULT_COLUMN_WIDTH * (columns.length - 1),
        }}
      >
        <TableHead>
          <TableRow role="rowgroup">
            <StyledTableHeadCell
              sx={{
                position: 'sticky',
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
        <TableBody sx={{ height: `${rowVirtualizer.getTotalSize()}px` }} role="rowgroup">
          {virtualRows.map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index];
            return (
              <MemoizedRow
                key={row.id}
                row={row}
                isExpanded={row.getIsExpanded()}
                measure={rowVirtualizer.measureElement}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default React.memo(StatementTable);