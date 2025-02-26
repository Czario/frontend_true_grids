"use client";
import React, { useState } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Box, TextField, Button } from "@mui/material";

const initialLayout: Layout[] = [
  { i: "1", x: 0, y: 0, w: 4, h: 4 },
  { i: "2", x: 4, y: 0, w: 4, h: 2 },
  { i: "3", x: 8, y: 0, w: 4, h: 2 },
];

const FinancialInfographic: React.FC = () => {
  const [layout, setLayout] = useState<Layout[]>(initialLayout);
  const [content, setContent] = useState<{ [key: string]: string }>({});
  const [images, setImages] = useState<{ [key: string]: string }>({});

  const handleTextChange = (id: string, value: string) => {
    setContent((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setImages((prev) => ({ ...prev, [id]: e.target.result as string }));
        }
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  return (
    <Box sx={{ width: "100%", padding: "20px", background: "#f5f5f5" }}>
      <h1 style={{ textAlign: "center", color: "#e82127" }}>
        Tesla Financial Infographic
      </h1>
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
        onLayoutChange={(newLayout) => setLayout(newLayout)}
        draggableHandle=".drag-handle"
      >
        {layout.map((item) => (
          <div
            key={item.i}
            style={{
              background: "#fff",
              border: "2px solid #e82127",
              borderRadius: "8px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div
              className="drag-handle"
              style={{
                background: "#e82127",
                color: "#fff",
                padding: "6px 10px",
                cursor: "move",
                fontWeight: "bold",
              }}
            >
              Item {item.i}
            </div>
            <div style={{ padding: "10px", flex: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                placeholder="Enter financial data..."
                value={content[item.i] || ""}
                onChange={(e) => handleTextChange(item.i, e.target.value)}
              />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(item.i, e)} />
              {images[item.i] && <img src={images[item.i]} alt="Uploaded" style={{ width: "100%", marginTop: "10px" }} />}
            </div>
          </div>
        ))}
      </GridLayout>
    </Box>
  );
};

export default FinancialInfographic;
