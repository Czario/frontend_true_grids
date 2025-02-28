/**
 * Utility function to pre-initialize tooltips to reduce perceived delay
 * This helps with tooltip performance in large data grids
 */
export const initializeTooltips = () => {
  // Create a hidden tooltip container to pre-warm the tooltip system
  const tooltipContainer = document.createElement('div');
  tooltipContainer.style.position = 'absolute';
  tooltipContainer.style.visibility = 'hidden';
  tooltipContainer.style.pointerEvents = 'none';
  tooltipContainer.setAttribute('data-testid', 'tooltip-initializer');
  document.body.appendChild(tooltipContainer);

  // Clean up after a short delay
  setTimeout(() => {
    if (document.body.contains(tooltipContainer)) {
      document.body.removeChild(tooltipContainer);
    }
  }, 500);
};
