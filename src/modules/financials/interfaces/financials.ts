export interface FinancialCell {
  value: string | number | null;
  comments: string[];
  links: string | null;
  _id: string;
}

export interface DataItem {
  _id: string;
  cells: FinancialCell[];
  children: string[];
  parent: string | null;
  order: number;
  level: number;
}

export interface ParsedRow {
  id: string;
  level: number;
  hasChildren: boolean;
  children: ParsedRow[];
  [key: string]: string | number | null | boolean | ParsedRow[];
}

export interface ParsedData {
  columns: Array<{ header: string; accessorKey: string }>;
  rows: ParsedRow[];
}