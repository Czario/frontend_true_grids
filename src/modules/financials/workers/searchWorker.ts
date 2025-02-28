// This is a Web Worker to handle search filtering in a separate thread
// Only needed for very large datasets (10,000+ rows)

/**
 * The worker processes search requests on a separate thread to avoid UI blocking
 */
const ctx: Worker = self as any;

// Message handler
ctx.addEventListener('message', (event) => {
  const { rows, searchTerm } = event.data;
  
  if (!rows || !Array.isArray(rows)) {
    ctx.postMessage({ error: 'Invalid rows data' });
    return;
  }

  // Exit quickly if no search term
  if (!searchTerm || searchTerm.length === 0) {
    ctx.postMessage({ filteredIds: null }); // null means "show all"
    return;
  }

  const lowerSearchTerm = searchTerm.toLowerCase().trim();
  
  // Skip filtering empty terms
  if (lowerSearchTerm === '') {
    ctx.postMessage({ filteredIds: null });
    return;
  }

  try {
    // Perform the filtering
    const matchingIds = rows.filter(row => {
      // Create a searchable representation of the row data
      const searchableFields = Object.entries(row)
        .filter(([key, value]) => 
          // Only include string and number values from meaningful fields
          (typeof value === 'string' || typeof value === 'number') &&
          !['id', 'hasChildren', 'children', '__expanded'].includes(key)
        )
        .map(([key, value]) => String(value).toLowerCase());
      
      // Check if any field contains the search term
      return searchableFields.some(field => field.includes(lowerSearchTerm));
    }).map(row => row.id);
    
    // Return the IDs of matching rows
    ctx.postMessage({ filteredIds: matchingIds });
    
  } catch (error) {
    ctx.postMessage({ error: 'Error during search filtering' });
  }
});

export {};
