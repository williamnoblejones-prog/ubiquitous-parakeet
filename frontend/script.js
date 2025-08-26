const defaultCaption = "Shot in Flåm, 2024/07/06";

// ----------- AUTO RANDOM SLIDESHOW -----------
const autoSlideshowContainer = document.querySelector('.slideshow-container.auto');
if (autoSlideshowContainer) {
  const autoSlides = autoSlideshowContainer.querySelectorAll('.slide');
  let currentAuto = 0;

  function showAutoSlide(index) {
    autoSlides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (i === index) {
        slide.classList.add('active');
        const caption = slide.querySelector('.caption');
        if (caption) {
          caption.textContent = slide.dataset.caption || defaultCaption;
        }
      }
    });
  }

  // initialize first slide
  showAutoSlide(currentAuto);

  setInterval(() => {
    let next;
    do {
      next = Math.floor(Math.random() * autoSlides.length);
    } while (next === currentAuto);

    currentAuto = next;
    showAutoSlide(currentAuto);
  }, 6000);
}

// ----------- MANUAL SLIDESHOW -----------
const manualSlideshowContainer = document.querySelector('.slideshow-container.manual');
if (manualSlideshowContainer) {
  const manualSlides = manualSlideshowContainer.querySelectorAll('.slide');
  const caption = manualSlideshowContainer.querySelector('.caption');
  let currentManual = 0;

  function showManualSlide(index) {
    manualSlides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (i === index) {
        slide.classList.add('active');
        if (caption) {
          caption.textContent = slide.dataset.caption || defaultCaption;
        }
      }
    });
  }

  // initialize first slide
  showManualSlide(currentManual);

  // Button events
  const nextBtn = manualSlideshowContainer.querySelector('.next');
  const prevBtn = manualSlideshowContainer.querySelector('.prev');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentManual = (currentManual + 1) % manualSlides.length;
      showManualSlide(currentManual);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentManual = (currentManual - 1 + manualSlides.length) % manualSlides.length;
      showManualSlide(currentManual);
    });
  }
}
