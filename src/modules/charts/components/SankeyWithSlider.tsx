"use client";
import { useState, useEffect, useMemo } from "react";
import { ParentSize } from "@visx/responsive";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import SankeyChart from "@/modules/charts/components/SankeyChart";
import YearSlider from "@/modules/charts/components/YearSlider";
import { SankeyDataType } from "@/modules/charts/interfaces/Sankey";
import { fetchSankeyData } from "@/modules/charts/services/ChartsService";

const stockMetaData = {
  minYear: 2014,
};

// Available dataset keys
const dataKeys = ["MSFT", "TSLA"];
// Available quarters
const quarterOptions = ["Q1", "Q2", "Q3", "Q4"];

function SankeyChartComp() {
  const [selectedDataKey, setSelectedDataKey] = useState(dataKeys[0]);
  const [selectedQuarter, setSelectedQuarter] = useState(quarterOptions[3]); // Default to Q1
  const [selectedData, setSelectedData] = useState<SankeyDataType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSankeyData(
          selectedDataKey,
          selectedQuarter,
          year
        );
        setSelectedData(data);
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDataKey, selectedQuarter, year]);

  const sliderData = useMemo(() => {
    const minYear = stockMetaData.minYear;
    const currentYear = new Date().getFullYear();

    return Array.from({ length: currentYear - minYear + 1 }, (_, i) => ({
      year: minYear + i,
      value: Math.random() * 100,
    }));
  }, [stockMetaData]);

  const handleDataChange = (event: any) => {
    setSelectedDataKey(event.target.value);
  };

  const handleQuarterChange = (event: any) => {
    setSelectedQuarter(event.target.value);
  };

  const handleYearChange = (selectedYear: number) => {
    setYear(selectedYear);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
        <FormControl sx={{ minWidth: 180, marginBottom: 2 }}>
          <InputLabel id="data-select-label">Select Data</InputLabel>
          <Select
            labelId="data-select-label"
            id="data-select"
            value={selectedDataKey}
            label="Select Data"
            onChange={handleDataChange}
          >
            {dataKeys.map((key) => (
              <MenuItem key={key} value={key}>
                {key}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Quarter Selection Dropdown */}
        <FormControl sx={{ minWidth: 180, marginBottom: 2 }}>
          <InputLabel id="quarter-select-label">Select Quarter</InputLabel>
          <Select
            labelId="quarter-select-label"
            id="quarter-select"
            value={selectedQuarter}
            label="Select Quarter"
            onChange={handleQuarterChange}
          >
            {quarterOptions.map((quarter) => (
              <MenuItem key={quarter} value={quarter}>
                {quarter}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <YearSlider
        data={sliderData}
        year={year}
        handleYearChange={handleYearChange}
      />

      <div
        style={{
          height: "500px",
          width: "70%",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "red", padding: "2rem" }}>
            {error}
          </div>
        ) : (
          selectedData &&
          selectedData.nodes?.length > 0 && (
            <ParentSize>
              {({ width, height }) => (
                <SankeyChart
                  width={width}
                  height={height}
                  sankeyData={selectedData}
                />
              )}
            </ParentSize>
          )
        )}
      </div>
    </div>
  );
}

export default SankeyChartComp;
