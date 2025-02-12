import React, { useState, useEffect, useCallback, useRef } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;
}

interface CellValueModalProps {
  open: boolean;
  onClose: () => void;
  searchTerm: string;
  pdfUrl: string;
}

interface Match {
  page: number;
  matchText: string;
  index: number;
}

const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const [version, setVersion] = useState(0); // Force re-render when search changes

  const onDocumentLoadSuccess = (pdf: pdfjs.PDFDocumentProxy) => {
    if (!pdfDocRef.current) {
      setNumPages(pdf.numPages);
      pdfDocRef.current = pdf;
      setError(null);
    }
  };

  const onDocumentLoadError = (err: Error) => {
    console.error('Error loading PDF document:', err);
    setError(err);
  };

  useEffect(() => {
    if (!pdfDocRef.current) return;

    // Reset matches when search term changes
    if (!searchTerm) {
      setMatches([]);
      return;
    }

    let isMounted = true;
    const cancelTokens: AbortController[] = [];

    const performSearch = async () => {
      const regex = new RegExp(escapeRegExp(searchTerm), 'gi');
      
      const pagePromises = Array.from({ length: pdfDocRef.current!.numPages }, (_, i) => {
        const controller = new AbortController();
        cancelTokens.push(controller);

        return pdfDocRef.current!
          .getPage(i + 1)
          .then((page) => page.getTextContent())
          .then((textContent) => {
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            const pageMatches: Match[] = [];
            let match;
            while ((match = regex.exec(pageText)) !== null) {
              pageMatches.push({
                page: i + 1,
                matchText: match[0],
                index: match.index,
              });
            }
            return pageMatches;
          })
          .catch((error) => {
            if (error.name === 'AbortError') {
              console.log('TextLayer task cancelled');
            } else {
              throw error;
            }
          });
      });

      const results = await Promise.all(pagePromises);
      if (isMounted) {
        const allMatches = results.flat().filter((match): match is Match => match !== undefined);
        setMatches(allMatches);
        setVersion(v => v + 1); // Update version for re-render
      }
    };

    performSearch();
    return () => {
      isMounted = false;
      cancelTokens.forEach((controller) => controller.abort());
    };
  }, [searchTerm, numPages]);

  const handleMatchClick = (pageNumber: number) => {
    const element = document.getElementById(`page_${pageNumber}`);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const customTextRenderer = useCallback(
    (textItem: any) => {
      if (!searchTerm) return textItem.str;
      const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'i');
      const parts = textItem.str.split(regex);
      
      return (
        <span>
          {parts.map((part: string, index: number) =>
            index % 2 === 1 ? (
              <span key={index} style={{ backgroundColor: 'yellow' }}>
                {part}
              </span>
            ) : (
              part
            )
          )}
        </span>
      );
    },
    [searchTerm]
  );

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
        <Box
          sx={{
            width: '25%',
            borderRight: '1px solid #ccc',
            p: 2,
            overflowY: 'auto',
            backgroundColor: '#f5f5f5',
          }}
        >
          <List>
            {matches.length > 0 ? (
              matches.map((match, index) => (
                <ButtonBase
                  key={`${match.page}_${index}`}
                  onClick={() => handleMatchClick(match.page)}
                  sx={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    '&:hover': { backgroundColor: '#e0e0e0' },
                  }}
                >
                  <ListItem component="div">
                    <ListItemText
                      primary={`Page ${match.page}`}
                      secondary={match.matchText}
                    />
                  </ListItem>
                </ButtonBase>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary={searchTerm ? "No matches found" : "Enter a search term"}
                />
              </ListItem>
            )}
          </List>
        </Box>

        <Box sx={{ width: '75%', overflowY: 'auto', p: 2 }}>
          {error ? (
            <Typography color="error">
              Error loading PDF: {error.message || 'Unknown error'}
            </Typography>
          ) : (
            <Document
              key={pdfUrl}
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
            >
              {Array.from({ length: numPages || 0 }, (_, index) => (
                <div key={`page_${index + 1}`} id={`page_${index + 1}`}>
                  <Page
                    key={`page_${index + 1}_${version}`}
                    pageNumber={index + 1}
                    width={800}
                    renderTextLayer
                    renderAnnotationLayer
                    customTextRenderer={customTextRenderer}
                  />
                </div>
              ))}
            </Document>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CellValueModal;