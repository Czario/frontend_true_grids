import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { normalizeSearchText } from './searchUtils';

interface HighlightedTextProps {
  text: string;
  searchTerm: string;
}

// Improved function to find all matches of a search term in text
const findMatches = (text: string, searchTerm: string): Array<{start: number, end: number}> => {
  if (!text || !searchTerm) return [];
  
  const normalizedText = normalizeSearchText(text);
  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  
  if (normalizedSearchTerm.length === 0 || normalizedText.length === 0) return [];
  
  // Split search term into individual words for highlighting each word
  const terms = normalizedSearchTerm.split(/\s+/).filter(term => term.length > 0);
  const matches: Array<{start: number, end: number}> = [];
  
  // Handle each term separately
  terms.forEach(term => {
    let startPos = 0;
    let matchPos = -1;
    
    // Find all occurrences of this term
    while ((matchPos = normalizedText.indexOf(term, startPos)) !== -1) {
      // Map position in normalized text back to original text
      let originalStart = matchPos;
      let originalEnd = Math.min(text.length, originalStart + term.length);
      
      // Find matching portion in original text
      while (originalStart > 0 && 
             normalizeSearchText(text.substring(0, originalStart)).length > matchPos) {
        originalStart--;
      }
      
      while (originalEnd < text.length && 
             normalizeSearchText(text.substring(0, originalEnd)).length < matchPos + term.length) {
        originalEnd++;
      }
      
      matches.push({
        start: originalStart,
        end: originalEnd
      });
      
      startPos = matchPos + term.length;
    }
  });
  
  // Sort matches by position and merge overlapping ones
  return mergeOverlappingRanges(matches.sort((a, b) => a.start - b.start));
};

// Merge overlapping highlight ranges
const mergeOverlappingRanges = (ranges: Array<{start: number, end: number}>): Array<{start: number, end: number}> => {
  if (ranges.length <= 1) return ranges;
  
  const result: Array<{start: number, end: number}> = [];
  let currentRange = ranges[0];
  
  for (let i = 1; i < ranges.length; i++) {
    const nextRange = ranges[i];
    
    if (nextRange.start <= currentRange.end) {
      // Ranges overlap, merge them
      currentRange = {
        start: currentRange.start,
        end: Math.max(currentRange.end, nextRange.end)
      };
    } else {
      // No overlap, add current range and move to next
      result.push(currentRange);
      currentRange = nextRange;
    }
  }
  
  // Add the last range
  result.push(currentRange);
  return result;
};

// Enhanced component for text highlighting
export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, searchTerm }) => {
  const content = useMemo(() => {
    if (!searchTerm || typeof text !== 'string') {
      return <>{text}</>;
    }

    try {
      const matches = findMatches(text, searchTerm);
      
      if (matches.length === 0) return <>{text}</>;
      
      // Build the highlighted content
      const parts: React.ReactNode[] = [];
      let lastEnd = 0;
      
      matches.forEach((match, index) => {
        // Add text before match
        if (match.start > lastEnd) {
          parts.push(text.substring(lastEnd, match.start));
        }
        
        // Add highlighted match
        parts.push(
          <Box 
            component="span" 
            key={`highlight-${index}`}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 0, 0.4)',
              fontWeight: 'medium'
            }}
          >
            {text.substring(match.start, match.end)}
          </Box>
        );
        
        lastEnd = match.end;
      });
      
      // Add remaining text after last match
      if (lastEnd < text.length) {
        parts.push(text.substring(lastEnd));
      }
      
      return <>{parts}</>;
      
    } catch (e) {
      console.error("Error highlighting text:", e);
      return <>{text}</>;
    }
  }, [text, searchTerm]);

  return content;
};

// Optimized function for highlighting - similar logic but more performance-focused
export const highlightText = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || !text) return text;
  
  try {
    const matches = findMatches(text, searchTerm);
    
    if (matches.length === 0) return text;
    
    // Build the highlighted content
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;
    
    matches.forEach((match, index) => {
      // Add text before match
      if (match.start > lastEnd) {
        parts.push(text.substring(lastEnd, match.start));
      }
      
      // Add highlighted match
      parts.push(
        <Box 
          component="span" 
          key={`highlight-${index}`}
          sx={{ 
            backgroundColor: 'rgba(255, 255, 0, 0.4)',
            fontWeight: 'medium'
          }}
        >
          {text.substring(match.start, match.end)}
        </Box>
      );
      
      lastEnd = match.end;
    });
    
    // Add remaining text after last match
    if (lastEnd < text.length) {
      parts.push(text.substring(lastEnd));
    }
    
    return <>{parts}</>;
  } catch (e) {
    console.error("Error highlighting text:", e);
    return text;
  }
};
