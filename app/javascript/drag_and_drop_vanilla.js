document.addEventListener('DOMContentLoaded', function () {
  const emojiItems = document.querySelectorAll('.emoji-item');
  const dropZones = document.querySelectorAll('.drop-zone');
  const submitButton = document.getElementById('submit-answer');

  let draggedElement = null;
  let draggedEmoji = null;

  // Emoji to name mapping
  let emojiNames = {
    '🍞': 'Bread',
    '🍜': 'Noodles',
    '🍝': 'Pasta',
    '🥔': 'Potato',
    '🍚': 'Rice',
  };

  const enspuddificationCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('enspuddification='))
    ?.split('=')[1];

  if (enspuddificationCookie === 'true') {
    emojiNames = {
      '🥔': 'Potato',
    };

    document.querySelectorAll('.emoji-item').forEach((emoji) => {
      emoji.dataset.emoji = '🥔';
    });

    document.querySelector('input[name="enspuddification"]').value = true;
  }

  // Detect if device supports touch
  const isTouchDevice =
    window.matchMedia('(pointer: coarse)').matches ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0;

  if (isTouchDevice) {
    console.log('Loading mobile touch implementation');
    initMobileTouchImplementation();

    // Use Intersection Observer to manage drop zone visibility
    setupDropZoneIntersectionObserver();
  } else {
    console.log('Loading desktop drag and drop implementation');
    initDesktopDragImplementation();
  }

  function initDesktopDragImplementation() {
    // Drag start
    emojiItems.forEach((item) => {
      item.addEventListener('dragstart', function (e) {
        draggedElement = this;
        draggedEmoji = this.getAttribute('data-emoji');
        this.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';

        // Show affordance text on empty drop zones
        showAffordanceText();
      });

      item.addEventListener('dragend', function () {
        this.style.opacity = '1';
        draggedElement = null;
        draggedEmoji = null;

        // Hide affordance text
        hideAffordanceText();
      });
    });

    // Drop zone events
    dropZones.forEach((zone) => {
      zone.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Only highlight if the zone is empty
        const targetSlot = this.querySelector('.emoji-slot');
        if (targetSlot.textContent === '○') {
          this.classList.add('border-amber-500', 'bg-amber-100');
        }
      });

      zone.addEventListener('dragleave', function (e) {
        this.classList.remove('border-amber-500', 'bg-amber-100');
      });

      zone.addEventListener('drop', function (e) {
        e.preventDefault();
        this.classList.remove('border-amber-500', 'bg-amber-100');

        if (draggedEmoji) {
          const targetSlot = this.querySelector('.emoji-slot');
          const targetNameSlot = this.querySelector('.name-slot');
          const targetOccupied = targetSlot.textContent !== '○';

          // Only allow dropping if the target is empty
          if (!targetOccupied) {
            const targetPosition = parseInt(this.getAttribute('data-position'));

            // Place the emoji
            targetSlot.textContent = draggedEmoji;
            targetSlot.classList.remove('text-amber-200');
            targetSlot.classList.add('text-black');
            targetSlot.setAttribute('draggable', 'false'); // Disable dragging once placed
            targetSlot.classList.remove(
              'cursor-grab',
              'active:cursor-grabbing'
            );

            // Update name slot
            targetNameSlot.textContent = emojiNames[draggedEmoji] || '';

            // Apply ranking background color
            applyRankingBackground(this, targetPosition);

            // Add clear button
            addClearButton(this);

            // Remove from source
            removeEmojiFromSource(draggedEmoji);

            // Update form data
            updateFormData();

            // Check if all positions are filled
            checkCompletion();

            // Hide affordance text after successful drop
            hideAffordanceText();
          }
        }
      });
    });
  }

  // Global touch variables for mobile
  let touchStartX = 0;
  let touchStartY = 0;
  let currentTouchElement = null;
  let draggedEmojiForTouch = null;
  let floatingElement = null;
  let touchStartTime = 0;
  let isDragging = false;
  let selectedEmoji = null; // For mobile tap-to-select

  // Global touch helper functions
  function createFloatingElement(originalElement, x, y) {
    floatingElement = originalElement.cloneNode(true);
    floatingElement.style.position = 'fixed';
    floatingElement.style.zIndex = '1000';
    floatingElement.style.pointerEvents = 'none';
    floatingElement.style.transform = 'scale(1.2)';
    floatingElement.style.opacity = '0.8';
    document.body.appendChild(floatingElement);
    updateFloatingElement(x, y);
  }

  function updateFloatingElement(x, y) {
    if (floatingElement) {
      floatingElement.style.left = x - 30 + 'px';
      floatingElement.style.top = y - 30 + 'px';
    }
  }

  function removeFloatingElement() {
    if (floatingElement) {
      floatingElement.remove();
      floatingElement = null;
    }
  }

  function setupDropZoneIntersectionObserver() {
    if (!isTouchDevice) return;

    const stickyHeader = document.querySelector('.sticky.top-0');
    if (!stickyHeader) return;

    // Create intersection observer using sticky header as root
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const dropZone = entry.target;

          if (entry.isIntersecting) {
            // Drop zone is intersecting with sticky header - disable it
            dropZone.style.pointerEvents = 'none';
            dropZone.style.opacity = '0.3';
            dropZone.style.filter = 'grayscale(100%)';
            dropZone.classList.remove('border-amber-500', 'bg-amber-100');
          } else {
            // Drop zone is no longer intersecting - enable it
            dropZone.style.pointerEvents = 'auto';
            dropZone.style.opacity = '1';
            dropZone.style.filter = 'none';
          }
        });
      },
      {
        root: stickyHeader, // Use sticky header as the intersection root
        rootMargin: '0px', // No margin
        threshold: 0, // Trigger as soon as any part intersects
      }
    );

    // Observe all drop zones
    dropZones.forEach((zone) => {
      observer.observe(zone);
    });
  }

  function clearEmojiSelection() {
    if (selectedEmoji) {
      // Clear visual feedback from all emoji items
      emojiItems.forEach((item) => {
        item.style.transform = '';
        item.style.opacity = '1';
        item.style.border = '';
        item.style.borderRadius = '';
      });
      selectedEmoji = null;

      // Hide affordance text on mobile
      if (isTouchDevice) {
        hideAffordanceText();
      }
    }
  }

  function showAffordanceText() {
    dropZones.forEach((zone) => {
      const targetSlot = zone.querySelector('.emoji-slot');
      const affordanceText = zone.querySelector('.affordance-text');
      const isEmpty = targetSlot.textContent === '○';

      if (isEmpty && affordanceText) {
        // Set appropriate text based on device type
        if (isTouchDevice) {
          affordanceText.textContent =
            affordanceText.getAttribute('data-mobile-text');
        } else {
          affordanceText.textContent =
            affordanceText.getAttribute('data-desktop-text');
        }
        // Add transition for smooth fade-in
        affordanceText.style.transition = 'opacity 0.2s ease-in';
        affordanceText.style.opacity = '1';
      }
    });
  }

  function hideAffordanceText() {
    dropZones.forEach((zone) => {
      const affordanceText = zone.querySelector('.affordance-text');
      if (affordanceText) {
        // Remove transition for instant hide
        affordanceText.style.transition = 'none';
        affordanceText.style.opacity = '0';
      }
    });
  }

  function showEmojiSelectedFeedback(emoji) {
    // Highlight available drop zones
    dropZones.forEach((zone) => {
      const targetSlot = zone.querySelector('.emoji-slot');
      const isEmpty = targetSlot.textContent === '○';

      if (isEmpty) {
        zone.classList.add('border-amber-500', 'bg-amber-100');
      }
    });

    // Show affordance text on mobile
    if (isTouchDevice) {
      showAffordanceText();
    }
  }

  function handleMobileDrop(zone, emoji) {
    const targetSlot = zone.querySelector('.emoji-slot');
    const targetNameSlot = zone.querySelector('.name-slot');
    const targetPosition = parseInt(zone.getAttribute('data-position'));

    // Place the emoji
    targetSlot.textContent = emoji;
    targetSlot.classList.remove('text-amber-200');
    targetSlot.classList.add('text-black');
    targetSlot.setAttribute('draggable', 'false');
    targetSlot.classList.remove('cursor-grab', 'active:cursor-grabbing');

    // Update name slot
    targetNameSlot.textContent = emojiNames[emoji] || '';

    // Apply ranking background color
    applyRankingBackground(zone, targetPosition);

    // Add clear button
    addClearButton(zone);

    // Remove from source
    removeEmojiFromSource(emoji);

    // Update form data
    updateFormData();

    // Check if all positions are filled
    checkCompletion();

    // Clear drop zone highlights and hide affordance text
    dropZones.forEach((zone) => {
      zone.classList.remove('border-amber-500', 'bg-amber-100');
    });
    hideAffordanceText();
  }

  function initMobileTouchImplementation() {
    // Add tap-to-select event listeners to emoji items
    emojiItems.forEach((item) => {
      item.addEventListener('touchstart', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const emoji = this.getAttribute('data-emoji');

        // Clear previous selection
        if (selectedEmoji && selectedEmoji !== emoji) {
          clearEmojiSelection();
        }

        // Select this emoji
        selectedEmoji = emoji;
        this.style.transform = 'scale(1.2)';
        this.style.opacity = '0.7';
        this.style.border = '3px solid #f59e0b';
        this.style.borderRadius = '8px';

        // Show visual feedback
        showEmojiSelectedFeedback(emoji);
      });
    });

    // Add tap-to-drop event listeners to drop zones
    dropZones.forEach((zone) => {
      zone.addEventListener('touchstart', function (e) {
        if (selectedEmoji) {
          e.preventDefault();
          e.stopPropagation();

          const targetSlot = this.querySelector('.emoji-slot');
          const isEmpty = targetSlot.textContent === '○';

          if (isEmpty) {
            handleMobileDrop(this, selectedEmoji);
            clearEmojiSelection();
          }
        }
        // If no emoji is selected, allow default scroll behavior
      });
    });

    // Add click outside to unselect
    document.addEventListener(
      'touchstart',
      function (e) {
        const isEmojiItem = e.target.closest('.emoji-item');
        const isDropZone = e.target.closest('.drop-zone');
        const isClearButton = e.target.closest('.clear-button');

        if (!isEmojiItem && !isDropZone && !isClearButton && selectedEmoji) {
          clearEmojiSelection();
        }
      },
      { passive: true }
    );
  }

  function addClearButton(zone) {
    // Remove existing clear button if any
    const existingButton = zone.querySelector('.clear-button');
    if (existingButton) {
      existingButton.remove();
    }

    // Create clear button
    const clearButton = document.createElement('button');
    clearButton.className =
      'clear-button ml-auto px-3 py-1 bg-amber-500 text-white text-sm rounded hover:bg-rose-600 transition-colors duration-200';
    clearButton.textContent = 'Clear';

    clearButton.addEventListener('click', function () {
      clearDropZone(zone);
    });

    // Add touch event for mobile
    if (isTouchDevice) {
      clearButton.addEventListener('touchstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
        clearDropZone(zone);
      });
    }

    zone.appendChild(clearButton);
  }

  function clearDropZone(zone) {
    const targetSlot = zone.querySelector('.emoji-slot');
    const targetNameSlot = zone.querySelector('.name-slot');
    const clearButton = zone.querySelector('.clear-button');
    const emoji = targetSlot.textContent;

    if (emoji !== '○') {
      // Return emoji to source
      returnEmojiToSource(emoji);

      // Reset the drop zone
      targetSlot.textContent = '○';
      targetSlot.classList.remove('text-black');
      targetSlot.classList.add('text-amber-200');
      targetSlot.removeAttribute('draggable');
      targetSlot.classList.remove('cursor-grab', 'active:cursor-grabbing');

      // Clear name slot
      targetNameSlot.textContent = '';

      // Remove ranking background
      removeRankingBackground(zone);

      // Remove clear button
      if (clearButton) {
        clearButton.remove();
      }

      // Update form data
      updateFormData();

      // Check completion status
      checkCompletion();

      // Clear any emoji selection
      clearEmojiSelection();

      // Hide affordance text
      hideAffordanceText();
    }
  }

  function returnEmojiToSource(emoji) {
    const sourceArea = document.getElementById('emoji-source');
    const newEmojiItem = document.createElement('div');
    newEmojiItem.className =
      'emoji-item text-5xl cursor-grab active:cursor-grabbing transition-transform duration-200 hover:scale-110 relative z-50 touch-manipulation';
    newEmojiItem.setAttribute('draggable', 'true');
    newEmojiItem.setAttribute('data-emoji', emoji);
    newEmojiItem.textContent = emoji;

    if (isTouchDevice) {
      // Add tap-to-select event listener for mobile
      newEmojiItem.addEventListener('touchstart', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const emoji = this.getAttribute('data-emoji');

        // Clear previous selection
        if (selectedEmoji && selectedEmoji !== emoji) {
          clearEmojiSelection();
        }

        // Select this emoji
        selectedEmoji = emoji;
        this.style.transform = 'scale(1.2)';
        this.style.opacity = '0.7';
        this.style.border = '3px solid #f59e0b';
        this.style.borderRadius = '8px';

        // Show visual feedback
        showEmojiSelectedFeedback(emoji);
      });
    } else {
      // Add drag events for desktop
      newEmojiItem.addEventListener('dragstart', function (e) {
        draggedElement = this;
        draggedEmoji = this.getAttribute('data-emoji');
        this.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';

        // Show affordance text on empty drop zones
        showAffordanceText();
      });

      newEmojiItem.addEventListener('dragend', function () {
        this.style.opacity = '1';
        draggedElement = null;
        draggedEmoji = null;

        // Hide affordance text
        hideAffordanceText();
      });
    }

    sourceArea.appendChild(newEmojiItem);
  }

  function removeEmojiFromSource(emoji) {
    const emojiElements = document.querySelectorAll('.emoji-item');
    emojiElements.forEach((element) => {
      if (element.getAttribute('data-emoji') === emoji) {
        element.remove();
        return;
      }
    });
  }

  function updateFormData() {
    dropZones.forEach((zone) => {
      const position = zone.getAttribute('data-position');
      const emojiSlot = zone.querySelector('.emoji-slot');
      const emoji = emojiSlot.textContent;

      if (emoji !== '○') {
        const formValue = emojiNames[emoji].toLowerCase();
        document.getElementById(`position_${position}`).value = formValue;
      } else {
        document.getElementById(`position_${position}`).value = '';
      }
    });
  }

  function applyRankingBackground(zone, position) {
    // Remove any existing ranking borders
    removeRankingBackground(zone);

    // Change border style from dashed to solid
    zone.classList.remove('border-dashed');
    zone.classList.add('border-solid');

    // Apply ranking border based on position
    switch (position) {
      case 1:
        zone.classList.add('border-yellow-300'); // Lightest
        break;
      case 2:
        zone.classList.add('border-yellow-400'); // Light
        break;
      case 3:
        zone.classList.add('border-yellow-500'); // Medium
        break;
      case 4:
        zone.classList.add('border-yellow-600'); // Dark
        break;
      case 5:
        zone.classList.add('border-yellow-700'); // Darkest
        break;
    }
  }

  function removeRankingBackground(zone) {
    zone.classList.remove(
      'border-yellow-300',
      'border-yellow-400',
      'border-yellow-500',
      'border-yellow-600',
      'border-yellow-700'
    );
    // Change border style back to dashed
    zone.classList.remove('border-solid');
    zone.classList.add('border-dashed');
  }

  function checkCompletion() {
    if (enspuddificationCookie === 'true') {
      submitButton.disabled = false;
      return;
    }

    const totalPositions = dropZones.length;
    let filledCount = 0;

    document.querySelectorAll('.emoji-slot').forEach((slot) => {
      if (slot.textContent !== '○') {
        filledCount++;
      }
    });

    if (filledCount === totalPositions) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  }

  // Clear all button functionality
  const clearAllButton = document.getElementById('clear-all-button');
  if (clearAllButton) {
    clearAllButton.addEventListener('click', function () {
      clearAllSelections();
    });
  }

  function clearAllSelections() {
    // Clear emoji selection
    clearEmojiSelection();

    // Clear all drop zones
    dropZones.forEach((zone) => {
      const targetSlot = zone.querySelector('.emoji-slot');
      const targetNameSlot = zone.querySelector('.name-slot');
      const clearButton = zone.querySelector('.clear-button');

      // Reset the drop zone
      targetSlot.textContent = '○';
      targetSlot.classList.remove('text-black');
      targetSlot.classList.add('text-amber-200');
      targetSlot.removeAttribute('draggable');
      targetSlot.classList.remove('cursor-grab', 'active:cursor-grabbing');

      // Clear name slot
      targetNameSlot.textContent = '';

      // Remove ranking background
      removeRankingBackground(zone);

      // Remove clear button
      if (clearButton) {
        clearButton.remove();
      }
    });

    // Return all emojis to source
    const sourceArea = document.getElementById('emoji-source');
    const existingEmojis = sourceArea.querySelectorAll('.emoji-item');
    const expectedEmojis = Object.keys(emojiNames);

    // Remove existing emojis
    existingEmojis.forEach((emoji) => {
      emoji.remove();
    });

    // Add all emojis back to source
    expectedEmojis.forEach((emoji) => {
      const newEmojiItem = document.createElement('div');
      newEmojiItem.className =
        'emoji-item text-5xl cursor-grab active:cursor-grabbing transition-transform duration-200 hover:scale-110 relative z-50 touch-manipulation';
      newEmojiItem.setAttribute('draggable', 'true');
      newEmojiItem.setAttribute('data-emoji', emoji);
      newEmojiItem.textContent = emoji;

      if (isTouchDevice) {
        // Add tap-to-select event listener for mobile
        newEmojiItem.addEventListener('touchstart', function (e) {
          e.preventDefault();
          e.stopPropagation();

          const emoji = this.getAttribute('data-emoji');

          // Clear previous selection
          if (selectedEmoji && selectedEmoji !== emoji) {
            clearEmojiSelection();
          }

          // Select this emoji
          selectedEmoji = emoji;
          this.style.transform = 'scale(1.2)';
          this.style.opacity = '0.7';
          this.style.border = '3px solid #f59e0b';
          this.style.borderRadius = '8px';

          // Show visual feedback
          showEmojiSelectedFeedback(emoji);
        });
      } else {
        // Add drag events for desktop
        newEmojiItem.addEventListener('dragstart', function (e) {
          draggedElement = this;
          draggedEmoji = this.getAttribute('data-emoji');
          this.style.opacity = '0.5';
          e.dataTransfer.effectAllowed = 'move';

          // Show affordance text on empty drop zones
          showAffordanceText();
        });

        newEmojiItem.addEventListener('dragend', function () {
          this.style.opacity = '1';
          draggedElement = null;
          draggedEmoji = null;

          // Hide affordance text
          hideAffordanceText();
        });
      }

      sourceArea.appendChild(newEmojiItem);
    });

    // Update form data
    updateFormData();

    // Check completion status
    checkCompletion();

    // Only hide affordance text on mobile (where selection is used)
    if (isTouchDevice) {
      hideAffordanceText();
    }
  }
});
