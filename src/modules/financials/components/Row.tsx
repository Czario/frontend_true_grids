import React from 'react';
import { ListItemButton, ListItemText, ListItemIcon, Checkbox } from '@mui/material';

interface RowProps {
  row: any;
  level: number;
  selectedRows: string[];
  handleRowSelect: (rowId: string) => void;
}

const Row: React.FC<RowProps> = ({ row, level, selectedRows, handleRowSelect }) => {
  return (
    <React.Fragment>
      <ListItemButton
        onClick={() => handleRowSelect(row.id)}
        selected={selectedRows.includes(row.id)}
        sx={{ pl: level * 2 }}
      >
        <ListItemIcon sx={{ minWidth: 30 }}>
          <Checkbox
            edge="start"
            checked={selectedRows.includes(row.id)}
            disableRipple
          />
        </ListItemIcon>
        <ListItemText primary={String(row.col0)} />
      </ListItemButton>
      {row.children && row.children.map((child: any) => (
        <Row
          key={child.id}
          row={child}
          level={level + 1}
          selectedRows={selectedRows}
          handleRowSelect={handleRowSelect}
        />
      ))}
    </React.Fragment>
  );
};

export default Row;
