/**
 * FLAWLESS GRAPHICS — Short Skeletal Loading Controller
 * Provides an instantaneous, ultra-snappy micro-skeleton transition
 */
(function() {
  function dismissSkeleton() {
    const loader = document.getElementById('skeletonLoader');
    if (loader && !loader.classList.contains('fade-out')) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        if (loader && loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
      }, 350);
    }
  }

  // Short, polished skeleton duration: 420ms
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(dismissSkeleton, 420);
    });
  } else {
    setTimeout(dismissSkeleton, 420);
  }

  // Safety fallback
  window.addEventListener('load', () => {
    setTimeout(dismissSkeleton, 420);
  });
})();
