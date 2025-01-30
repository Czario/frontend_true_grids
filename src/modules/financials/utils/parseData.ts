import { DataItem, ParsedData, ParsedRow } from "@/modules/financials/interfaces/financials";

const buildHierarchy = (
  items: DataItem[],
  parentId: string | null = null,
  map: Map<string, DataItem>,
  level: number = 0
): ParsedRow[] => {
  return items
    .filter(item => item.parent === parentId)
    .map(item => {
      const children = buildHierarchy(items, item._id, map, level + 1);
      return {
        id: item._id,
        level: item.level,
        hasChildren: children.length > 0,
        children,
        ...item.cells.reduce((acc, cell, index) => {
          acc[`col${index}`] = cell.value ?? null;
          return acc;
        }, {} as Record<string, any>)
      };
    });
};

export const parseData = (data: DataItem[]): ParsedData => {
  if (!data?.length) return { columns: [], rows: [] };

  const itemMap = new Map(data.map(item => [item._id, item]));
  
  // Find header row (first row with level 0 and all string values)
  const headerRow = data.find(item => 
    item.level === 0 && 
    item.parent === null &&
    item.cells.every(cell => typeof cell.value === 'string')
  );

  // Filter out header row from data
  const filteredData = headerRow ? data.filter(item => item._id !== headerRow._id) : data;

  // Create columns from header row or default
  const columns = headerRow?.cells.map((cell, index) => ({
    header: cell.value?.toString() || `Column ${index + 1}`,
    accessorKey: `col${index}`
  })) || [];

  // Build hierarchy without header row
  const rows = buildHierarchy(filteredData, null, itemMap);

  return { columns, rows };
};