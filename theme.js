// Automatic theme handled via CSS media query
console.log("Automatic light/dark mode applied based on system preference.");
// 🌟 Reveal elements on scroll
document.addEventListener("DOMContentLoaded", () => {
  const fadeElems = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1
  });

  fadeElems.forEach(el => observer.observe(el));
});

