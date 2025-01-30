import React, { useMemo, useRef, memo, forwardRef } from 'react';
import { useReactTable, getCoreRowModel, getExpandedRowModel, flexRender, ColumnDef, Row } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Box, styled } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { parseData } from '../utils/parseData';
import { DataItem, ParsedRow } from '@/modules/financials/interfaces/financials';

const COLUMN_CONFIG = [
  { width: 400 },
  { width: 200 },
  { width: 200 },
  { width: 200 },
];

interface StyledTableCellProps {
  level: number;
  $width?: number;
}

const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => !['level', '$width'].includes(prop.toString()),
})<StyledTableCellProps>(({ theme, level, $width }) => ({
  paddingLeft: `${level * 32 + 16}px !important`,
  width: `${$width}px !important`,
  minWidth: `${$width}px !important`,
  maxWidth: `${$width}px !important`,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  boxSizing: 'border-box',
}));

const MemoizedRow = memo(
  forwardRef<HTMLTableRowElement, { 
    row: Row<ParsedRow>;
    start: number;
    measure: (element: HTMLElement) => void 
  }>(
    ({ row, start, measure }, ref) => {
      const rowRef = useRef<HTMLTableRowElement>(null);
      const virtualStyle = useMemo(() => ({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${start}px)`,
      }), [start]);

      React.useEffect(() => {
        if (rowRef.current) measure(rowRef.current);
      }, [measure]);

      return (
        <TableRow ref={ref} hover style={virtualStyle as React.CSSProperties}>
          {row.getVisibleCells().map((cell, index) => {
            const isFirstColumn = cell.column.id === 'col0';
            return (
              <StyledTableCell 
                key={cell.id} 
                level={row.original.level} 
                $width={COLUMN_CONFIG[index]?.width || 200}
              >
                {isFirstColumn && (
                  <IconButton
                    size="small"
                    onClick={row.getToggleExpandedHandler()}
                    disabled={!row.original.hasChildren}
                    sx={{
                      visibility: row.original.hasChildren ? 'visible' : 'hidden',
                      marginRight: 2,
                      transform: row.getIsExpanded() ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s ease',
                      position: 'absolute',
                      left: `${row.original.level * 32}px`,
                    }}
                  >
                    {row.getIsExpanded() ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
                <Box
                  sx={{
                    marginLeft: isFirstColumn ? '48px' : 0,
                    display: 'inline-block',
                    width: `calc(100% - ${isFirstColumn ? '48px' : '0px'})`,
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Box>
              </StyledTableCell>
            );
          })}
        </TableRow>
      );
    }
  )
);

const StatementTable: React.FC<{ data: DataItem[] }> = ({ data }) => {
  const { columns, rows } = useMemo(() => {
    const parsedData = parseData(data);
    return {
      columns: parsedData.columns.map((col, index) => ({
        id: col.accessorKey,
        header: col.header,
        accessorFn: (row: ParsedRow) => row[`col${index}`],
        size: COLUMN_CONFIG[index]?.width || 200,
      })),
      rows: parsedData.rows,
    };
  }, [data]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.children,
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 53,
    getScrollElement: () => tableContainerRef.current,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <TableContainer
      ref={tableContainerRef}
      component={Box}
      sx={{
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative',
        '& .MuiTableCell-root': { boxSizing: 'border-box' },
      }}
    >
      <Table
        stickyHeader
        sx={{
          tableLayout: 'fixed',
          minWidth: COLUMN_CONFIG.reduce((sum, col) => sum + col.width, 0),
        }}
      >
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <TableCell
                  key={header.id}
                  sx={{
                    fontWeight: 'bold',
                    width: `${COLUMN_CONFIG[index]?.width || 200}px`,
                    minWidth: `${COLUMN_CONFIG[index]?.width || 200}px`,
                    maxWidth: `${COLUMN_CONFIG[index]?.width || 200}px`,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>

        <TableBody
          sx={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index];
            return (
              <MemoizedRow
                key={row.id}
                row={row}
                start={virtualRow.start}
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