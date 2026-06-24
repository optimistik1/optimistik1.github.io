document.addEventListener('DOMContentLoaded', function() {

    // ================================================================
    // 1. УПРАВЛЕНИЕ ФОНОВЫМ ВИДЕО (играет только когда блок виден)
    // ================================================================
    const bgVideo = document.querySelector('.bg-video');
    const block1 = document.getElementById('block1');

    if (bgVideo && block1) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    bgVideo.play().catch(() => {});
                } else {
                    bgVideo.pause();
                }
            });
        }, {
            threshold: 0.3
        });

        videoObserver.observe(block1);
    }

    // ================================================================
    // 2. АНИМАЦИЯ ПОЯВЛЕНИЯ БЛОКОВ ПРИ СКРОЛЛЕ
    // ================================================================
    const fadeBlocks = document.querySelectorAll('.block');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeBlocks.forEach(block => {
        block.classList.add('fade-up');
        observer.observe(block);
    });

    // ================================================================
    // 3. КАРУСЕЛЬ
    // ================================================================
    const track = document.getElementById('carouselTrack');
    const container = document.querySelector('.carousel-container');

    const photos = [
        'photo_86_2026-06-24_01-13-26.jpg',
        'photo_85_2026-06-24_01-13-26.jpg',
        'photo_94_2026-06-24_01-13-26.jpg',
        'photo_93_2026-06-24_01-13-26.jpg',
        'photo_63_2026-06-24_01-13-26.jpg',
        'photo_64_2026-06-24_01-13-26.jpg',
        'photo_14_2026-06-24_01-13-26.jpg',
        'photo_13_2026-06-24_01-13-26.jpg',
        'photo_11_2026-06-24_01-13-26.jpg',
        'photo_10_2026-06-24_01-13-26.jpg',
        'photo_9_2026-06-24_01-13-26.jpg',
        'photo_8_2026-06-24_01-13-26.jpg',
        'photo_3_2026-06-24_01-13-26.jpg'
    ];

    const totalSlides = photos.length;
    let currentIndex = 0;
    let autoplayInterval = null;
    const AUTOPLAY_DELAY = 500;
    let slidesPerView = getSlidesPerView();
    let isTransitioning = false;

    function getSlidesPerView() {
        const width = window.innerWidth;
        if (width <= 480) return 1;  // ← ИСПРАВЛЕНО: на телефонах 1 фото
        if (width <= 768) return 2;
        return 3;
    }

    function createSlides() {
        track.innerHTML = '';
        const cloneCount = 5;

        for (let repeat = 0; repeat < cloneCount; repeat++) {
            photos.forEach(photo => {
                const slide = document.createElement('div');
                slide.className = 'carousel-slide';

                const img = document.createElement('img');
                img.src = `images/${photo}`;
                img.alt = 'Фото';
                img.loading = 'lazy';

                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });

                slide.appendChild(img);
                track.appendChild(slide);
            });
        }

        currentIndex = 0;
        updateTrack(false);
    }

    function updateTrack(animate = true) {
        if (!animate) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.3s ease';
        }

        const offset = -currentIndex * (100 / slidesPerView);
        track.style.transform = `translateX(${offset}%)`;
    }

    function checkAndFixLoop() {
        const totalCloned = totalSlides * 5;
        const maxIndex = totalCloned - slidesPerView;

        if (currentIndex >= maxIndex) {
            currentIndex = 0;
            updateTrack(false);
            track.style.transition = 'transform 0.3s ease';
        }
    }

    function nextSlide() {
        if (isTransitioning) return;
        isTransitioning = true;

        currentIndex++;
        updateTrack(true);

        setTimeout(() => {
            checkAndFixLoop();
            isTransitioning = false;
        }, 350);
    }

    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    // Свайп
    let startX = 0;
    let isDragging = false;
    let isSwiping = false;

    if (container) {
        container.addEventListener('touchstart', (e) => {
            stopAutoplay();
            startX = e.touches[0].clientX;
            isDragging = true;
            isSwiping = false;
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging || isTransitioning) return;
            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;

            if (Math.abs(diff) > 20) {
                isSwiping = true;
                const offset = -currentIndex * (100 / slidesPerView) - (diff / container.offsetWidth) * 100;
                track.style.transform = `translateX(${offset}%)`;
                track.style.transition = 'none';
            }
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            if (!isDragging || isTransitioning) return;
            isDragging = false;

            if (isSwiping) {
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;

                if (Math.abs(diff) > 50) {
                    isTransitioning = true;
                    if (diff > 0) {
                        currentIndex++;
                    } else {
                        currentIndex--;
                    }
                    updateTrack(true);
                    setTimeout(() => {
                        checkAndFixLoop();
                        isTransitioning = false;
                    }, 350);
                } else {
                    updateTrack(true);
                }
            }
            isSwiping = false;
            startAutoplay();
        }, { passive: true });
    }

    // Наведение
    if (container) {
        container.addEventListener('mouseenter', stopAutoplay);
        container.addEventListener('mouseleave', startAutoplay);
    }

    // Ресайз
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newSlidesPerView = getSlidesPerView();
            if (newSlidesPerView !== slidesPerView) {
                slidesPerView = newSlidesPerView;
                createSlides();
                currentIndex = 0;
                updateTrack(false);
            }
        }, 300);
    });

    // ===== ЗАПУСК КАРУСЕЛИ =====
    slidesPerView = getSlidesPerView();
    createSlides();
    startAutoplay();

    // ================================================================
    // 4. ВИДЕО-СЮРПРИЗ
    // ================================================================
    const surpriseBtn = document.getElementById('surpriseBtn');
    const surpriseOutput = document.getElementById('surpriseOutput');

    if (surpriseBtn && surpriseOutput) {
        surpriseBtn.addEventListener('click', function() {

            if (surpriseOutput.querySelector('video')) {
                return;
            }
            surpriseOutput.innerHTML = `
                <video controls width="500" style="max-width:100%; border-radius:16px; box-shadow:0 30px 80px rgba(0,0,0,0.6);">
                    <source src="video/bl4.mp4" type="video/mp4">
                    Ваш браузер не поддерживает видео.
                </video>
            `;

            const video = surpriseOutput.querySelector('video');

            surpriseBtn.textContent = 'Воспроизводится';
            surpriseBtn.style.opacity = '0.5';

            video.addEventListener('loadeddata', function() {});

            video.addEventListener('ended', function() {
                surpriseBtn.textContent = 'Просмотрено';
                surpriseBtn.style.opacity = '0.7';
            });

            video.addEventListener('error', function(e) {
                surpriseBtn.textContent = 'Ошибка загрузки';
                surpriseBtn.style.opacity = '0.5';
            });

            video.play().catch(function(err) {
                surpriseBtn.textContent = 'Нажми для воспроизведения';
                surpriseBtn.style.opacity = '1';
                surpriseBtn.onclick = function() {
                    video.play();
                    surpriseBtn.textContent = 'Смотри';
                    surpriseBtn.style.opacity = '0.5';
                    surpriseBtn.onclick = null;
                };
            });
        });
    }

    // ================================================================
    // 5. ПАРАЛЛАКС ДЛЯ ВИДЕО (лёгкий эффект при скролле)
    // ================================================================
    const heroVideo = document.querySelector('.bg-video');

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
            heroVideo.style.transform =
                `translate(-50%, calc(-50% + ${y * 0.15}px))`;
        }
    });

});