import React, { useMemo, useState, memo, forwardRef } from 'react';
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
  Typography,
  Tooltip,
  tooltipClasses,
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

const StyledSlider = styled(Slider)(({ theme }: { theme: Theme }) => ({
  width: '100%',
  '& .MuiSlider-thumb': {
    width: 10,
    height: 10,
    borderRadius: 0, // Square thumb
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiSlider-track': {
    backgroundColor: 'transparent',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      height: '30px',
      background: '#ccc',
      zIndex: 1,
    },
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'transparent',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      height: '2px',
      background: '#ccc',
      zIndex: 1,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      height: '2px',
      background: 'linear-gradient(to right, #000 1px, transparent 1px)',
      backgroundSize: '10% 100%',
      zIndex: 2,
    },
  },
  '& .MuiSlider-mark': {
    backgroundColor: '#000',
    height: '8px',
    width: '2px',
    marginTop: '-3px',
  },
  '& .MuiSlider-markLabel': {
    fontSize: '0.75rem',
    top: '20px',
  },
  '& .MuiSlider-root': {
    backgroundColor: theme.palette.background.paper, // Rectangular background
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
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

interface MemoizedRowProps {
  row: Row<ParsedRow>;
  isExpanded: boolean;
}

const MemoizedRow = memo(
  forwardRef<HTMLTableRowElement, MemoizedRowProps>(
    ({ row, isExpanded }, ref) => {
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
              <CustomTooltip title={row.getVisibleCells()[0].getValue() as string} arrow>
                <Box
                  ml={1}
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 'calc(100% - 24px)', // Adjust to fit within the cell
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
  const [years, setYears] = useState(3);
  const [maxYears, setMaxYears] = useState(false);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (newValue === 11) {
      setMaxYears(true);
    } else {
      setYears(newValue as number);
      setMaxYears(false);
    }
  };

  const valueLabelFormat = (value: number) => {
    return value === 11 ? 'Max' : `${value}Y`;
  };

  const { columns, rows } = useMemo(() => {
    const parsedData = parseData(data);
    const cols: ColumnDef<ParsedRow>[] = parsedData.columns
      .filter((_, index) => maxYears || index < years * 4) // Show columns based on the number of years or max
      .map((col, index) => ({
        id: `col${index}`,
        header: col.header,
        accessorFn: (row: ParsedRow) => row[`col${index}`],
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

  const marks = Array.from({ length: 11 }, (_, i) => ({
    value: i + 1,
    label: i === 10 ? 'Max' : `${i + 1}Y`,
  }));

  return (
    <>
      <Box sx={{ padding: 2 }}>
        <Typography gutterBottom>Years</Typography>
        <Box display="flex" alignItems="center">
          <StyledSlider
            value={maxYears ? 11 : years}
            onChange={handleSliderChange}
            aria-labelledby="years-slider"
            valueLabelDisplay="auto"
            valueLabelFormat={valueLabelFormat}
            step={1}
            marks={marks}
            min={1}
            max={11}
            sx={{ flexGrow: 1, marginRight: 2 }}
          />
        </Box>
      </Box>
      <TableContainer
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
          <TableBody role="rowgroup">
            {table.getRowModel().rows.map((row) => (
              <MemoizedRow
                key={row.id}
                row={row}
                isExpanded={row.getIsExpanded()}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default React.memo(StatementTable);