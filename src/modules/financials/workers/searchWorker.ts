// This is a Web Worker to handle search filtering in a separate thread
// Only needed for very large datasets (10,000+ rows)

/**
 * The worker processes search requests on a separate thread to avoid UI blocking.
 * Only needed for very large datasets (10,000+ rows).
 */
const ctx: Worker = self as any;

// Message handler
ctx.addEventListener('message', (event) => {
  const { rows, searchTerm } = event.data;
  
  if (!rows || !Array.isArray(rows)) {
    ctx.postMessage({ error: 'Invalid rows data' });
    return;
  }

  if (!searchTerm || searchTerm.trim().length === 0) {
    ctx.postMessage({ filteredIds: null }); // null means show all results
    return;
  }

  const lowerSearchTerm = searchTerm.toLowerCase().trim();

  try {
    const matchingIds = rows.filter(row => {
      // Combine all searchable fields (exclude non-string/number keys)
      const searchableText = Object.entries(row)
        .filter(([key, value]) =>
          (typeof value === 'string' || typeof value === 'number') &&
          !['id', 'hasChildren', 'children', '__expanded'].includes(key)
        )
        .map(([_, value]) => String(value).toLowerCase())
        .join(' ');
  
      return searchableText.includes(lowerSearchTerm);
    }).map(row => row.id);
    
    ctx.postMessage({ filteredIds: matchingIds });
  } catch (error) {
    ctx.postMessage({ error: 'Error during search filtering' });
  }
});

export {};
