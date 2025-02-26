import React, { useState } from 'react';
import SheetDesigner, { SheetData } from './SheetDesigner';
import DashboardDesigner, { DashboardData } from './DashboardDesigner';
import DashboardList from './DashboardList';
import { AppBar, Toolbar, Button, Container, IconButton, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewListIcon from '@mui/icons-material/ViewList';
import InsertChartIcon from '@mui/icons-material/InsertChart';

type View = 'sheet' | 'dashboardDesigner' | 'dashboardList';

interface SheetWithId extends SheetData {
  id: number;
}

interface DashboardWithId extends DashboardData {
  id: number;
}

const BI_Home: React.FC = () => {
  const [view, setView] = useState<View>('sheet');
  const [sheets, setSheets] = useState<SheetWithId[]>([]);
  const [dashboards, setDashboards] = useState<DashboardWithId[]>([]);

  const saveSheet = (sheetData: SheetData) => {
    const newSheet: SheetWithId = { id: sheets.length + 1, ...sheetData };
    setSheets((prev) => [...prev, newSheet]);
    alert(`Sheet ${newSheet.id} saved!`);
  };

  const saveDashboard = (dashboardData: DashboardData) => {
    const newDashboard: DashboardWithId = { id: dashboards.length + 1, ...dashboardData };
    setDashboards((prev) => [...prev, newDashboard]);
    alert(`Dashboard "${newDashboard.name}" saved!`);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => setView('sheet')}>
            <InsertChartIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            BI Tool
          </Typography>
          <Button color="inherit" onClick={() => setView('sheet')}>
            Sheet Designer
          </Button>
          <Button color="inherit" onClick={() => setView('dashboardDesigner')}>
            Dashboard Designer
          </Button>
          <Button color="inherit" onClick={() => setView('dashboardList')}>
            Dashboard List
          </Button>
        </Toolbar>
      </AppBar>
      <Container style={{ padding: '10px' }}>
        {view === 'sheet' && <SheetDesigner saveSheet={saveSheet} />}
        {view === 'dashboardDesigner' && (
          <DashboardDesigner sheets={sheets} saveDashboard={saveDashboard} />
        )}
        {view === 'dashboardList' && <DashboardList dashboards={dashboards} sheets={sheets} />}
      </Container>
    </div>
  );
};

export default BI_Home;
