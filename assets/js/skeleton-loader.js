/**
 * FLAWLESS GRAPHICS — Short Skeletal Loading Controller
 * Provides an instantaneous, ultra-snappy micro-skeleton transition (420ms)
 */
(function() {
  function dismissSkeleton() {
    const loaders = document.querySelectorAll('#skeletonLoader, [data-skeleton-loader], .skeleton-dashboard-overlay, .skeleton-public-overlay');
    loaders.forEach(loader => {
      if (loader && !loader.classList.contains('fade-out')) {
        loader.classList.add('fade-out');
        setTimeout(() => {
          if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
          }
        }, 350);
      }
    });
  }

  // Instantaneous, snappiest dismissal when DOM is interactive
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', dismissSkeleton, { once: true });
  } else {
    dismissSkeleton();
  }

  // Safety fallback
  window.addEventListener('load', dismissSkeleton, { once: true });
})();
