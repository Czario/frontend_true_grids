"use client";

import { useState, useEffect } from "react";
import { fetchStatement } from "@/modules/financials/services/apiStatementService";
import StatementTable from "@/modules/financials/components/StatementTable";
import { Box, Button, ButtonGroup, CircularProgress, Typography, styled } from "@mui/material";
import { DataItem } from "@/modules/financials/interfaces/financials";

interface StatementButtonProps {
  selected: boolean;
}

const StatementButton = styled(Button)<StatementButtonProps>(({ theme, selected }) => ({
  fontWeight: selected ? 600 : 400,
  textTransform: 'capitalize',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  backgroundColor: selected ? theme.palette.primary.dark : 'transparent',
  color: selected ? "white" : theme.palette.text.primary,
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: selected ? theme.palette.primary.light : theme.palette.action.hover,
  },
  padding: '8px 24px',
  borderRadius: '8px',
  margin: '0 4px',
}));

const Home: React.FC = () => {
  const [statementType, setStatementType] = useState<string>("incomeStatement");
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
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          width: "100%",
          mb: 4,
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ 
          fontWeight: 700,
          color: 'primary.main',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          TrueGrids Financials
        </Typography>

        <ButtonGroup variant="outlined" aria-label="financial statements switch">
          <StatementButton 
            onClick={() => setStatementType("incomeStatement")}
            selected={statementType === "incomeStatement"}
          >
            📈 Income Statement
          </StatementButton>
          <StatementButton 
            onClick={() => setStatementType("cashFlow")}
            selected={statementType === "cashFlow"}
          >
            💰 Cashflow Statement
          </StatementButton>
          <StatementButton 
            onClick={() => setStatementType("balanceSheet")}
            selected={statementType === "balanceSheet"}
          >
            🏦 Balance Sheet
          </StatementButton>
        </ButtonGroup>
      </Box>

      {loading && (
        <CircularProgress size={60} thickness={4} sx={{ 
          margin: "20px auto", 
          display: "block",
          color: 'primary.main' 
        }} />
      )}
      
      {error && (
        <Typography color="error" variant="h6" sx={{ textAlign: 'center' }}>
          ⚠️ {error}
        </Typography>
      )}

      {!loading && !error && data.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          📭 No data available for the selected statement type
        </Typography>
      )}

      {!loading && !error && data.length > 0 && (
        <StatementTable 
          data={data} 
          key={statementType} // Force remount on statement change
        />
      )}
    </div>
  );
};

export default Home;