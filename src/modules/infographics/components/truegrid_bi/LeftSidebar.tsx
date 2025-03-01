import React, { useEffect, useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Tabs,
  Tab,
  Divider,
  TextField,
  ListItemIcon,
  Checkbox,
  IconButton,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface LeftSidebarProps {
  items: any[];
  selectedRows: string[];
  handleRowSelect: (rowId: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  tabIndex: number;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  items,
  selectedRows,
  handleRowSelect,
  searchTerm,
  setSearchTerm,
  tabIndex,
  handleTabChange,
  isSidebarExpanded,
  toggleSidebar,
}) => {
  const [renderedItems, setRenderedItems] = useState<any[]>([]);

  useEffect(() => {
    console.log('Original items:', items);
    const uniqueItems = removeDuplicates(items);
    setRenderedItems(uniqueItems);
  }, [items]);

  const removeDuplicates = (items: any[]) => {
    const seen = new Set();
    const filterItems = (items: any[]) => {
      return items.filter(item => {
        if (seen.has(item.id)) {
          return false;
        }
        seen.add(item.id);
        if (item.children) {
          item.children = filterItems(item.children);
        }
        return true;
      });
    };
    return filterItems(items);
  };

  const renderRow = (row: any, level: number = 0) => {
    console.log(`Rendering row: ${row.id}, level: ${level}`);
    return (
      <React.Fragment key={row.id}>
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
        {row.children && row.children.map((child: any) => renderRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <Box
      sx={{
        width: isSidebarExpanded ? '20%' : '2%',
        height: '100%',
        overflowY: isSidebarExpanded ? 'auto' : 'hidden',
        p: isSidebarExpanded ? 2 : 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'white',
        transition: 'width 0.3s, padding 0.3s',
        position: 'relative',
      }}
    >
      <IconButton onClick={toggleSidebar} sx={{ mb: 1, position: 'absolute', top: 8, right: isSidebarExpanded ? -10 : -8, zIndex: 1 }}>
        {isSidebarExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>
      {isSidebarExpanded && (
        <>
          <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Suggested" />
            <Tab label="All" />
          </Tabs>
          <Divider sx={{ my: 1 }} />
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <List>
            {renderedItems.map(item => renderRow(item))}
          </List>
        </>
      )}
    </Box>
  );
};

export default LeftSidebar;