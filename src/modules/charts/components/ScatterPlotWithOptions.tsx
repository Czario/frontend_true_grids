import { useState } from "react";
import ScatterPlot from "./ScatterPlot";
import {
  Box,
  Stack,
  Autocomplete,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Paper,
} from "@mui/material";

const stockOptions = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "TSLA",
  "META",
  "NFLX",
  "NVDA",
];

type FinancialData = {
  stock: string;
  [key: string]: string | number;
};

const financialData: FinancialData[] = [
  { stock: "AAPL", revenue: 400, grossProfit: 200, netIncome: 90 },
  { stock: "MSFT", revenue: 370, grossProfit: 180, netIncome: 80 },
  { stock: "GOOGL", revenue: 450, grossProfit: 220, netIncome: 110 },
  { stock: "AMZN", revenue: 460, grossProfit: 250, netIncome: 120 },
  { stock: "TSLA", revenue: 390, grossProfit: 160, netIncome: 70 },
  { stock: "META", revenue: 420, grossProfit: 230, netIncome: 100 },
  { stock: "NFLX", revenue: 350, grossProfit: 140, netIncome: 60 },
  { stock: "NVDA", revenue: 480, grossProfit: 280, netIncome: 130 },
];

const keys = [
  { key: "revenue", color: "#4CAF50" },
  { key: "grossProfit", color: "#FF9800" },
  { key: "netIncome", color: "#F44336" },
];

const App = () => {
  const [selectedStocks, setSelectedStocks] = useState([
    "AAPL",
    "MSFT",
    "GOOGL",
  ]);
  const [xAxisField, setXAxisField] = useState<string>("grossProfit");
  const [yAxisField, setYAxisField] = useState<string>("revenue");

  return (
    <Box sx={{ p: 4, maxWidth: 800, margin: "auto" }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Fields
        </Typography>
        <Stack spacing={2}>
          {/* Multi-Select Dropdown for Stocks */}
          <Autocomplete
            multiple
            options={stockOptions}
            value={selectedStocks}
            onChange={(_, newValue) => setSelectedStocks(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select Stocks" variant="outlined" />
            )}
          />

          {/* X-Axis & Y-Axis Selection */}
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel>X-Axis</InputLabel>
              <Select
                value={xAxisField}
                onChange={(e) => setXAxisField(e.target.value)}
                label="X-Axis"
              >
                <MenuItem value="grossProfit">Gross Profit</MenuItem>
                <MenuItem value="revenue">Revenue</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Y-Axis</InputLabel>
              <Select
                value={yAxisField}
                onChange={(e) => setYAxisField(e.target.value)}
                label="Y-Axis"
              >
                <MenuItem value="revenue">Revenue</MenuItem>
                <MenuItem value="grossProfit">Gross Profit</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>
      <Box mt={4}>
        <ScatterPlot
          width={600}
          height={400}
          keys={keys}
          selectedStocks={selectedStocks}
          financialData={financialData}
          xAxisField={xAxisField}
          yAxisField={yAxisField}
        />
      </Box>
    </Box>
  );
};

export default App;
