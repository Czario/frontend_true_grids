"use client";
import { useState, useEffect } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { searchPlugin } from "@react-pdf-viewer/search";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import "@react-pdf-viewer/core/lib/styles/index.css";
import packageJson from '../../../../package.json';

interface PdfModalProps {
  open: boolean;
  onClose: () => void;
  searchTerm: string;
  pdfUrl: string;
}

export default function EnhancedDocViewer({
  searchTerm,
  onClose,
  open,
  pdfUrl,
}: PdfModalProps) {
  const [workerReady, setWorkerReady] = useState(false);
  const searchPluginInstance = searchPlugin();
  const toolbarPluginInstance = toolbarPlugin();
  const { Toolbar } = toolbarPluginInstance;
  const { highlight, clearHighlights } = searchPluginInstance;

  // Get exact PDF.js version from package.json
  const pdfjsVersion = packageJson.dependencies['pdfjs-dist'].replace(/^\^/, '');

  useEffect(() => {
    if (open) {
      setWorkerReady(true);
      highlight(searchTerm ? [searchTerm] : []);
    }
    return () => {
      clearHighlights();
      setWorkerReady(false);
    };
  }, [open, searchTerm]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent style={{ height: "80vh", display: "flex", flexDirection: "column" }}>
        {workerReady && (
          <Worker workerUrl={`/pdf.worker.min.js?v=${pdfjsVersion}`}>
            <div style={{
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}>
              <Toolbar />
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <Viewer
                fileUrl={pdfUrl}
                plugins={[searchPluginInstance, toolbarPluginInstance]}
                onDocumentLoad={() => highlight(searchTerm ? [searchTerm] : [])}
              />
            </div>
          </Worker>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            clearHighlights();
            onClose();
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
