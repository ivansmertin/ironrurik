document.addEventListener("DOMContentLoaded", () => {
    const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktopMedia = window.matchMedia("(min-width: 769px)");

    const header = document.querySelector(".header");
    const burgerButton = document.querySelector(".burger-btn");
    const navWrap = document.querySelector(".main-nav-wrap");
    const nav = document.querySelector(".main-nav");
    const navLinks = Array.from(nav.querySelectorAll(".nav-link"));
    const carouselTrack = document.getElementById("benefitsCarousel");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const progressFill = document.querySelector(".carousel-progress-fill");
    const pageProgressFill = document.querySelector(".page-progress-fill");

    let navHighlight = null;
    let currentNavLink = navLinks[0] || null;
    let hoverNavLink = null;

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const bindHorizontalTabNavigation = (tabList, tabs, onActivate) => {
        if (!tabList || tabs.length < 2) return;

        tabList.addEventListener("keydown", (event) => {
            const currentIndex = tabs.indexOf(document.activeElement);
            if (currentIndex === -1) return;

            let targetIndex = currentIndex;

            switch (event.key) {
                case "ArrowLeft":
                    targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                    break;
                case "ArrowRight":
                    targetIndex = (currentIndex + 1) % tabs.length;
                    break;
                case "Home":
                    targetIndex = 0;
                    break;
                case "End":
                    targetIndex = tabs.length - 1;
                    break;
                default:
                    return;
            }

            event.preventDefault();
            const targetTab = tabs[targetIndex];
            if (!targetTab) return;

            targetTab.focus();
            onActivate(targetTab);
        });
    };

    const setHeaderOffset = () => {
        const offset = (header?.offsetHeight || 80) + 12;
        document.documentElement.style.setProperty("--header-offset", `${offset}px`);
    };

    const syncPageProgress = () => {
        if (!pageProgressFill) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        pageProgressFill.style.width = `${pct}%`;
    };

    const closeMenu = () => {
        if (!burgerButton || !navWrap) return;
        burgerButton.classList.remove("is-active");
        burgerButton.setAttribute("aria-expanded", "false");
        navWrap.classList.remove("is-open");
        document.body.classList.remove("menu-open");
    };

    const openMenu = () => {
        if (!burgerButton || !navWrap) return;
        burgerButton.classList.add("is-active");
        burgerButton.setAttribute("aria-expanded", "true");
        navWrap.classList.add("is-open");
        document.body.classList.add("menu-open");
    };

    const toggleMenu = () => {
        if (navWrap.classList.contains("is-open")) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    const updateNavClasses = (currentLink, highlightedLink = currentLink) => {
        navLinks.forEach((link) => {
            const isCurrent = link === currentLink;
            const isHighlighted = link === highlightedLink;

            link.classList.toggle("is-current", isCurrent);
            link.classList.toggle("is-highlighted", isHighlighted);
            link.setAttribute("aria-current", isCurrent ? "page" : "false");
        });
    };

    const ensureNavHighlight = () => {
        if (!desktopMedia.matches) return null;
        if (!navHighlight) {
            navHighlight = document.createElement("span");
            navHighlight.className = "nav-highlight";
            nav.prepend(navHighlight);
        }
        nav.classList.add("has-highlight");
        return navHighlight;
    };

    const moveNavHighlight = (targetLink, instant = false) => {
        if (!targetLink) return;

        if (!desktopMedia.matches) {
            nav.classList.remove("has-highlight");
            updateNavClasses(currentNavLink, currentNavLink);
            return;
        }

        const pill = ensureNavHighlight();
        if (!pill) return;

        if (instant || motionReduced) {
            pill.classList.add("nav-highlight--no-transition");
        } else {
            pill.classList.remove("nav-highlight--no-transition");
        }

        const navRect = nav.getBoundingClientRect();
        const linkRect = targetLink.getBoundingClientRect();

        nav.style.setProperty("--pill-x", `${linkRect.left - navRect.left}px`);
        nav.style.setProperty("--pill-y", `${linkRect.top - navRect.top}px`);
        nav.style.setProperty("--pill-w", `${linkRect.width}px`);
        nav.style.setProperty("--pill-h", `${linkRect.height}px`);

        updateNavClasses(currentNavLink, targetLink);

        if (instant || motionReduced) {
            requestAnimationFrame(() => {
                pill.classList.remove("nav-highlight--no-transition");
            });
        }
    };

    const setCurrentNavLink = (link, instant = false) => {
        if (!link) return;
        currentNavLink = link;
        if (!hoverNavLink) {
            moveNavHighlight(link, instant);
        } else {
            updateNavClasses(currentNavLink, hoverNavLink);
        }
    };

    const initNav = () => {
        if (!navLinks.length) return;

        burgerButton?.addEventListener("click", toggleMenu);

        navLinks.forEach((link) => {
            link.addEventListener("mouseenter", () => {
                if (!desktopMedia.matches) return;
                hoverNavLink = link;
                moveNavHighlight(link);
            });

            link.addEventListener("focus", () => {
                if (!desktopMedia.matches) return;
                hoverNavLink = link;
                moveNavHighlight(link);
            });

            link.addEventListener("click", () => {
                setCurrentNavLink(link, true);
                closeMenu();
            });
        });

        nav.addEventListener("mouseleave", () => {
            hoverNavLink = null;
            moveNavHighlight(currentNavLink);
        });

        nav.addEventListener("focusout", (event) => {
            if (!nav.contains(event.relatedTarget)) {
                hoverNavLink = null;
                moveNavHighlight(currentNavLink);
            }
        });

        const ready = document.fonts?.ready || Promise.resolve();
        ready.then(() => {
            setCurrentNavLink(currentNavLink, true);
        });

        window.addEventListener("resize", () => {
            setHeaderOffset();
            if (desktopMedia.matches) {
                closeMenu();
            }
            moveNavHighlight(currentNavLink, true);
            syncCarouselProgress();
            syncOpenFaqHeight();
        });
    };

    const initScrollSpy = () => {
        const sectionMap = new Map(
            navLinks
                .map((link) => {
                    const id = link.getAttribute("href")?.replace("#", "");
                    const section = id ? document.getElementById(id) : null;
                    return [section, link];
                })
                .filter(([section]) => section)
        );

        const sections = Array.from(sectionMap.keys());
        if (!sections.length) return;

        const visible = new Map();

        const updateActiveSection = () => {
            if (!visible.size) return;

            const best = Array.from(visible.entries()).sort((a, b) => {
                const ratioDelta = b[1].ratio - a[1].ratio;
                if (Math.abs(ratioDelta) > 0.02) return ratioDelta;
                return a[1].top - b[1].top;
            })[0];

            if (!best) return;
            const link = sectionMap.get(best[0]);
            if (link) setCurrentNavLink(link);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visible.set(entry.target, {
                        ratio: entry.intersectionRatio,
                        top: Math.max(entry.boundingClientRect.top, 0)
                    });
                } else {
                    visible.delete(entry.target);
                }
            });

            updateActiveSection();
        }, {
            rootMargin: "-18% 0px -48% 0px",
            threshold: [0.2, 0.35, 0.5, 0.65]
        });

        sections.forEach((section) => observer.observe(section));
    };

    const initRevealAnimations = () => {
        const revealTargets = document.querySelectorAll(".reveal, .reveal-stagger");

        if (motionReduced) {
            revealTargets.forEach((el) => el.classList.add("is-revealed"));
            document.querySelectorAll(".counter").forEach((counter) => {
                counter.textContent = counter.dataset.target || counter.textContent;
            });
            return;
        }

        const animatedCounters = new WeakSet();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-revealed");

                entry.target.querySelectorAll(".counter").forEach((counter) => {
                    if (animatedCounters.has(counter)) return;
                    animatedCounters.add(counter);

                    const target = Number(counter.dataset.target);
                    if (target <= 1) {
                        counter.textContent = target;
                        return;
                    }

                    let startTime = null;
                    const duration = 1800;

                    const update = (currentTime) => {
                        if (!startTime) startTime = currentTime;
                        const progress = Math.min((currentTime - startTime) / duration, 1);
                        counter.textContent = Math.floor(easeOutExpo(progress) * target);

                        if (progress < 1) {
                            requestAnimationFrame(update);
                        } else {
                            counter.textContent = target;
                        }
                    };

                    requestAnimationFrame(update);
                });

                observer.unobserve(entry.target);
            });
        }, { threshold: 0.16 });

        revealTargets.forEach((el) => observer.observe(el));
    };

    const initGoalSelector = () => {
        const goalTabList = document.querySelector(".goal-tabs");
        const goalTabs = Array.from(document.querySelectorAll(".goal-tab"));
        const goalPanels = Array.from(document.querySelectorAll(".goal-panel"));
        const goalChips = Array.from(document.querySelectorAll(".goal-chip"));
        const ctaOverline = document.getElementById("cta-overline");
        const ctaPrimaryBtn = document.getElementById("cta-primary-btn");

        if (!goalTabs.length || !goalPanels.length) return;

        const heroGoalMap = {
            "бег": "lose",
            "триатлон": "gain",
            "трейл": "strength",
            "сила": "relief",
            "онлайн": "online"
        };

        const ctaCopyMap = {
            lose: {
                overline: "ХОЧЕШЬ БЕЖАТЬ СИЛЬНЕЕ",
                button: "ЗАПИСАТЬСЯ НА БЕГ-ПОДГОТОВКУ"
            },
            gain: {
                overline: "ГОТОВИШЬСЯ К ТРИАТЛОНУ",
                button: "ЗАПИСАТЬСЯ НА ПОДГОТОВКУ К ТРИАТЛОНУ"
            },
            strength: {
                overline: "ГОТОВИШЬСЯ К ТРЕЙЛУ",
                button: "ЗАПИСАТЬСЯ НА ТРЕЙЛ-ПОДГОТОВКУ"
            },
            relief: {
                overline: "ХОЧЕШЬ СТАТЬ СИЛЬНЕЕ",
                button: "ЗАПИСАТЬСЯ НА СИЛОВОЙ ЦИКЛ"
            },
            online: {
                overline: "НУЖЕН ОНЛАЙН-ФОРМАТ",
                button: "ЗАПИСАТЬСЯ ОНЛАЙН"
            }
        };

        const resolveGoal = (value) => {
            if (!value) return "";
            const normalized = value.trim().toLowerCase();
            return heroGoalMap[normalized] || normalized;
        };

        const updateCtaCopy = (goal) => {
            const copy = ctaCopyMap[goal];
            if (!copy) return;

            if (ctaOverline) {
                ctaOverline.textContent = copy.overline;
            }

            if (ctaPrimaryBtn) {
                ctaPrimaryBtn.textContent = copy.button;
            }
        };

        const syncGoalChips = (goal) => {
            goalChips.forEach((chip) => {
                const isActive = resolveGoal(chip.dataset.goal) === goal;
                chip.classList.toggle("is-active", isActive);
                chip.setAttribute("aria-pressed", String(isActive));
            });
        };

        const activateGoal = (goal) => {
            const targetGoal = resolveGoal(goal);
            const hasMatch = goalTabs.some((tab) => tab.dataset.goal === targetGoal);
            if (!hasMatch) return;

            goalTabs.forEach((tab) => {
                const isActive = tab.dataset.goal === targetGoal;
                tab.classList.toggle("is-active", isActive);
                tab.setAttribute("aria-selected", String(isActive));
            });

            goalPanels.forEach((panel) => {
                const isActive = panel.dataset.goal === targetGoal;
                panel.classList.toggle("is-active", isActive);
                panel.hidden = !isActive;
                panel.setAttribute("aria-hidden", String(!isActive));
            });

            syncGoalChips(targetGoal);
            updateCtaCopy(targetGoal);
        };

        goalTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                activateGoal(tab.dataset.goal);
            });

            tab.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                activateGoal(tab.dataset.goal);
            });
        });

        goalChips.forEach((chip) => {
            chip.addEventListener("click", () => {
                const targetGoal = resolveGoal(chip.dataset.goal);
                const targetTab = goalTabs.find((tab) => tab.dataset.goal === targetGoal);
                if (!targetTab) return;
                targetTab.click();
            });
        });

        bindHorizontalTabNavigation(goalTabList, goalTabs, (tab) => {
            activateGoal(tab.dataset.goal);
        });

        const defaultGoal =
            goalTabs.find((tab) => tab.classList.contains("is-active"))?.dataset.goal ||
            goalPanels.find((panel) => panel.classList.contains("is-active"))?.dataset.goal ||
            goalTabs[0].dataset.goal;

        activateGoal(defaultGoal);
    };

    const initDashboard = () => {
        const dashboardSection = document.querySelector(".dashboard-section");
        const metricBars = Array.from(document.querySelectorAll(".metric-bar-fill"));

        if (!dashboardSection || !metricBars.length) return;

        const animateBars = () => {
            metricBars.forEach((bar) => {
                const width = Number(bar.dataset.width);
                if (Number.isNaN(width)) return;
                bar.style.width = `${width}%`;
                bar.classList.add("is-animated");
            });
        };

        if (motionReduced) {
            animateBars();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                animateBars();
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.3 });

        observer.observe(dashboardSection);
    };

    const getCarouselScrollAmount = () => {
        const card = carouselTrack?.querySelector(".carousel-card");
        if (!card) return 0;
        const styles = window.getComputedStyle(carouselTrack);
        const gap = parseFloat(styles.gap) || 20;
        return card.getBoundingClientRect().width + gap;
    };

    const syncCarouselProgress = () => {
        if (!carouselTrack || !progressFill) return;

        const total = carouselTrack.scrollWidth;
        const visible = carouselTrack.clientWidth;
        const maxScroll = total - visible;

        const widthPercent = total > 0 ? Math.max((visible / total) * 100, 16) : 100;
        const leftPercent = maxScroll > 0
            ? ((100 - widthPercent) * carouselTrack.scrollLeft) / maxScroll
            : 0;

        progressFill.style.width = `${widthPercent}%`;
        progressFill.style.left = `${leftPercent}%`;
    };

    const initCarousel = () => {
        if (!carouselTrack || !prevBtn || !nextBtn) return;

        nextBtn.addEventListener("click", () => {
            carouselTrack.scrollBy({
                left: getCarouselScrollAmount(),
                behavior: motionReduced ? "auto" : "smooth"
            });
        });

        prevBtn.addEventListener("click", () => {
            carouselTrack.scrollBy({
                left: -getCarouselScrollAmount(),
                behavior: motionReduced ? "auto" : "smooth"
            });
        });

        carouselTrack.addEventListener("scroll", syncCarouselProgress, { passive: true });
        syncCarouselProgress();
    };

    const initPageProgress = () => {
        if (!pageProgressFill) return;
        window.addEventListener("scroll", syncPageProgress, { passive: true });
        window.addEventListener("resize", syncPageProgress);
        syncPageProgress();
    };

    const syncOpenFaqHeight = () => {
        document.querySelectorAll(".faq-item.is-open .faq-answer").forEach((panel) => {
            panel.style.height = `${panel.scrollHeight}px`;
        });
    };

    const initFaq = () => {
        const items = Array.from(document.querySelectorAll(".faq-item"));
        if (!items.length) return;

        const applyState = (item, open) => {
            const button = item.querySelector(".faq-question");
            const panel = item.querySelector(".faq-answer");

            item.classList.toggle("is-open", open);
            button.setAttribute("aria-expanded", String(open));
            panel.setAttribute("aria-hidden", String(!open));
            panel.style.height = open ? `${panel.scrollHeight}px` : "0px";
        };

        items.forEach((item) => applyState(item, item.classList.contains("is-open")));

        items.forEach((item) => {
            const button = item.querySelector(".faq-question");

            button.addEventListener("click", () => {
                const alreadyOpen = item.classList.contains("is-open");
                applyState(item, !alreadyOpen);
            });
        });
    };

    const initFaqCategoryTabs = () => {
        const categoryTabList = document.querySelector(".faq-category-tabs");
        const categoryTabs = Array.from(document.querySelectorAll(".faq-cat-tab"));
        const faqItems = Array.from(document.querySelectorAll(".faq-item"));

        if (!categoryTabs.length || !faqItems.length) return;

        const applyCategory = (category) => {
            categoryTabs.forEach((tab) => {
                const isActive = tab.dataset.cat === category;
                tab.classList.toggle("is-active", isActive);
                tab.setAttribute("aria-selected", String(isActive));
            });

            faqItems.forEach((item) => {
                const shouldShow = category === "all" || item.dataset.cat === category;
                const panel = item.querySelector(".faq-answer");

                item.hidden = !shouldShow;

                if (!panel) return;

                if (!shouldShow) {
                    panel.style.height = "0px";
                } else if (item.classList.contains("is-open")) {
                    panel.style.height = `${panel.scrollHeight}px`;
                }
            });

            requestAnimationFrame(() => {
                syncOpenFaqHeight();
            });
        };

        categoryTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                applyCategory(tab.dataset.cat || "all");
            });
        });

        bindHorizontalTabNavigation(categoryTabList, categoryTabs, (tab) => {
            applyCategory(tab.dataset.cat || "all");
        });

        const defaultCategory =
            categoryTabs.find((tab) => tab.classList.contains("is-active"))?.dataset.cat || "all";

        applyCategory(defaultCategory);
    };

    setHeaderOffset();
    initNav();
    initRevealAnimations();
    initGoalSelector();
    initDashboard();
    initScrollSpy();
    initCarousel();
    initFaq();
    initFaqCategoryTabs();
    initPageProgress();
});
