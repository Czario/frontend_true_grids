"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getCookie } from "@/modules/auth/utils/cookies";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/contexts/AppStoreContext";

import { fetchStatement } from "@/modules/financials/services/apiStatementService";
import StatementTable from "@/modules/financials/components/StatementTable";
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Typography,
  styled,
} from "@mui/material";
import { DataItem } from "@/modules/financials/interfaces/financials";

interface StatementButtonProps {
  selected: boolean;
}

const StatementButton = styled(Button)<StatementButtonProps>(
  ({ theme, selected }) => ({
    fontWeight: selected ? 300 : 200,
    textTransform: "capitalize",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    border: selected
      ? `2px solid ${theme.palette.primary.main}`
      : "2px solid transparent",
    backgroundColor: selected ? theme.palette.primary.dark : "transparent",
    color: selected ? "white" : theme.palette.text.primary,
    "&:hover": {
      transform: "translateY(-2px)",
      backgroundColor: selected
        ? theme.palette.primary.light
        : theme.palette.action.hover,
    },
    padding: "4px 6px",
    borderRadius: "8px",
    margin: "0 4px",
  })
);

const Home: React.FC = () => {
  const [statementType, setStatementType] =
    useState<string>("Income Statement");
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUserlogin } = useAppStore();

  useEffect(() => {
    console.log(getCookie("login"));
    if (getCookie("login") !== "true") {
      router.replace("/login");
    }
  }, []);

  // Cache for storing data by statement type.
  const cacheRef = useRef<Record<string, DataItem[]>>({});
  // Ref for AbortController to cancel ongoing fetches.
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (type: string) => {
    // Check if data exists in cache first.
    if (cacheRef.current[type]) {
      setData(cacheRef.current[type]);
      setLoading(false);
      return; // Skip the API call.
    }

    // Cancel any ongoing API request if it exists.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // Pass the abort signal through the options parameter.
      const response = await fetchStatement(
        type,
        {
          signal: controller.signal,
        },
        setUserlogin
      );
      // Cache the fetched data.
      cacheRef.current[type] = response.data;
      setData(response.data);
    } catch (err: any) {
      // Ignore abort errors.
      if (err.name !== "AbortError") {
        setError("Failed to fetch financial data.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(statementType);

    // Cleanup function to abort fetch when the component unmounts.
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [statementType, fetchData]);

  return (
    <div style={{ padding: "5px" }}>
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
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "primary.main",
            textAlign: "center",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          TrueGrids Financials
        </Typography>

        <ButtonGroup
          variant="outlined"
          aria-label="financial statements switch"
        >
          <StatementButton
            onClick={() => setStatementType("Income Statement")}
            selected={statementType === "Income Statement"}
          >
            📈 Income Statement
          </StatementButton>
          <StatementButton
            onClick={() => setStatementType("Cash Flow")}
            selected={statementType === "Cash Flow"}
          >
            💰 Cashflow Statement
          </StatementButton>
          <StatementButton
            onClick={() => setStatementType("Balance Sheet")}
            selected={statementType === "Balance Sheet"}
          >
            🏦 Balance Sheet
          </StatementButton>
        </ButtonGroup>
      </Box>

      {loading && (
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            margin: "20px auto",
            display: "block",
            color: "primary.main",
          }}
        />
      )}

      {error && (
        <Typography color="error" variant="h6" sx={{ textAlign: "center" }}>
          ⚠️ {error}
        </Typography>
      )}

      {!loading && !error && data.length === 0 && (
        <Typography
          variant="h6"
          sx={{ textAlign: "center", color: "text.secondary" }}
        >
          📭 No data available for the selected statement type
        </Typography>
      )}

      {!loading && !error && data.length > 0 && (
        <StatementTable
          data={data}
          key={statementType} // Force remount on statement change if needed.
        />
      )}
    </div>
  );
};

export default Home;
