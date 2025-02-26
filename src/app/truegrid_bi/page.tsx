// import React from 'react'
// import TrueGridBI from '@/modules/infographics/components/truegrid_bi/TruegridBI';

// export default function TrueGridBIPage() {

//     const { columns, rows, headerRow } = useMemo(() => {
//         const parsedData = parseData(data);
//         // headerRow will contain all header strings.
//         const headerRow = parsedData.columns.map(col => col.header);
//         const mappedColumns: ColumnDef<ParsedRow>[] = parsedData.columns
//           .filter((_, index) => maxYears || index < years * 4)
//           .map((col, index) => ({
//             id: `col${index}`,
//             header: col.header,
//             accessorFn: (row: ParsedRow) => {
//               const value = row[`col${index}`];
//               return typeof value === 'number' ? value.toLocaleString() : value;
//             },
//             size: index === 0 ? FIRST_COLUMN_WIDTH : DEFAULT_COLUMN_WIDTH,
//           }));
    
//         // Define the Bar Chart column.
//         const barChartColumn: ColumnDef<ParsedRow> = {
//           id: 'barChart',
//           header: '', // leave header empty
//           cell: ({ row }) => (
//             <IconButton
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleOpenChartModal(row.id);
//               }}
//               size="small"
//               sx={{ color: 'red' }} // Changed color to red
//             >
//               <BarChartIcon sx={{ color: 'red' }} /> {/* Changed color to red */}
//             </IconButton>
//           ),
//           size: DEFAULT_COLUMN_WIDTH / 2,
//         };
    
//         let newColumns = [mappedColumns[0], barChartColumn, ...mappedColumns.slice(1)];
//         if (reversed) {
//           newColumns = [mappedColumns[0], barChartColumn, ...mappedColumns.slice(1).reverse()];
//         }
    
//         return { columns: newColumns, rows: parsedData.rows, headerRow };
//       }, [data, years, maxYears, handleOpenChartModal, reversed]);

//   return (
//     <TrueGridBI 
//     open={ChartModalOpen}
//     onClose={handleCloseChartModal}
//     rowData={rows}
//     clickedRowId={clickedRowId}
//     headers={headerRow}
//     />
//   )
// }
