const root = document.documentElement;
if (root && !root.classList.contains('js-enabled')) {
    root.classList.add('js-enabled');
}

const initialize = () => {
    if (initialize.hasRun) {
        return;
    }
    initialize.hasRun = true;

    const isStorageAvailable = (() => {
        try {
            const key = '__sdu-storage-check__';
            window.localStorage.setItem(key, key);
            window.localStorage.removeItem(key);
            return true;
        } catch (error) {
            return false;
        }
    })();

    const pruneMegaMenuColumns = () => {
        const nav = document.querySelector('.main-nav');
        if (!nav) {
            return;
        }

        const columnGroups = Array.from(nav.querySelectorAll('.mega-columns'));
        columnGroups.forEach((group) => {
            const columns = Array.from(group.querySelectorAll('.mega-column'));
            columns.forEach((column) => {
                if (!(column instanceof HTMLElement)) {
                    return;
                }

                const listItems = Array.from(column.querySelectorAll('li'));
                listItems.forEach((item) => {
                    if (!(item instanceof HTMLElement)) {
                        return;
                    }

                    const link = item.querySelector('a[href]');
                    if (link instanceof HTMLElement) {
                        const linkText = link.textContent ? link.textContent.trim() : '';
                        const isHidden =
                            link.hasAttribute('hidden') || link.getAttribute('aria-hidden') === 'true';

                        if (isHidden || linkText.length === 0) {
                            link.remove();
                        }
                    }

                    const itemText = item.textContent ? item.textContent.trim() : '';
                    const hasInteractiveContent = Boolean(item.querySelector('a[href], button'));
                    if (!hasInteractiveContent && itemText.length === 0) {
                        item.remove();
                    }
                });

                const sections = Array.from(column.querySelectorAll('.mega-section'));
                sections.forEach((section) => {
                    if (!(section instanceof HTMLElement)) {
                        return;
                    }

                    const sectionHasContent = Boolean(
                        section.querySelector(
                            'a[href], .mega-promo, li, p:not(:empty), strong:not(:empty)'
                        )
                    );

                    const sectionText = section.textContent ? section.textContent.trim() : '';
                    if (!sectionHasContent && sectionText.length === 0) {
                        section.remove();
                    }
                });

                const hasMeaningfulContent = Boolean(
                    column.querySelector(
                        'a[href], .mega-promo, li, p:not(:empty), strong:not(:empty)'
                    )
                );

                const textContent = column.textContent ? column.textContent.trim() : '';
                if (!hasMeaningfulContent && textContent.length === 0) {
                    column.remove();
                }
            });

            const remainingColumns = group.querySelectorAll('.mega-column').length;
            if (remainingColumns === 0) {
                const menu = group.closest('.mega-menu');
                if (menu) {
                    menu.remove();
                } else {
                    group.remove();
                }
                return;
            }

            group.dataset.columns = String(remainingColumns);
        });
    };

    const setupMegaMenuForTouch = () => {
        const nav = document.querySelector('.main-nav');
        if (!nav) {
            return;
        }

        const navItems = Array.from(nav.querySelectorAll('li.has-mega'));
        if (navItems.length === 0) {
            return;
        }

        const coarseQuery =
            typeof window.matchMedia === 'function'
                ? window.matchMedia('(hover: none) and (pointer: coarse)')
                : null;

        const detectTouchEnvironment = () => {
            const hasTouchEvent =
                'ontouchstart' in window ||
                (typeof navigator !== 'undefined' && Number(navigator.maxTouchPoints) > 0);
            return Boolean((coarseQuery && coarseQuery.matches) || hasTouchEvent);
        };

        let touchEnabled = detectTouchEnvironment();

        const closeAll = () => {
            navItems.forEach((item) => {
                item.classList.remove('is-open');
                const trigger = item.querySelector(':scope > a');
                if (trigger) {
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });
        };

        const updateTouchState = () => {
            const nextState = detectTouchEnvironment();
            if (touchEnabled === nextState) {
                return;
            }

            touchEnabled = nextState;
            if (!touchEnabled) {
                closeAll();
            }
        };

        navItems.forEach((item) => {
            const trigger = item.querySelector(':scope > a');
            if (!trigger) {
                return;
            }

            trigger.setAttribute('aria-expanded', 'false');

            trigger.addEventListener('click', (event) => {
                if (!touchEnabled) {
                    closeAll();
                    return;
                }

                const isOpen = item.classList.contains('is-open');
                if (!isOpen) {
                    event.preventDefault();
                    closeAll();
                    item.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });

            item.addEventListener('focusout', (event) => {
                if (!touchEnabled) {
                    return;
                }

                if (!item.contains(event.relatedTarget)) {
                    item.classList.remove('is-open');
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });
        });

        const megaLinks = nav.querySelectorAll('.mega-menu a');
        megaLinks.forEach((link) => {
            link.addEventListener('click', () => {
                if (!touchEnabled) {
                    return;
                }

                closeAll();
            });
        });

        document.addEventListener('click', (event) => {
            if (!touchEnabled) {
                return;
            }

            if (!nav.contains(event.target)) {
                closeAll();
            }
        });

        if (coarseQuery) {
            const handleChange = () => {
                updateTouchState();
            };

            if (typeof coarseQuery.addEventListener === 'function') {
                coarseQuery.addEventListener('change', handleChange);
            } else if (typeof coarseQuery.addListener === 'function') {
                coarseQuery.addListener(handleChange);
            }
        }

        window.addEventListener('resize', updateTouchState);
    };

    const ensureScrollButton = () => {
        let scrollButton = document.querySelector('[data-scroll-top]');
        if (scrollButton) {
            return scrollButton;
        }

        scrollButton = document.createElement('button');
        scrollButton.type = 'button';
        scrollButton.className = 'scroll-to-top';
        scrollButton.setAttribute('data-scroll-top', '');
        scrollButton.setAttribute('aria-label', '맨 위로');
        scrollButton.innerHTML =
            '<svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">' +
            '<path d="M12 5.5a1 1 0 0 1 .7.3l6 6a1 1 0 0 1-1.4 1.4L12 7.91l-5.3 5.29a1 1 0 0 1-1.4-1.42l6-6a1 1 0 0 1 .7-.28Z" />' +
            '<path d="M12 11.5a1 1 0 0 1 .7.3l6 6a1 1 0 0 1-1.4 1.4L12 13.91l-5.3 5.29a1 1 0 0 1-1.4-1.42l6-6a1 1 0 0 1 .7-.28Z" />' +
            '</svg>';
        document.body.appendChild(scrollButton);

        return scrollButton;
    };

    const ensureDarkModeToggle = () => {
        let themeToggle = document.querySelector('[data-theme-toggle]');
        if (themeToggle) {
            return themeToggle;
        }

        themeToggle = document.createElement('button');
        themeToggle.type = 'button';
        themeToggle.className = 'dark-mode-toggle';
        themeToggle.setAttribute('data-theme-toggle', '');
        themeToggle.setAttribute('aria-pressed', 'false');
        themeToggle.innerHTML =
            '<span class="dark-mode-toggle__icon" aria-hidden="true">🌙</span>' +
            '<span class="dark-mode-toggle__label">다크 모드</span>';
        document.body.appendChild(themeToggle);

        return themeToggle;
    };

    const applyTheme = (theme) => {
        const isDark = theme === 'dark';
        document.body.classList.toggle('theme-dark', isDark);
        document.documentElement.dataset.theme = theme;
        document.dispatchEvent(
            new CustomEvent('themechange', {
                detail: { theme },
            })
        );
    };

    const getStoredTheme = () => {
        if (!isStorageAvailable) {
            return null;
        }

        return window.localStorage.getItem('preferred-theme');
    };

    const storeTheme = (theme) => {
        if (!isStorageAvailable) {
            return;
        }

        window.localStorage.setItem('preferred-theme', theme);
    };

    pruneMegaMenuColumns();
    setupMegaMenuForTouch();

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const track = slider.querySelector('[data-hero-track]');
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const prevButton = slider.querySelector('[data-hero-prev]');
        const nextButton = slider.querySelector('[data-hero-next]');
        const interval = Number(slider.getAttribute('data-hero-interval')) || 8000;

        if (slides.length > 0 && track) {
            let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
            if (currentIndex < 0) {
                currentIndex = 0;
            }

            let autoplayId = null;

            const syncSliderBackground = () => {
                const activeSlide = slides[currentIndex];
                if (!activeSlide) {
                    slider.style.removeProperty('--hero-background');
                    return;
                }

                const computed = window.getComputedStyle(activeSlide);
                const background = computed.getPropertyValue('--hero-background').trim();

                if (background) {
                    slider.style.setProperty('--hero-background', background);
                } else {
                    slider.style.removeProperty('--hero-background');
                }
            };

            const preloadAssets = () => {
                const sources = new Set();

                slides.forEach((slide) => {
                    const images = Array.from(
                        slide.querySelectorAll('img[data-preload], img[data-src], img[data-lazy], img.bg, picture source')
                    );

                    images.forEach((image) => {
                        if (!(image instanceof HTMLElement)) {
                            return;
                        }

                        const source =
                            image.getAttribute('data-src') ||
                            image.getAttribute('data-lazy') ||
                            image.getAttribute('src') ||
                            image.getAttribute('srcset') ||
                            '';

                        if (!source || sources.has(source)) {
                            return;
                        }

                        sources.add(source);

                        const img = new Image();
                        if (image.tagName === 'SOURCE') {
                            img.srcset = source;
                        } else {
                            img.src = source;
                        }
                    });
                });
            };

            const getSlideHeight = (slide) => {
                if (!slide) {
                    return 0;
                }

                const isActive = slide.classList.contains('is-active');
                if (isActive) {
                    return slide.offsetHeight;
                }

                const previous = {
                    position: slide.style.position,
                    opacity: slide.style.opacity,
                    visibility: slide.style.visibility,
                    pointerEvents: slide.style.pointerEvents,
                    transition: slide.style.transition,
                };

                slide.style.transition = 'none';
                slide.style.position = 'relative';
                slide.style.opacity = '0';
                slide.style.visibility = 'hidden';
                slide.style.pointerEvents = 'none';

                const height = slide.offsetHeight;

                slide.style.position = previous.position;
                slide.style.opacity = previous.opacity;
                slide.style.visibility = previous.visibility;
                slide.style.pointerEvents = previous.pointerEvents;
                slide.style.transition = previous.transition;

                return height;
            };

            const shouldUseAutoHeight = () => window.matchMedia('(max-width: 768px)').matches;

            const measureTrackHeight = () => {
                if (shouldUseAutoHeight()) {
                    track.style.height = '';
                    return;
                }

                const heights = slides.map((slide) => getSlideHeight(slide));
                const maxHeight = Math.max(...heights);

                if (!Number.isFinite(maxHeight) || maxHeight <= 0) {
                    return;
                }

                track.style.height = `${maxHeight}px`;
            };

            const updateHeight = () => {
                measureTrackHeight();
            };

            const setActive = (index) => {
                const targetIndex = (index + slides.length) % slides.length;
                slides.forEach((slide, idx) => {
                    const isActive = idx === targetIndex;
                    slide.classList.toggle('is-active', isActive);
                    slide.setAttribute('aria-hidden', String(!isActive));
                });

                dots.forEach((dot, idx) => {
                    const isActive = idx === targetIndex;
                    dot.classList.toggle('is-active', isActive);
                    dot.setAttribute('aria-selected', String(isActive));
                    if (isActive) {
                        dot.setAttribute('aria-current', 'true');
                    } else {
                        dot.removeAttribute('aria-current');
                    }
                });

                currentIndex = targetIndex;
                syncSliderBackground();
                updateHeight();
            };

            const goTo = (index) => {
                setActive(index);
            };

            const goToNext = () => {
                goTo(currentIndex + 1);
            };

            const goToPrev = () => {
                goTo(currentIndex - 1);
            };

            const stopAutoplay = () => {
                if (autoplayId) {
                    window.clearInterval(autoplayId);
                    autoplayId = null;
                }
            };

            const startAutoplay = () => {
                if (slides.length < 2) {
                    return;
                }

                stopAutoplay();
                autoplayId = window.setInterval(() => {
                    goToNext();
                }, interval);
            };

            prevButton?.addEventListener('click', () => {
                goToPrev();
                startAutoplay();
            });

            nextButton?.addEventListener('click', () => {
                goToNext();
                startAutoplay();
            });

            dots.forEach((dot) => {
                dot.addEventListener('click', () => {
                    const target = Number(dot.getAttribute('data-hero-dot'));
                    if (Number.isNaN(target)) {
                        return;
                    }

                    goTo(target);
                    startAutoplay();
                });
            });

            slider.addEventListener('pointerenter', stopAutoplay);
            slider.addEventListener('pointerleave', startAutoplay);
            slider.addEventListener('focusin', stopAutoplay);
            slider.addEventListener('focusout', (event) => {
                if (!slider.contains(event.relatedTarget)) {
                    startAutoplay();
                }
            });

            slider.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    goToPrev();
                    startAutoplay();
                } else if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    goToNext();
                    startAutoplay();
                }
            });

            preloadAssets();

            setActive(currentIndex);
            startAutoplay();
            updateHeight();

            const handleResize = () => {
                window.requestAnimationFrame(updateHeight);
            };

            window.addEventListener('resize', handleResize);

            window.addEventListener('load', updateHeight);

            const handleThemeChange = () => {
                syncSliderBackground();
                window.requestAnimationFrame(updateHeight);
            };

            document.addEventListener('themechange', handleThemeChange);
        }
    }


    const initAboutSlider = () => {
        const slider = document.querySelector('[data-about-slider]');
        if (!slider) {
            return;
        }

        const slides = Array.from(slider.querySelectorAll('[data-about-slide]'));
        if (slides.length === 0) {
            return;
        }

        const dots = Array.from(slider.querySelectorAll('[data-about-dot]'));
        const prevButton = slider.querySelector('[data-about-prev]');
        const nextButton = slider.querySelector('[data-about-next]');

        let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
        if (currentIndex < 0) {
            currentIndex = 0;
        }

        const setActive = (index) => {
            const targetIndex = (index + slides.length) % slides.length;

            slides.forEach((slide, idx) => {
                const isActive = idx === targetIndex;
                slide.classList.toggle('is-active', isActive);
                slide.setAttribute('aria-hidden', String(!isActive));
            });

            dots.forEach((dot, idx) => {
                const isActive = idx === targetIndex;
                dot.classList.toggle('is-active', isActive);
                dot.setAttribute('aria-selected', String(isActive));
                dot.setAttribute('tabindex', isActive ? '0' : '-1');

                if (isActive) {
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.removeAttribute('aria-current');
                }
            });

            currentIndex = targetIndex;
        };

        const goTo = (index) => {
            if (slides.length === 0) {
                return;
            }

            setActive(index);
        };

        prevButton?.addEventListener('click', () => {
            goTo(currentIndex - 1);
        });

        nextButton?.addEventListener('click', () => {
            goTo(currentIndex + 1);
        });

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                goTo(idx);
            });
        });

        slider.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goTo(currentIndex - 1);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                goTo(currentIndex + 1);
            }
        });

        setActive(currentIndex);
    };

    initAboutSlider();


    const videoSliders = document.querySelectorAll('[data-video-slider]');
    if (videoSliders.length > 0) {
        const initVideoSlider = (slider) => {
            const track = slider.querySelector('[data-video-track]');
            const slides = Array.from(slider.querySelectorAll('[data-video-slide]'));
            if (!track || slides.length === 0) {
                return;
            }

            const dots = Array.from(slider.querySelectorAll('[data-video-dot]'));
            const prevButton = slider.querySelector('[data-video-prev]');
            const nextButton = slider.querySelector('[data-video-next]');
            const interval = Number(slider.getAttribute('data-video-interval')) || 12000;

            let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
            if (currentIndex < 0) {
                currentIndex = 0;
            }

            let autoplayId = null;

            const updateHeight = () => {
                const activeSlide = slides[currentIndex];
                if (!activeSlide) {
                    return;
                }

                track.style.height = `${activeSlide.offsetHeight}px`;
            };

            const setActive = (index) => {
                const targetIndex = (index + slides.length) % slides.length;

                slides.forEach((slide, idx) => {
                    const isActive = idx === targetIndex;
                    slide.classList.toggle('is-active', isActive);
                    slide.setAttribute('aria-hidden', String(!isActive));
                });

                dots.forEach((dot, idx) => {
                    const isActive = idx === targetIndex;
                    dot.classList.toggle('is-active', isActive);
                    dot.setAttribute('aria-selected', String(isActive));
                    if (isActive) {
                        dot.setAttribute('aria-current', 'true');
                    } else {
                        dot.removeAttribute('aria-current');
                    }
                });

                currentIndex = targetIndex;
                updateHeight();
            };

            const goTo = (index) => {
                setActive(index);
            };

            const goToNext = () => {
                goTo(currentIndex + 1);
            };

            const goToPrev = () => {
                goTo(currentIndex - 1);
            };

            const stopAutoplay = () => {
                if (autoplayId) {
                    window.clearInterval(autoplayId);
                    autoplayId = null;
                }
            };

            const startAutoplay = () => {
                if (slides.length < 2) {
                    return;
                }

                stopAutoplay();
                autoplayId = window.setInterval(() => {
                    goToNext();
                }, interval);
            };

            prevButton?.addEventListener('click', () => {
                goToPrev();
                startAutoplay();
            });

            nextButton?.addEventListener('click', () => {
                goToNext();
                startAutoplay();
            });

            dots.forEach((dot) => {
                dot.addEventListener('click', () => {
                    const target = Number(dot.getAttribute('data-video-dot'));
                    if (Number.isNaN(target)) {
                        return;
                    }

                    goTo(target);
                    startAutoplay();
                });
            });

            slider.addEventListener('pointerenter', stopAutoplay);
            slider.addEventListener('pointerleave', startAutoplay);
            slider.addEventListener('focusin', stopAutoplay);
            slider.addEventListener('focusout', (event) => {
                if (!slider.contains(event.relatedTarget)) {
                    startAutoplay();
                }
            });

            slider.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    goToPrev();
                    startAutoplay();
                } else if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    goToNext();
                    startAutoplay();
                }
            });

            setActive(currentIndex);
            startAutoplay();
            updateHeight();

            window.addEventListener('resize', () => {
                window.requestAnimationFrame(updateHeight);
            });

            window.addEventListener('load', updateHeight);
        };

        videoSliders.forEach((slider) => {
            initVideoSlider(slider);
        });
    }

    const initDepartmentTabs = () => {
        const tabGroups = document.querySelectorAll('.department-tabs');
        if (tabGroups.length === 0) {
            return;
        }

        tabGroups.forEach((tabGroup) => {
            const tabList = tabGroup.querySelector('[role="tablist"]') || tabGroup;
            const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
            if (tabs.length === 0) {
                return;
            }

            const getPanel = (tab) => {
                const controls = tab.getAttribute('aria-controls');
                if (!controls) {
                    return null;
                }

                return document.getElementById(controls);
            };

            const setActive = (targetTab, options = {}) => {
                if (!targetTab) {
                    return;
                }

                const { focus = false, updateHash = true } = options;
                const activeControls = targetTab.getAttribute('aria-controls');

                tabs.forEach((tab) => {
                    const isActive = tab === targetTab;
                    tab.classList.toggle('is-active', isActive);
                    tab.setAttribute('aria-selected', String(isActive));
                    tab.setAttribute('tabindex', isActive ? '0' : '-1');

                    const panel = getPanel(tab);
                    if (!panel) {
                        return;
                    }

                    if (isActive) {
                        panel.classList.add('is-active');
                        panel.removeAttribute('hidden');
                    } else {
                        panel.classList.remove('is-active');
                        panel.setAttribute('hidden', '');
                    }
                });

                if (updateHash && activeControls) {
                    const newHash = `#${activeControls}`;
                    if (window.location.hash !== newHash) {
                        if (typeof window.history.replaceState === 'function') {
                            window.history.replaceState(null, '', newHash);
                        } else {
                            window.location.hash = newHash;
                        }
                    }
                }

                if (focus) {
                    targetTab.focus();
                }
            };

            const focusTabByIndex = (index) => {
                if (tabs.length === 0) {
                    return;
                }

                const targetIndex = (index + tabs.length) % tabs.length;
                const targetTab = tabs[targetIndex];
                setActive(targetTab, { focus: true });
            };

            tabs.forEach((tab, index) => {
                if (!tab.hasAttribute('aria-selected')) {
                    const isActive = tab.classList.contains('is-active');
                    tab.setAttribute('aria-selected', String(isActive));
                }

                if (!tab.hasAttribute('tabindex')) {
                    tab.setAttribute('tabindex', tab.classList.contains('is-active') ? '0' : '-1');
                }

                tab.addEventListener('click', (event) => {
                    event.preventDefault();
                    setActive(tab);
                });

                tab.addEventListener('keydown', (event) => {
                    switch (event.key) {
                        case 'ArrowRight':
                        case 'ArrowDown':
                            event.preventDefault();
                            focusTabByIndex(index + 1);
                            break;
                        case 'ArrowLeft':
                        case 'ArrowUp':
                            event.preventDefault();
                            focusTabByIndex(index - 1);
                            break;
                        case 'Home':
                            event.preventDefault();
                            focusTabByIndex(0);
                            break;
                        case 'End':
                            event.preventDefault();
                            focusTabByIndex(tabs.length - 1);
                            break;
                        default:
                            break;
                    }
                });
            });

            const getTabByPanelId = (panelId) =>
                tabs.find((tab) => tab.getAttribute('aria-controls') === panelId) || null;

            const initialTab = tabs.find((tab) => tab.classList.contains('is-active')) || tabs[0];
            setActive(initialTab, { updateHash: false });

            const syncWithHash = (shouldFocus = false) => {
                const hash = window.location.hash.replace('#', '');
                if (!hash) {
                    return;
                }

                const matchingTab = getTabByPanelId(hash);
                if (matchingTab) {
                    setActive(matchingTab, { focus: shouldFocus, updateHash: false });
                }
            };

            syncWithHash();

            window.addEventListener('hashchange', () => {
                syncWithHash(true);
            });
        });
    };

    initDepartmentTabs();

    const initializeGoogleTranslate = () => {
        const container = document.getElementById('google_translate_element');
        if (!container) {
            return;
        }

        const includedLanguages = 'en,zh-CN,zh-TW,ja,th,vi,tl,fr,de,id,ru,es';

        const instantiateWidget = () => {
            if (container.dataset.translateInitialized === 'true') {
                return;
            }

            if (
                !window.google ||
                !window.google.translate ||
                !window.google.translate.TranslateElement
            ) {
                return;
            }

            container.dataset.translateInitialized = 'true';

            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'ko',
                    includedLanguages,
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false,
                },
                'google_translate_element'
            );
        };

        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
            instantiateWidget();
            return;
        }

        window.googleTranslateElementInit = () => {
            instantiateWidget();
        };

        const existingScript = document.querySelector(
            'script[src^="https://translate.google.com/translate_a/element.js"]'
        );
        if (existingScript) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    };

    initializeGoogleTranslate();

    const setupConsultationBooking = () => {
        const form = document.getElementById('consultation-booking-form');
        if (!form) {
            return;
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const name = String(formData.get('name') || '').trim();
            const phone = String(formData.get('phone') || '').trim();
            const date = String(formData.get('date') || '').trim();

            const details = [];
            if (name) {
                details.push(`이름: ${name}`);
            }
            if (phone) {
                details.push(`연락처: ${phone}`);
            }
            if (date) {
                details.push(`상담 희망일: ${date}`);
            }

            const subjectSuffix = name ? ` - ${name}` : '';
            const subject = encodeURIComponent(`상담 예약 신청${subjectSuffix}`);
            const body = encodeURIComponent(details.join('\n'));

            const mailtoUrl = `mailto:gtcccybercollege@gmial.com?subject=${subject}&body=${body}`;
            window.location.href = mailtoUrl;
        });
    };

    setupConsultationBooking();

    const darkModeToggle = ensureDarkModeToggle();
    if (darkModeToggle) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const storedTheme = getStoredTheme();
        const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

        const updateDarkToggleLabel = () => {
            const isDark = document.body.classList.contains('theme-dark');
            darkModeToggle.setAttribute('aria-pressed', String(isDark));
            darkModeToggle.innerHTML =
                `<span class="dark-mode-toggle__icon" aria-hidden="true">${isDark ? '☀️' : '🌙'}</span>` +
                `<span class="dark-mode-toggle__label">${isDark ? '라이트 모드' : '다크 모드'}</span>`;
        };

        applyTheme(initialTheme);
        updateDarkToggleLabel();

        darkModeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('theme-dark');
            const nextTheme = isDark ? 'light' : 'dark';
            applyTheme(nextTheme);
            storeTheme(nextTheme);
            updateDarkToggleLabel();
        });

        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleMediaChange = (event) => {
                if (getStoredTheme()) {
                    return;
                }

                applyTheme(event.matches ? 'dark' : 'light');
                updateDarkToggleLabel();
            };

            if (typeof mediaQuery.addEventListener === 'function') {
                mediaQuery.addEventListener('change', handleMediaChange);
            } else if (typeof mediaQuery.addListener === 'function') {
                mediaQuery.addListener(handleMediaChange);
            }
        }
    }

    const setupNewsletterMailto = () => {
        const form = document.querySelector('#newsletter-subscribe-form');
        if (!form) {
            return;
        }

        const emailInput = form.querySelector("input[type='email']");
        const feedback = form.querySelector('[data-feedback]');

        const updateFeedback = (message = '') => {
            if (feedback) {
                feedback.textContent = message;
            }
        };

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!(emailInput instanceof HTMLInputElement)) {
                return;
            }

            if (!emailInput.checkValidity()) {
                emailInput.reportValidity();
                updateFeedback('유효한 이메일 주소를 입력해주세요.');
                return;
            }

            const emailValue = emailInput.value.trim();
            const subject = encodeURIComponent('간편 구독 신청');
            const body = encodeURIComponent(`신청자 이메일: ${emailValue}\n간편 구독 신청`);
            const mailtoLink = `mailto:gtcccybercolleage@gmail.com?subject=${subject}&body=${body}`;

            updateFeedback('메일 작성 창이 열립니다. 간편 구독 신청 내용을 확인해주세요.');

            window.location.href = mailtoLink;
        });

        form.addEventListener('input', () => {
            updateFeedback();
        });
    };

    setupNewsletterMailto();

    const scrollButton = ensureScrollButton();
    if (scrollButton) {
        const toggleVisibility = () => {
            const shouldShow = window.scrollY > 240;
            scrollButton.classList.toggle('is-visible', shouldShow);
        };

        scrollButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();
    }
};

const runWhenReady = () => {
    if (initialize.hasRun) {
        return;
    }

    if (document.querySelector('.site-header .container') || window.__includesReady) {
        initialize();
        return;
    }

    const handleIncludesReady = () => {
        initialize();
    };

    document.addEventListener('includes:ready', handleIncludesReady, { once: true });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runWhenReady);
} else {
    runWhenReady();
}
