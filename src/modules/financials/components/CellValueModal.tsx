import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  ListItem,
  ListItemText,
  Typography,
  List,
  ButtonBase,
  LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

interface CellValueModalProps {
  open: boolean;
  onClose: () => void;
  searchTerm: string;
  pdfUrl: string;
}

interface Match {
  page: number;
  text: string;
  positions: [number, number][];
}

const escapeRegExp = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const PageWithHighlight: React.FC<{
  pageNumber: number;
  searchTerm: string;
  width: number;
  loading: React.ReactNode;
}> = ({ pageNumber, searchTerm, width, loading }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const applyHighlights = useCallback(() => {
    if (!containerRef.current || !searchTerm) return;

    const textLayer = containerRef.current.querySelector('.react-pdf__Page__textContent');
    if (!textLayer) return;

    const spans = textLayer.querySelectorAll('span');

    spans.forEach(span => {
      const text = span.textContent || '';
      const lowerCaseText = text.toLowerCase();

      if (lowerCaseText.includes(searchTerm.toLowerCase())) {
        span.style.backgroundColor = 'yellow';
      } else {
        span.style.backgroundColor = '';
      }
    });
  }, [searchTerm]);

  useEffect(() => {
    if (!containerRef.current) return;

    const textLayer = containerRef.current.querySelector('.react-pdf__Page__textContent');
    if (!textLayer) return;

    applyHighlights(); // Apply initially

    const observer = new MutationObserver(applyHighlights);
    observer.observe(textLayer, {
      childList: true,
      subtree: true,
      characterData: true, // This is the KEY FIX
    });

    return () => observer.disconnect();
  }, [applyHighlights]);

  return (
    <div ref={containerRef} id={`page-${pageNumber}`} style={{ marginBottom: '16px' }}>
      <Page
        pageNumber={pageNumber}
        width={width}
        renderTextLayer={true}
        loading={loading}
      />
    </div>
  );
};

const CellValueModal: React.FC<CellValueModalProps> = ({
  open,
  onClose,
  searchTerm,
  pdfUrl,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const searchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) {
      pdfDocRef.current = null;
      setNumPages(null);
      setMatches([]);
      setIsLoading(false);
      searchControllerRef.current?.abort();
    }
  }, [open, pdfUrl]);

  const onDocumentLoadSuccess = useCallback((pdf: pdfjs.PDFDocumentProxy) => {
    pdfDocRef.current = pdf;
    setNumPages(pdf.numPages);
    setError(null);
  }, []);

  const processSearch = useCallback(async (keyword: string) => {
    //const normalizedKeyword = keyword.trim();
    const normalizedKeyword = 'elon musk';
    if (!normalizedKeyword) {
      setMatches([]);
      return;
    }
    setIsLoading(true);
    searchControllerRef.current?.abort();
    const controller = new AbortController();
    searchControllerRef.current = controller;
    try {
      const response = await fetch('http://127.0.0.1:3000/stock-serve/process-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: normalizedKeyword }),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setError(err instanceof Error ? err : new Error('Search failed'));
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    processSearch(searchTerm);
  }, [searchTerm, open, processSearch]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        PDF Viewer
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', height: '80vh', p: 0 }}>
        <Box sx={{ width: '300px', borderRight: '1px solid #eee', overflowY: 'auto' }}>
          {isLoading && <LinearProgress />}
          <List dense>
            {matches.map((match) => (
              <ButtonBase
                key={match.page}
                onClick={() => {
                  const el = document.getElementById(`page-${match.page}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                sx={{ width: '100%', textAlign: 'left' }}
              >
                <ListItem>
                  <ListItemText
                    primary={`Page ${match.page} (${match.positions.length} match${match.positions.length > 1 ? 'es' : ''})`}
                    secondary={
                      match.text.slice(0, 100) +
                      (match.text.length > 100 ? '...' : '')
                    }
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItem>
              </ButtonBase>
            ))}
            {!isLoading && matches.length === 0 && searchTerm && (
              <ListItem>
                <ListItemText primary="No matches found" />
              </ListItem>
            )}
          </List>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', position: 'relative' }} className="pdf-pages-container">
          {error ? (
            <Box p={2}>
              <Typography color="error">
                Error loading PDF: {error.message}
              </Typography>
            </Box>
          ) : (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(err) => {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                setError(err);
              }}
              loading={<LinearProgress />}
            >
              {Array.from({ length: numPages || 0 }, (_, i) => (
                <PageWithHighlight
                  key={i + 1}
                  pageNumber={i + 1}
                  width={800}
                  loading={<LinearProgress />}
                  searchTerm={searchTerm}
                />
              ))}
            </Document>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CellValueModal;