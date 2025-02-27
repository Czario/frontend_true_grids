import { ParsedRow, DataItem } from '@/modules/financials/interfaces/financials';

export type FlatParsedRow = ParsedRow & { parentIds: string[] };

export interface StatementTableProps {
  data: DataItem[];
}

export interface SearchOption {
  id: string;
  label: string;
}
