"use client";

import { useState, useEffect } from "react";
import { fetchStatement } from "@/modules/financials/services/apiStatementService";
import StatementTable from "@/modules/financials/components/StatementTable";
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Typography,
} from "@mui/material";
import { DataItem } from "@/modules/financials/interfaces/financials";

const Home: React.FC = () => {
  const [statementType, setStatementType] = useState<string>("balanceSheet");
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchStatement(statementType);
        setData(response.data);
      } catch (err) {
        setError("Failed to fetch financial data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [statementType]);
  return (
    <div style={{ padding: "20px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography variant="h3" gutterBottom>
          TrueGrids Financials
        </Typography>
      </Box>
      
      <ButtonGroup
        variant="contained"
        aria-label="outlined primary button group"
      >
        <Button onClick={() => setStatementType("incomeStatement")}>
          Income Statement
        </Button>
        <Button onClick={() => setStatementType("cashFlow")}>
          Cashflow Statement
        </Button>
        <Button onClick={() => setStatementType("balanceSheet")}>
          Balance Sheet
        </Button>
      </ButtonGroup>

      {loading && (
        <CircularProgress style={{ margin: "20px auto", display: "block" }} />
      )}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && data.length === 0 && (
        <Typography>
          No data available for the selected statement type.
        </Typography>
      )}

      {!loading && !error && data.length > 0 && <StatementTable data={data} />}
    </div>
  );
};

export default Home;
