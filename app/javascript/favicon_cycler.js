// Favicon cycler that rotates through carb emojis every 30 seconds
class FaviconCycler {
  constructor() {
    this.carbEmojis = ['🍞', '🍝', '🥖', '🥐', '🍕'];
    this.currentIndex = 0;
    this.interval = null;
    this.init();
  }

  init() {
    // Start the cycling
    this.cycleFavicon();
    this.interval = setInterval(() => {
      this.cycleFavicon();
    }, 10000); // 10 seconds
  }

  cycleFavicon() {
    const emoji = this.carbEmojis[this.currentIndex];

    // Create a canvas to convert emoji to favicon
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 32;
    canvas.height = 32;

    // Set background to transparent
    ctx.clearRect(0, 0, 32, 32);

    // Draw the emoji
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 16, 16);

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');

    // Update favicon
    this.updateFavicon(dataUrl);

    // Move to next emoji
    this.currentIndex = (this.currentIndex + 1) % this.carbEmojis.length;
  }

  updateFavicon(dataUrl) {
    // Remove existing favicon links
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');
    existingLinks.forEach((link) => link.remove());

    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = dataUrl;
    link.type = 'image/png';
    document.head.appendChild(link);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// Initialize the favicon cycler when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FaviconCycler();
});
