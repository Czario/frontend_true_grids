/**
 * Utility functions for advanced search capabilities
 */

/**
 * Normalizes text for consistent search matching by removing special characters,
 * extra spaces, and converting to lowercase
 */
export const normalizeSearchText = (text: string): string => {
  if (typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s.-]/g, '') // Remove special characters except dots and hyphens
    .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
    .replace(/,/g, '')         // Remove commas in numbers
    .trim();
};

/**
 * Prepares row data for searching by extracting searchable content
 * from all fields and returning a single normalized string
 */
export const prepareForSearch = (rowData: Record<string, any>): string => {
  // Skip certain fields that aren't useful for searching
  const skipFields = ['id', 'hasChildren', 'children', '__expanded', 'depth', 'subRows'];
  
  // Convert row data to searchable string
  return Object.entries(rowData)
    .filter(([key, value]) => 
      // Only include string and number values from meaningful fields
      (typeof value === 'string' || typeof value === 'number') && 
      !skipFields.includes(key)
    )
    .map(([_, value]) => String(value))
    .join(' ');
};

/**
 * Split search terms and perform multi-term matching 
 * with advanced logic for partial matches
 */
export const multiTermSearch = (text: string, searchTerms: string): boolean => {
  if (!text || !searchTerms) return false;
  
  const normalizedText = normalizeSearchText(text);
  
  // Split search terms by spaces, handle quoted phrases
  const terms: string[] = [];
  let currentTerm = '';
  let inQuotes = false;
  
  for (let i = 0; i < searchTerms.length; i++) {
    const char = searchTerms[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      if (!inQuotes && currentTerm) {
        terms.push(normalizeSearchText(currentTerm));
        currentTerm = '';
      }
    } else if (char === ' ' && !inQuotes) {
      if (currentTerm) {
        terms.push(normalizeSearchText(currentTerm));
        currentTerm = '';
      }
    } else {
      currentTerm += char;
    }
  }
  
  // Add the last term if there is one
  if (currentTerm) {
    terms.push(normalizeSearchText(currentTerm));
  }
  
  // Filter out empty terms
  const filteredTerms = terms.filter(term => term.length > 0);
  
  if (filteredTerms.length === 0) return true;
  
  // Check if all terms match
  return filteredTerms.every(term => normalizedText.includes(term));
};

/**
 * Perform a fuzzy search on text
 * Useful for handling typos or misspellings
 */
export const fuzzySearch = (text: string, searchTerm: string, threshold: number = 0.7): boolean => {
  // Simple implementation - check if normalized text contains search term
  // For true fuzzy search, you would use algorithms like Levenshtein distance
  const normalizedText = normalizeSearchText(text);
  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  
  return normalizedText.includes(normalizedSearchTerm);
};
