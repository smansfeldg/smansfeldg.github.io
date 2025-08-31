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
    function toggleDarkMode() {
        htmlElement.classList.toggle('dark');
        const isDark = htmlElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Add transition effect
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
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
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Scroll Event Listeners
    let ticking = false;
    
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateActiveNavigation();
                toggleBackToTopButton();
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

    // Initialize all animations and effects
    setTimeout(() => {
        animateSkillBars();
        animateCounters();
        lazyLoadImages();
        initCursorFollower();
        initTypingEffect();
    }, 1000);

    // Resize Event Handler
    window.addEventListener('resize', () => {
        // Re-calculate positions and sizes on resize
        AOS.refresh();
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
        
        // Optional: Send analytics if needed
        // gtag('event', 'page_load_time', {
        //     value: Math.round(loadTime)
        // });
    });

    // Error Handling for Missing Elements
    const requiredElements = [
        'darkModeToggle',
        'darkModeToggleMobile', 
        'mobileMenuToggle',
        'mobileMenu',
        'contactForm',
        'backToTop'
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
