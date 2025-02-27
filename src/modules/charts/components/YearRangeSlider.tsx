"use client";
import React, { useMemo } from "react";
import { Box, Slider, Typography } from "@mui/material";

interface YearRangeSliderProps {
  data: { date: string }[];
  range: number[];
  setRangeSelection: (newRange: number[]) => void;
}

const YearRangeSlider: React.FC<YearRangeSliderProps> = ({
  data,
  range,
  setRangeSelection,
}) => {
  const dates = useMemo(() => {
    return [...new Set(data.map((item) => item.date))].sort();
  }, [data]);

  const marks = useMemo(() => {
    const yearLabels = new Set<number>();
    return dates.map((date, index) => {
      const year = new Date(date).getFullYear();
      const label = yearLabels.has(year) ? "" : `${year}`; // Show label only once per year
      yearLabels.add(year);
      return { value: index, label };
    });
  }, [dates]);

  const handleChange = (_: unknown, newValue: number | number[]) => {
    setRangeSelection(newValue as number[]);
  };

  if (!marks.length) {
    return <Typography color="error">No valid dates found</Typography>;
  }

  return (
    <Box sx={{ width: "80%", margin: "auto", mt: 5 }}>
      <Typography textAlign="center" mb={2}>
        {dates[range[0]]} - {dates[range[1]]}
      </Typography>
      <Slider
        value={range}
        onChange={handleChange}
        valueLabelDisplay="auto"
        marks={marks}
        step={1}
        min={0}
        max={dates.length - 1}
        sx={{
          "& .MuiSlider-thumb": { bgcolor: "primary.main" },
          "& .MuiSlider-track": { bgcolor: "primary.main" },
          "& .MuiSlider-rail": { bgcolor: "grey.300" },
        }}
      />
    </Box>
  );
};

export default YearRangeSlider;
