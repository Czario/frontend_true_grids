import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { parseData } from "../utils/parseData";
import { DataItem, ParsedRow } from "@/modules/financials/interfaces/financials";
import styled from "styled-components";

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 14px;
  text-align: left;
`;

const Th = styled.th`
  background-color: #f2f2f2;
  padding: 12px;
  border: 1px solid #ddd;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const Td = styled.td<{ $level: number }>`
  padding: 12px;
  border: 1px solid #ddd;
  padding-left: ${props => props.$level * 24 + 12}px;
  transition: padding-left 0.2s ease;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const ExpandButton = styled.button`
  cursor: pointer;
  background: none;
  border: none;
  padding: 0 8px;
  font-size: 14px;
  width: 30px;
`;

interface StatementTableProps {
  data: DataItem[];
}

const StatementTable: React.FC<StatementTableProps> = ({ data }) => {
  const { columns, rows } = useMemo(() => {
    const parsedData = parseData(data);
    
    const expandColumn: ColumnDef<ParsedRow> = {
      id: 'expand',
      header: () => null,
      cell: ({ row }) => {
        if (!row.original.hasChildren) return null;
        return (
          <ExpandButton
            onClick={row.getToggleExpandedHandler()}
            data-expanded={row.getIsExpanded()}
          >
            {row.getIsExpanded() ? "▼" : "▶"}
          </ExpandButton>
        );
      }
    };

    return {
      columns: [expandColumn, ...parsedData.columns],
      rows: parsedData.rows
    };
  }, [data]);

  const table = useReactTable({
    data: rows,
    columns: columns as ColumnDef<ParsedRow>[],
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: row => row.children,
    initialState: {
      expanded: true
    }
  });

  return (
    <div style={{ overflowX: "auto", maxWidth: "100vw" }}>
      <Table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <Th key={header.id} colSpan={header.colSpan}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Th>
              ))}
            </Tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <Tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <Td 
                  key={cell.id}
                  $level={row.original.level}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              ))}
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default StatementTable;