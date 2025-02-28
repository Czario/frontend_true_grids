import React, { useMemo } from 'react';
import { Box } from '@mui/material';

interface HighlightedTextProps {
  text: string;
  searchTerm: string;
}

// Memoized component for text highlighting
export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, searchTerm }) => {
  // Use memoization to avoid unnecessary re-renders
  const content = useMemo(() => {
    if (!searchTerm || typeof text !== 'string') {
      return <>{text}</>;
    }

    try {
      // Normalize strings for better matching
      const normalizedText = text.toLowerCase();
      const normalizedSearchTerm = searchTerm.toLowerCase();
      
      // Quick check if search term exists in the text
      if (!normalizedText.includes(normalizedSearchTerm)) {
        return <>{text}</>;
      }
      
      // Escape special regex characters
      const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
      const parts = text.split(regex);
      
      if (parts.length <= 1) return <>{text}</>;
      
      return (
        <>
          {parts.map((part, i) => 
            part.toLowerCase() === searchTerm.toLowerCase() ? (
              <Box 
                component="span" 
                key={i} 
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 0, 0.4)',
                  fontWeight: 'medium'
                }}
              >
                {part}
              </Box>
            ) : part
          )}
        </>
      );
    } catch (e) {
      return <>{text}</>;
    }
  }, [text, searchTerm]);

  return content;
};

// Optimized function for performance-critical contexts
export const highlightText = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || !text) return text;
  
  // Quick check if search term exists in the text
  if (!text.toLowerCase().includes(searchTerm.toLowerCase())) {
    return text;
  }
  
  try {
    // Escape special regex characters
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    const parts = text.split(regex);
    
    if (parts.length <= 1) return text;
    
    return (
      <>
        {parts.map((part, i) => {
          if (part.toLowerCase() === searchTerm.toLowerCase()) {
            return (
              <Box 
                component="span" 
                key={i} 
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 0, 0.4)',
                  fontWeight: 'medium'
                }}
              >
                {part}
              </Box>
            );
          }
          return part;
        })}
      </>
    );
  } catch (e) {
    return text;
  }
};
