/**
 * Birthday Celebration App - Interactive JavaScript
 * Handles modal interactions, name changes, and animations
 */

// DOM Elements
const elements = {
  recipientName: document.getElementById('recipientName'),
  changeNameBtn: document.getElementById('changeNameBtn'),
  playAnimationBtn: document.getElementById('playAnimationBtn'),
  nameModal: document.getElementById('nameModal'),
  nameInput: document.getElementById('nameInput'),
  saveNameBtn: document.getElementById('saveNameBtn'),
  cancelBtn: document.getElementById('cancelBtn'),
  closeModal: document.getElementById('closeModal'),
  messageSection: document.getElementById('messageSection'),
  cake: document.getElementById('cake')
};

// Application State
const state = {
  currentName: 'Lovie',
  isAnimating: false
};

/**
 * Initialize the application
 */
function init() {
  setupEventListeners();
  setupAccessibility();
  loadSavedName();
  
  // Add initial celebration class to message card
  const messageCard = elements.messageSection.querySelector('.message-card');
  if (messageCard) {
    messageCard.classList.add('celebration');
  }
  
  console.log('Birthday Celebration App initialized successfully');
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Modal controls
  elements.changeNameBtn?.addEventListener('click', openModal);
  elements.closeModal?.addEventListener('click', closeModal);
  elements.cancelBtn?.addEventListener('click', closeModal);
  elements.saveNameBtn?.addEventListener('click', saveName);
  
  // Animation control
  elements.playAnimationBtn?.addEventListener('click', replayAnimation);
  
  // Modal backdrop click to close
  elements.nameModal?.addEventListener('click', (e) => {
    if (e.target === elements.nameModal) {
      closeModal();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboardNavigation);
  
  // Input validation
  elements.nameInput?.addEventListener('input', validateInput);
  elements.nameInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveName();
    }
  });
  
  // Window resize handler for responsive adjustments
  window.addEventListener('resize', debounce(handleResize, 250));
}

/**
 * Set up accessibility features
 */
function setupAccessibility() {
  // Add ARIA labels
  elements.changeNameBtn?.setAttribute('aria-label', 'Change the birthday person\'s name');
  elements.playAnimationBtn?.setAttribute('aria-label', 'Replay the cake animation');
  elements.nameModal?.setAttribute('aria-labelledby', 'modal-title');
  elements.nameModal?.setAttribute('aria-describedby', 'modal-description');
  
  // Add focus trap for modal
  setupFocusTrap();
}

/**
 * Load saved name from localStorage
 */
function loadSavedName() {
  const savedName = localStorage.getItem('birthdayRecipientName');
  if (savedName && savedName.trim()) {
    state.currentName = savedName.trim();
    updateDisplayedName(state.currentName);
  }
}

/**
 * Open the name change modal
 */
function openModal() {
  if (!elements.nameModal || !elements.nameInput) return;
  
  elements.nameInput.value = state.currentName;
  elements.nameModal.classList.add('active');
  elements.nameInput.focus();
  elements.nameInput.select();
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
  
  // Announce to screen readers
  announceToScreenReader('Name change dialog opened');
}

/**
 * Close the modal
 */
function closeModal() {
  if (!elements.nameModal) return;
  
  elements.nameModal.classList.remove('active');
  
  // Restore body scroll
  document.body.style.overflow = '';
  
  // Return focus to the button that opened the modal
  elements.changeNameBtn?.focus();
  
  // Announce to screen readers
  announceToScreenReader('Name change dialog closed');
}

/**
 * Save the new name
 */
function saveName() {
  if (!elements.nameInput) return;
  
  const newName = elements.nameInput.value.trim();
  
  if (!newName) {
    showInputError('Please enter a valid name');
    return;
  }
  
  if (newName.length > 20) {
    showInputError('Name must be 20 characters or less');
    return;
  }
  
  // Update state and display
  state.currentName = newName;
  updateDisplayedName(newName);
  
  // Save to localStorage
  localStorage.setItem('birthdayRecipientName', newName);
  
  // Close modal
  closeModal();
  
  // Show success feedback
  showSuccessMessage(`Name updated to "${newName}"!`);
  
  // Announce to screen readers
  announceToScreenReader(`Birthday person's name changed to ${newName}`);
}

/**
 * Update the displayed name with animation
 */
function updateDisplayedName(name) {
  if (!elements.recipientName) return;
  
  // Add loading state
  elements.recipientName.classList.add('loading');
  
  setTimeout(() => {
    elements.recipientName.textContent = name;
    elements.recipientName.classList.remove('loading');
    
    // Add a subtle highlight animation
    elements.recipientName.style.animation = 'none';
    elements.recipientName.offsetHeight; // Trigger reflow
    elements.recipientName.style.animation = 'bounce 0.6s ease-out';
  }, 150);
}

/**
 * Replay the cake animation
 */
function replayAnimation() {
  if (state.isAnimating || !elements.cake) return;
  
  state.isAnimating = true;
  elements.playAnimationBtn.disabled = true;
  elements.playAnimationBtn.classList.add('loading');
  
  // Reset and restart SVG animations
  const animations = elements.cake.querySelectorAll('animate');
  animations.forEach(animation => {
    animation.beginElement();
  });
  
  // Re-enable button after animation completes
  setTimeout(() => {
    state.isAnimating = false;
    elements.playAnimationBtn.disabled = false;
    elements.playAnimationBtn.classList.remove('loading');
    
    // Announce completion to screen readers
    announceToScreenReader('Cake animation completed');
  }, 4000); // Total animation duration
  
  // Announce to screen readers
  announceToScreenReader('Cake animation started');
}

/**
 * Validate input as user types
 */
function validateInput() {
  if (!elements.nameInput) return;
  
  const value = elements.nameInput.value;
  const saveBtn = elements.saveNameBtn;
  
  if (!saveBtn) return;
  
  // Enable/disable save button based on input validity
  if (value.trim() && value.length <= 20) {
    saveBtn.disabled = false;
    clearInputError();
  } else {
    saveBtn.disabled = true;
    if (value.length > 20) {
      showInputError('Name must be 20 characters or less');
    }
  }
}

/**
 * Show input validation error
 */
function showInputError(message) {
  if (!elements.nameInput) return;
  
  elements.nameInput.style.borderColor = 'var(--error-500)';
  elements.nameInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
  
  // Remove existing error message
  const existingError = elements.nameInput.parentNode?.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Add new error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.style.cssText = `
    color: var(--error-500);
    font-size: 0.875rem;
    margin-top: var(--space-1);
    animation: fadeIn 0.2s ease-out;
  `;
  errorDiv.textContent = message;
  
  elements.nameInput.parentNode?.appendChild(errorDiv);
  
  // Announce error to screen readers
  announceToScreenReader(`Error: ${message}`);
}

/**
 * Clear input validation error
 */
function clearInputError() {
  if (!elements.nameInput) return;
  
  elements.nameInput.style.borderColor = '';
  elements.nameInput.style.boxShadow = '';
  
  const errorMessage = elements.nameInput.parentNode?.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
  const messageCard = elements.messageSection?.querySelector('.message-card');
  if (!messageCard) return;
  
  // Temporarily add success styling
  messageCard.classList.add('success');
  
  // Create and show success notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: var(--space-4);
    right: var(--space-4);
    background: var(--success-500);
    color: white;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 1001;
    animation: slideInRight 0.3s ease-out;
    font-weight: 500;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove notification and success styling after delay
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    messageCard.classList.remove('success');
    
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/**
 * Handle keyboard navigation
 */
function handleKeyboardNavigation(e) {
  // Close modal with Escape key
  if (e.key === 'Escape' && elements.nameModal?.classList.contains('active')) {
    closeModal();
  }
  
  // Quick shortcuts
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'e':
        e.preventDefault();
        openModal();
        break;
      case 'r':
        e.preventDefault();
        replayAnimation();
        break;
    }
  }
}

/**
 * Set up focus trap for modal accessibility
 */
function setupFocusTrap() {
  const modal = elements.nameModal;
  if (!modal) return;
  
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    
    const focusableContent = modal.querySelectorAll(focusableElements);
    const firstFocusable = focusableContent[0];
    const lastFocusable = focusableContent[focusableContent.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  });
}

/**
 * Handle window resize for responsive adjustments
 */
function handleResize() {
  // Adjust particle positions on resize
  const particles = document.querySelectorAll('.particle');
  particles.forEach((particle, index) => {
    const randomTop = Math.random() * 80 + 10;
    const randomLeft = Math.random() * 80 + 10;
    particle.style.top = `${randomTop}%`;
    particle.style.left = `${randomLeft}%`;
  });
}

/**
 * Announce messages to screen readers
 */
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    announcement.remove();
  }, 1000);
}

/**
 * Debounce utility function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Add CSS animations for notifications
 */
function addNotificationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Enhanced error handling
 */
window.addEventListener('error', (e) => {
  console.error('Application error:', e.error);
  
  // Show user-friendly error message
  const errorNotification = document.createElement('div');
  errorNotification.style.cssText = `
    position: fixed;
    top: var(--space-4);
    right: var(--space-4);
    background: var(--error-500);
    color: white;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 1001;
    animation: slideInRight 0.3s ease-out;
    font-weight: 500;
  `;
  errorNotification.textContent = 'Something went wrong. Please refresh the page.';
  
  document.body.appendChild(errorNotification);
  
  setTimeout(() => {
    errorNotification.remove();
  }, 5000);
});

/**
 * Performance optimization: Intersection Observer for animations
 */
function setupIntersectionObserver() {
  if (!('IntersectionObserver' in window)) return;
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, observerOptions);
  
  // Observe animated elements
  const animatedElements = document.querySelectorAll('[style*="animation"]');
  animatedElements.forEach(el => observer.observe(el));
}

/**
 * Theme detection and adaptation
 */
function setupThemeDetection() {
  // Detect user's color scheme preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  function handleThemeChange(e) {
    if (e.matches) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
  
  // Initial check
  handleThemeChange(prefersDark);
  
  // Listen for changes
  prefersDark.addEventListener('change', handleThemeChange);
}

/**
 * Enhanced cake animation with sound effects (if available)
 */
function enhancedCakeAnimation() {
  // Create audio context for sound effects (optional)
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    function playTone(frequency, duration) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    }
    
    // Play celebration sound when animation starts
    elements.playAnimationBtn?.addEventListener('click', () => {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      playTone(523.25, 0.2); // C5 note
      setTimeout(() => playTone(659.25, 0.2), 200); // E5 note
      setTimeout(() => playTone(783.99, 0.3), 400); // G5 note
    });
  } catch (error) {
    // Audio not supported or blocked, continue without sound
    console.log('Audio features not available');
  }
}

/**
 * Initialize application when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', () => {
  addNotificationStyles();
  setupIntersectionObserver();
  setupThemeDetection();
  enhancedCakeAnimation();
});

/**
 * Service Worker registration for offline support (Progressive Web App)
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateDisplayedName,
    validateInput,
    debounce
  };
}