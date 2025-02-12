import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Box, ListItem, ListItemText, Typography, List, ButtonBase, LinearProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Document, Page, pdfjs } from 'react-pdf';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `./pdf.worker.min.js`;

interface CellValueModalProps {
  open: boolean;
  onClose: () => void;
  searchTerm: string;
  pdfUrl: string;
}

interface Match {
  page: number;
  preview: string;
  count: number;
  positions: number[];
}

const PDF_SEARCH_CHUNK_SIZE = 5; // Pages per processing chunk
const PREVIEW_LENGTH = 35;

const CellValueModal: React.FC<CellValueModalProps> = ({ open, onClose, searchTerm, pdfUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visiblePages, setVisiblePages] = useState(new Set<number>());
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const searchControllerRef = useRef<AbortController | null>(null);

  // Reset state when PDF URL changes
  useEffect(() => {
    const cleanup = () => {
      pdfDocRef.current = null;
      setNumPages(null);
      setMatches([]);
      setVisiblePages(new Set());
      setIsLoading(false);
      searchControllerRef.current?.abort();
    };

    return cleanup;
  }, [pdfUrl]);

  // Handle document load
  const onDocumentLoadSuccess = useCallback((pdf: pdfjs.PDFDocumentProxy) => {
    pdfDocRef.current = pdf;
    setNumPages(pdf.numPages);
    setError(null);
  }, []);

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (!open || !numPages) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const newVisiblePages = new Set(visiblePages);
        entries.forEach(entry => {
          const pageNumber = parseInt(entry.target.getAttribute('data-page') || '0');
          if (entry.isIntersecting) {
            newVisiblePages.add(pageNumber);
          } else {
            newVisiblePages.delete(pageNumber);
          }
        });
        setVisiblePages(newVisiblePages);
      },
      { threshold: 0.1, root: document.querySelector('.pdf-pages-container') }
    );

    return () => observerRef.current?.disconnect();
  }, [open, numPages, visiblePages]);

  // Search processing with chunking
  const processSearch = useCallback(async (searchTerm: string, pdfDoc: pdfjs.PDFDocumentProxy) => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    if (!normalizedSearch) {
      setMatches([]);
      return;
    }

    setIsLoading(true);
    searchControllerRef.current?.abort();
    const controller = new AbortController();
    searchControllerRef.current = controller;

    try {
      const matchesMap = new Map<number, Match>();
      const totalPages = pdfDoc.numPages;
      
      // Process pages in chunks
      for (let chunkStart = 1; chunkStart <= totalPages; chunkStart += PDF_SEARCH_CHUNK_SIZE) {
        if (controller.signal.aborted) break;

        const chunkEnd = Math.min(chunkStart + PDF_SEARCH_CHUNK_SIZE - 1, totalPages);
        const pagePromises = [];
        
        for (let pageNum = chunkStart; pageNum <= chunkEnd; pageNum++) {
          pagePromises.push(
            pdfDoc.getPage(pageNum).then(page => 
              page.getTextContent().then(textContent => {
                const pageText = textContent.items.map(item => (item as TextItem).str).join(' ');
                return { pageNum, pageText };
              })
            )
          );
        }

        const chunkResults = await Promise.all(pagePromises);
        chunkResults.forEach(({ pageNum, pageText }) => {
          const regex = new RegExp(`(${escapeRegExp(normalizedSearch)})`, 'gi');
          const positions: number[] = [];
          let match;
          let preview = '';

          while ((match = regex.exec(pageText)) !== null) {
            positions.push(match.index);
            if (!preview) {
              const start = Math.max(0, match.index - PREVIEW_LENGTH);
              preview = pageText.slice(start, start + PREVIEW_LENGTH * 2);
            }
          }

          if (positions.length > 0) {
            matchesMap.set(pageNum, {
              page: pageNum,
              preview,
              count: positions.length,
              positions
            });
          }
        });
      }

      if (!controller.signal.aborted) {
        setMatches(Array.from(matchesMap.values()));
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err : new Error('Search failed'));
      }
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, []);

  // Trigger search when term changes
  useEffect(() => {
    if (!pdfDocRef.current || !open) return;
    processSearch(searchTerm, pdfDocRef.current);
  }, [searchTerm, open, processSearch]);

  // Highlight text with context awareness
  const customTextRenderer = useCallback(
    (textItem: { str: string }) => {
      if (!searchTerm) return textItem.str;
      const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
      return textItem.str.split(regex).map((part, i) =>
        i % 2 === 1 ? `<mark style="background-color: rgba(255,255,0,0.5); padding: 2px 0;">${part}</mark>` : part
      ).join('');
    },
    [searchTerm]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        PDF Viewer
        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ display: 'flex', height: '80vh', p: 0 }}>
        {/* Search Results Panel */}
        <Box sx={{ width: '300px', borderRight: '1px solid #eee', overflowY: 'auto' }}>
          {isLoading && <LinearProgress />}
          <List dense>
            {matches.map((match) => (
              <ButtonBase
                key={match.page}
                onClick={() => document.getElementById(`page-${match.page}`)?.scrollIntoView({ behavior: 'smooth' })}
                sx={{ width: '100%', textAlign: 'left' }}
              >
                <ListItem>
                  <ListItemText
                    primary={`Page ${match.page} (${match.count} matches)`}
                    secondary={match.preview}
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

        {/* PDF Viewer */}
        <Box sx={{ flex: 1, overflowY: 'auto', position: 'relative' }} className="pdf-pages-container">
          {error ? (
            <Box p={2}>
              <Typography color="error">Error loading PDF: {error.message}</Typography>
            </Box>
          ) : (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={setError}
              loading={<LinearProgress />}
            >
              {Array.from({ length: numPages || 0 }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Box
                    key={pageNumber}
                    id={`page-${pageNumber}`}
                    data-page={pageNumber}
                    ref={(el: HTMLDivElement) => el && observerRef.current?.observe(el)}
                    sx={{ mb: 2 }}
                  >
                    {visiblePages.has(pageNumber) && (
                      <Page
                        pageNumber={pageNumber}
                        width={800}
                        renderTextLayer
                        customTextRenderer={customTextRenderer}
                        loading={<LinearProgress />}
                      />
                    )}
                  </Box>
                );
              })}
            </Document>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Helper function
const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default CellValueModal;