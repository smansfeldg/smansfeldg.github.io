// Portfolio JavaScript
// Author: Santiago Ariel Mansfeld
// Description: Interactive functionality for portfolio website

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });

    // -----------------------------
    // Analytics (GA4) Instrumentation
    // -----------------------------
    // Safe GA4 event dispatcher
    // Determine if analytics should be disabled (local dev) unless forced
    const ANALYTICS_FORCED = /[?&]analytics=1\b/.test(window.location.search);
    const IS_LOCAL = ['file:', 'http://localhost', 'http://127.0.0.1'].some(p => window.location.href.startsWith(p));
    const ANALYTICS_ENABLED = ANALYTICS_FORCED || !IS_LOCAL;

    function trackEvent(eventName, params = {}) {
        try {
            if (!ANALYTICS_ENABLED) return; // Skip in local/dev unless forced
            if (typeof window.gtag === 'function') {
                window.gtag('event', eventName, params);
            } else {
                // Retry shortly in case gtag hasn't loaded yet
                setTimeout(() => {
                    if (ANALYTICS_ENABLED && typeof window.gtag === 'function') {
                        window.gtag('event', eventName, params);
                    }
                }, 1500);
            }
        } catch (e) {
            console.warn('Analytics trackEvent error:', e);
        }
    }
    
    // Helper: find nearest section id for context
    function getContextSectionId(element) {
        const section = element.closest('section[id]');
        return section ? section.id : 'unknown';
    }
    
    // Helper: normalize URL data
    function getLinkMeta(anchor) {
        const href = anchor.getAttribute('href') || '';
        let url;
        try { url = new URL(href, window.location.href); } catch { url = null; }
        return { href, url, sectionId: getContextSectionId(anchor) };
    }

    // Dark Mode Functionality
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
    const htmlElement = document.documentElement;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
        // Default to light mode
        htmlElement.classList.remove('dark');
    }

    // Dark mode toggle function
    function sendUserThemeProperty() {
        try {
            if (!ANALYTICS_ENABLED || typeof window.gtag !== 'function') return;
            const isDark = document.documentElement.classList.contains('dark');
            window.gtag('set', 'user_properties', { theme: isDark ? 'dark' : 'light' });
        } catch(e) { console.warn('user_properties theme error', e); }
    }

    function toggleDarkMode() {
        htmlElement.classList.toggle('dark');
        const isDark = htmlElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Add transition effect
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);

        // Update GA4 user property for theme
        sendUserThemeProperty();
        // Optional event when theme toggled
        trackEvent('theme_toggle', { theme: isDark ? 'dark' : 'light' });
    }

    // Event listeners for dark mode toggles
    darkModeToggle.addEventListener('click', toggleDarkMode);
    darkModeToggleMobile.addEventListener('click', toggleDarkMode);

    // Mobile Menu Functionality
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    mobileMenuToggle.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
        
        // Toggle icon
        const icon = mobileMenuToggle.querySelector('i');
        if (mobileMenu.classList.contains('hidden')) {
            icon.className = 'fas fa-bars';
        } else {
            icon.className = 'fas fa-times';
        }
    });

    // Close mobile menu when clicking on a link
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenuToggle.querySelector('i').className = 'fas fa-bars';
        });
    });

    // Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            // Analytics: navigation click
            trackEvent('nav_click', {
                target: targetId.replace('#',''),
                location: this.closest('#mobileMenu') ? 'mobile' : 'desktop'
            });
            
            if (targetSection) {
                const headerOffset = 80; // Account for fixed header
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active Navigation Highlighting
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-link');

    function updateActiveNavigation() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const sectionHeight = section.clientHeight;
            if (sectionTop <= 100 && sectionTop + sectionHeight > 100) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('text-primary', 'dark:text-primary-dark');
            item.classList.add('text-text-secondary-light', 'dark:text-text-secondary-dark');
            
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.remove('text-text-secondary-light', 'dark:text-text-secondary-dark');
                item.classList.add('text-primary', 'dark:text-primary-dark');
            }
        });
    }

    // Project Tabs Functionality
    const projectTabs = document.querySelectorAll('.project-tab');
    const projectContents = document.querySelectorAll('.project-content');

    projectTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            // Analytics: project tab selected
            trackEvent('project_tab_select', {
                tab: targetTab,
                section: getContextSectionId(this)
            });
            
            // Update active tab
            projectTabs.forEach(t => {
                t.classList.remove('active', 'bg-primary', 'dark:bg-primary-dark', 'text-white');
                t.classList.add('text-text-secondary-light', 'dark:text-text-secondary-dark');
            });
            
            this.classList.add('active', 'bg-primary', 'dark:bg-primary-dark', 'text-white');
            this.classList.remove('text-text-secondary-light', 'dark:text-text-secondary-dark');
            
            // Update content
            projectContents.forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById(`${targetTab}-projects`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('active');
                
                // Re-trigger AOS animations for new content
                AOS.refreshHard();
            }
        });
    });

    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Analytics: contact form submit (no PII)
        try {
            trackEvent('contact_submit', {
                has_subject: !!subject,
                message_len: (message || '').length
            });
        } catch(_) {}
        
        // Create mailto link
        const mailtoLink = `mailto:santimansfeld@proton.me?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`)}`;
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Show success message
        showNotification('¡Mensaje enviado! Se abrirá tu cliente de email.', 'success');
        
        // Reset form
        this.reset();
    });

    // Notification System
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${
            type === 'success' ? 'bg-secondary dark:bg-secondary-dark text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-primary dark:bg-primary-dark text-white'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-info'} mr-2"></i>
                <span>${message}</span>
                <button class="ml-4 hover:opacity-75" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');
    
    function toggleBackToTopButton() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.remove('opacity-0', 'invisible');
            backToTopButton.classList.add('opacity-100', 'visible');
        } else {
            backToTopButton.classList.add('opacity-0', 'invisible');
            backToTopButton.classList.remove('opacity-100', 'visible');
        }
    }
    
    // Ensure button stays within viewport on mobile
    function adjustBackToTopPosition() {
        if (window.innerWidth <= 768) {
            const viewportWidth = window.innerWidth;
            const buttonWidth = 44; // 2.75rem = 44px
            const minRight = 16; // 1rem = 16px
            
            // Ensure button doesn't cause horizontal overflow
            if (viewportWidth < (buttonWidth + minRight * 2)) {
                backToTopButton.style.right = `${minRight}px`;
                backToTopButton.style.width = `${Math.min(buttonWidth, viewportWidth - minRight * 2)}px`;
                backToTopButton.style.height = `${Math.min(buttonWidth, viewportWidth - minRight * 2)}px`;
            } else {
                // Reset to default mobile styles
                backToTopButton.style.right = '';
                backToTopButton.style.width = '';
                backToTopButton.style.height = '';
            }
        } else {
            // Reset to default desktop styles
            backToTopButton.style.right = '';
            backToTopButton.style.width = '';
            backToTopButton.style.height = '';
        }
    }
    
    backToTopButton.addEventListener('click', function() {
        // Analytics: back to top click
        trackEvent('back_to_top_click', { section: getContextSectionId(this) });
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Scroll Event Listeners
    let ticking = false;
    // Scroll analytics state
    const depthMilestones = new Set(); // 25,50,75,100
    let reachedBottom = false;
    let bottomTimestamp = 0;
    let returnedAfterBottom = false;

    function checkScrollDepthAndReturn() {
        const doc = document.documentElement;
        const scrollTop = window.pageYOffset || doc.scrollTop || 0;
        const viewport = window.innerHeight || 0;
        const fullHeight = Math.max(doc.scrollHeight, doc.offsetHeight, doc.clientHeight) || 1;
        const maxScrollable = Math.max(1, fullHeight - viewport);
        const percent = Math.min(100, Math.round((scrollTop / maxScrollable) * 100));

        [25, 50, 75, 100].forEach(mark => {
            if (percent >= mark && !depthMilestones.has(mark)) {
                depthMilestones.add(mark);
                trackEvent('scroll_depth', { percent: mark });
                if (mark === 100 && !reachedBottom) {
                    reachedBottom = true;
                    bottomTimestamp = performance.now();
                }
            }
        });

        // Detect return to top after reaching bottom
        if (reachedBottom && !returnedAfterBottom && scrollTop < 150) {
            returnedAfterBottom = true;
            const seconds = Math.max(0, (performance.now() - bottomTimestamp) / 1000);
            trackEvent('return_to_top_after_bottom', { seconds_since_bottom: Number(seconds.toFixed(2)) });
        }
    }
    
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateActiveNavigation();
                toggleBackToTopButton();
                adjustBackToTopPosition(); // Add position adjustment
                checkScrollDepthAndReturn();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', handleScroll);

    // Typing Animation for Hero Section
    function initTypingEffect() {
        const typingElement = document.getElementById('typing-text');
        if (!typingElement) return;
        
        const roles = [
            'DevOps Engineer',
            'Full Stack Developer',
            'Infrastructure Specialist',
            'Automation Expert',
            'CI/CD Specialist'
        ];
        
        let currentRoleIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;
        let typingSpeed = 150;
        
        function type() {
            const currentRole = roles[currentRoleIndex];
            
            if (isDeleting) {
                // Deleting text
                typingElement.textContent = currentRole.substring(0, currentCharIndex - 1);
                currentCharIndex--;
                typingSpeed = 75;
            } else {
                // Typing text
                typingElement.textContent = currentRole.substring(0, currentCharIndex + 1);
                currentCharIndex++;
                typingSpeed = 150;
            }
            
            // Check if word is complete
            if (!isDeleting && currentCharIndex === currentRole.length) {
                // Pause at end of word
                typingSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && currentCharIndex === 0) {
                // Move to next word
                isDeleting = false;
                currentRoleIndex = (currentRoleIndex + 1) % roles.length;
                typingSpeed = 500;
            }
            
            setTimeout(type, typingSpeed);
        }
        
        // Start typing animation after page load
        setTimeout(type, 2000);
    }

    // Parallax Effect for Hero Section
    function parallaxEffect() {
        const hero = document.getElementById('home');
        const scrolled = window.pageYOffset;
        const parallax = hero.querySelector('.relative.z-10');
        
        if (parallax) {
            parallax.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    }

    // Add parallax to scroll event
    window.addEventListener('scroll', () => {
        if (window.innerWidth > 768) { // Only on desktop
            parallaxEffect();
        }
    });

    // Skill Bar Animations
    function animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-item');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target.querySelector('[style*="width"]');
                    if (progressBar) {
                        const width = progressBar.style.width;
                        progressBar.style.width = '0%';
                        setTimeout(() => {
                            progressBar.style.transition = 'width 1.5s ease-in-out';
                            progressBar.style.width = width;
                        }, 200);
                    }
                }
            });
        }, { threshold: 0.5 });

        skillBars.forEach(bar => observer.observe(bar));
    }

    // Counter Animation for Stats
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    let current = 0;
                    const increment = target / 100;
                    
                    const updateCounter = () => {
                        if (current < target) {
                            current += increment;
                            counter.textContent = Math.ceil(current);
                            setTimeout(updateCounter, 20);
                        } else {
                            counter.textContent = target;
                        }
                    };
                    
                    updateCounter();
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    // Image Lazy Loading
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Cursor Follower Effect (Desktop Only)
    function initCursorFollower() {
        if (window.innerWidth < 768) return;
        
        const cursor = document.createElement('div');
        cursor.className = 'fixed w-4 h-4 rounded-full bg-primary dark:bg-primary-dark pointer-events-none z-50 opacity-50 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100';
        cursor.style.mixBlendMode = 'difference';
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '0.5';
        });
        
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
    }

    // Profile Image Switcher
    function initProfileImageSwitcher() {
        const profileImage = document.getElementById('profileImage');
        if (!profileImage) return;
        
        let currentImageIndex = 1; // Start with profile-1.png (index 1)
        const totalImages = 5; // profile-1.png to profile-5.png
        let isTransitioning = false;
        
        profileImage.addEventListener('click', function() {
            if (isTransitioning) return; // Prevent multiple clicks during transition
            
            isTransitioning = true;
            
            // Fade out current image with smooth transition
            profileImage.style.opacity = '0';
            
            setTimeout(() => {
                // Cycle through images: profile-1.png -> profile-2.png -> ... -> profile-5.png -> profile-1.png (repeat)
                currentImageIndex = currentImageIndex === totalImages ? 1 : currentImageIndex + 1;
                
                // Set new image source
                profileImage.src = `./assets/images/profile-${currentImageIndex}.png`;
                
                // Fade in new image
                profileImage.style.opacity = '1';
                
                // Reset transition flag after transition completes
                setTimeout(() => {
                    isTransitioning = false;
                }, 350); // Half of the transition duration
                
            }, 350); // Half of the transition duration for smooth crossfade effect
        });
        
        // Add visual feedback on hover
        profileImage.style.cursor = 'pointer';
        profileImage.title = 'Haz clic para cambiar la foto de perfil';
    }

    // Initialize all animations and effects
    setTimeout(() => {
        animateSkillBars();
        animateCounters();
        lazyLoadImages();
        initCursorFollower();
        initTypingEffect();
        initProfileImageSwitcher(); // Initialize profile image switcher
        adjustBackToTopPosition(); // Initial position adjustment
    }, 1000);

    // Resize Event Handler
    window.addEventListener('resize', () => {
        // Re-calculate positions and sizes on resize
        AOS.refresh();
        adjustBackToTopPosition(); // Adjust back to top button position
    });

    // Performance Optimization: Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.hover-lift').forEach(el => {
        animationObserver.observe(el);
    });

    // -----------------------------
    // Section View & Dwell Tracking
    // -----------------------------
    (function initSectionAnalytics(){
        const sectionViewSeen = new Set();
        const sectionTimings = new Map(); // id -> { enter: number }
        const targets = document.querySelectorAll('section[id]');

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                if (entry.isIntersecting) {
                    // First-time view at >=50%
                    if (!sectionViewSeen.has(id)) {
                        sectionViewSeen.add(id);
                        trackEvent('section_view', { section_id: id });
                    }
                    // Start dwell timer
                    if (!sectionTimings.has(id)) {
                        sectionTimings.set(id, { enter: performance.now() });
                    }
                } else {
                    // Leaving: compute dwell time if had entered
                    const t = sectionTimings.get(id);
                    if (t && typeof t.enter === 'number') {
                        const seconds = (performance.now() - t.enter) / 1000;
                        // Only send if stayed at least 2s to reduce noise
                        if (seconds >= 2) {
                            trackEvent('section_dwell', { section_id: id, seconds: Number(seconds.toFixed(2)) });
                        }
                        sectionTimings.delete(id);
                    }
                }
            });
        }, { threshold: 0.5 });

        targets.forEach(sec => io.observe(sec));
    })();

    // -----------------------------
    // Link Click Tracking
    // -----------------------------
    (function initLinkAnalytics(){
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        anchors.forEach(a => {
            a.addEventListener('click', function(){
                const { href, url, sectionId } = getLinkMeta(this);

                // Skip pure in-page nav (#...) as it's tracked separately
                if (href.startsWith('#')) return;

                // CV download
                const isDownload = this.hasAttribute('download') || /\.pdf(\?|$)/i.test(href);
                if (isDownload) {
                    const fileName = (href.split('/').pop() || '').split('?')[0];
                    trackEvent('cv_download', { file_name: fileName || 'unknown', section: sectionId });
                    return;
                }

                // Social links
                const h = href.toLowerCase();
                if (h.includes('github.com')) {
                    trackEvent('social_click', { network: 'github', href, section: sectionId });
                    return;
                }
                if (h.includes('linkedin.com')) {
                    trackEvent('social_click', { network: 'linkedin', href, section: sectionId });
                    return;
                }
                if (h.startsWith('mailto:')) {
                    trackEvent('social_click', { network: 'email', href, section: sectionId });
                    return;
                }
                if (h.startsWith('tel:')) {
                    trackEvent('social_click', { network: 'phone', href, section: sectionId });
                    return;
                }

                // External link
                if (url && url.origin !== window.location.origin) {
                    trackEvent('external_link_click', {
                        domain: url.hostname,
                        href,
                        section: sectionId
                    });
                }
            });
        });
    })();

    // Console Easter Egg
    console.log(`
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║   🚀 Portfolio de Santiago Ariel Mansfeld                     ║
    ║                                                               ║
    ║   DevOps Engineer & Full Stack Developer                      ║
    ║                                                               ║
    ║   📧 santimansfeld@proton.me                                  ║
    ║   🔗 https://github.com/smansfeldg                           ║
    ║   💼 https://www.linkedin.com/in/santiago-mansfeld/          ║
    ║                                                               ║
    ║   ¿Te gusta explorar el código? ¡Hablemos! 😊                ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
    `);

    // Page Load Performance Tracking
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`⚡ Página cargada en ${Math.round(loadTime)}ms`);
        
        // Send page load time as custom event
        trackEvent('page_load_time', { value_ms: Math.round(loadTime) });

        // Send initial user property for theme
        sendUserThemeProperty();
    });

    // Error Handling for Missing Elements
    const requiredElements = [
        'darkModeToggle',
        'darkModeToggleMobile', 
        'mobileMenuToggle',
        'mobileMenu',
        'contactForm',
        'backToTop',
        'profileImage' // Add profile image to required elements
    ];

    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ Elemento requerido no encontrado: ${id}`);
        }
    });

    // Add loading state management
    document.body.classList.remove('loading');
    
    console.log('✅ Portfolio JavaScript inicializado correctamente');
});

// Export functions for external use if needed
window.PortfolioApp = {
    // Public API methods can be added here
    toggleDarkMode: function() {
        document.getElementById('darkModeToggle').click();
    },
    
    scrollToSection: function(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
};
