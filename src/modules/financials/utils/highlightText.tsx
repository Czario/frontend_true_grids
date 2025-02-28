import React from 'react';
import { Box } from '@mui/material';

interface HighlightedTextProps {
  text: string;
  searchTerm: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, searchTerm }) => {
  if (!searchTerm || typeof text !== 'string') {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => (
        regex.test(part) ? (
          <mark key={i} style={{ backgroundColor: 'yellow', padding: 0 }}>
            {part}
          </mark>
        ) : (
          part
        )
      ))}
    </>
  );
};

export const highlightText = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || !text) return text;
  
  try {
    // Case insensitive search
    const searchRegex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(searchRegex);
    
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
    // Fallback to plain text if any error occurs in highlighting
    return text;
  }
};
