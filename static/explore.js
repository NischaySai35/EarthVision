// Simple script for the explore page
document.addEventListener('DOMContentLoaded', function() {
  // Add a subtle rotation effect to the stars
  const rotateStars = () => {
    const stars = document.querySelectorAll('#stars, #stars2, #stars3');
    stars.forEach(star => {
      const randomRotation = Math.random() * 360;
      star.style.transform = `rotate(${randomRotation}deg)`;
    });
  };
  
  // Call once on load
  rotateStars();
  
  // Add click event to the explore button (optional, as the link will work without JS)
  const exploreBtn = document.querySelector('.explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', function(e) {
      // Add a small animation effect when clicked
      e.preventDefault();
      this.classList.add('clicked');
      
      // Navigate after a short delay for the animation
      setTimeout(() => {
        window.location.href = this.getAttribute('href');
      }, 300);
    });
  }
});