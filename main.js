/* =============================================
   MARS ENGINEERING SOLUTIONS
   3D Professional Industrial Website - JavaScript
   Animations, 3D Canvas, Interactions
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ========== Initialize Lucide Icons ==========
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ========== Preloader ==========
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 1800);
    });
    // Fallback
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 3500);

    // ========== 3D Industrial Particle Canvas ==========
    const canvas = document.getElementById('hero-3d-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseX = 0, mouseY = 0;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Industrial grid particles - look like blueprint dots and connection lines
        class IndustrialParticle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.4 + 0.05;
                this.type = Math.random() > 0.7 ? 'square' : 'circle'; // industrial shapes
                this.pulsePhase = Math.random() * Math.PI * 2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Pulse
                this.currentOpacity = this.opacity + Math.sin(Date.now() * 0.002 + this.pulsePhase) * 0.1;

                // Wrap around
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;

                // Mouse repulsion
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    this.x -= dx * force * 0.008;
                    this.y -= dy * force * 0.008;
                }
            }

            draw() {
                const alpha = Math.max(0, this.currentOpacity);

                if (this.type === 'square') {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(Date.now() * 0.001 + this.pulsePhase);
                    ctx.fillStyle = `rgba(230, 126, 34, ${alpha})`;
                    ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
                    ctx.restore();
                } else {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(230, 126, 34, ${alpha})`;
                    ctx.fill();
                }

                // Glow
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(230, 126, 34, ${alpha * 0.08})`;
                ctx.fill();
            }
        }

        // Initialize particles
        const particleCount = Math.min(60, Math.floor(window.innerWidth / 20));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new IndustrialParticle());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 140) {
                        const opacity = (1 - dist / 140) * 0.08;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(230, 126, 34, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        // Draw industrial grid overlay
        function drawIndustrialGrid() {
            const gridSize = 80;
            const scrollOffset = (Date.now() * 0.01) % gridSize;

            ctx.strokeStyle = 'rgba(230, 126, 34, 0.015)';
            ctx.lineWidth = 0.5;

            // Vertical lines
            for (let x = -scrollOffset; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            // Horizontal lines
            for (let y = -scrollOffset; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Grid intersections - small crosses
            ctx.strokeStyle = 'rgba(230, 126, 34, 0.04)';
            for (let x = -scrollOffset; x < canvas.width; x += gridSize) {
                for (let y = -scrollOffset; y < canvas.height; y += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(x - 4, y);
                    ctx.lineTo(x + 4, y);
                    ctx.moveTo(x, y - 4);
                    ctx.lineTo(x, y + 4);
                    ctx.stroke();
                }
            }
        }

        function animate3D() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawIndustrialGrid();

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            drawConnections();
            requestAnimationFrame(animate3D);
        }
        animate3D();
    }

    // ========== Navbar Scroll Effect ==========
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    function handleScroll() {
        const scrollY = window.scrollY;

        // Navbar background
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button
        if (scrollY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Active nav link
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Back to top click
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ========== Mobile Navigation ==========
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // ========== Scroll Animations (Intersection Observer) ==========
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => {
        observer.observe(el);
    });

    // ========== Counter Animation ==========
    const statNumbers = document.querySelectorAll('.stat-number');
    let counterAnimated = false;

    function animateCounters() {
        if (counterAnimated) return;

        const statsSection = document.querySelector('.hero-stats');
        if (!statsSection) return;

        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            counterAnimated = true;

            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                const duration = 2000;
                const startTime = Date.now();

                function updateCounter() {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(eased * target);

                    stat.textContent = current;

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        stat.textContent = target;
                    }
                }

                updateCounter();
            });
        }
    }

    window.addEventListener('scroll', animateCounters);
    animateCounters();

    // ========== 3D Tilt Effect for Service Cards ==========
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    // ========== 3D Tilt Effect for Project Cards ==========
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    // ========== 3D Tilt for Why Cards ==========
    const whyCards = document.querySelectorAll('.why-card');

    whyCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 30;
            const rotateY = (centerX - x) / 30;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    // ========== Parallax Effect for Section Backgrounds ==========
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const patterns = document.querySelectorAll('.section-industrial-bg');
        patterns.forEach(pattern => {
            const section = pattern.parentElement;
            const sectionTop = section.offsetTop;
            const offset = (scrollY - sectionTop) * 0.03;
            pattern.style.transform = `translateY(${offset}px)`;
        });

        // Parallax for hero image
        const heroBg = document.querySelector('.hero-bg-image');
        if (heroBg && scrollY < window.innerHeight) {
            heroBg.style.transform = `scale(${1.05 + scrollY * 0.0001}) translateY(${scrollY * 0.15}px)`;
        }
    });

    // ========== Smooth Scroll for Links ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== Typing Effect for Hero Badge ==========
    const heroTypedText = document.getElementById('hero-typed-text');
    if (heroTypedText) {
        const texts = [
            'Trusted Engineering Partner',
            'Quality & Safety First',
            'Complete Engineering Solutions',
            'Tamil Nadu\'s Best'
        ];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 80;

        function typeEffect() {
            const currentText = texts[textIndex];

            if (isDeleting) {
                heroTypedText.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 40;
            } else {
                heroTypedText.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 80;
            }

            if (!isDeleting && charIndex === currentText.length) {
                isDeleting = true;
                typingSpeed = 2500; // Pause at end
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typingSpeed = 500;
            }

            setTimeout(typeEffect, typingSpeed);
        }

        // Start typing after hero loads
        setTimeout(typeEffect, 3000);
    }

    // ========== Secure Contact Form Handler ==========
    const contactForm = document.getElementById('contact-form');

    // --- Utility: Strip HTML tags ---
    function stripTags(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.textContent.trim();
    }

    // --- Validation Rules ---
    const validators = {
        name: {
            regex: /^[A-Za-z\s.'\\-]{2,100}$/,
            message: 'Please enter a valid name (2–100 letters, spaces, hyphens, or dots only).'
        },
        phone: {
            regex: /^[+]?[0-9\s\\-]{10,15}$/,
            message: 'Please enter a valid phone number (10–15 digits, may start with +).'
        },
        email: {
            regex: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
            message: 'Please enter a valid email address.'
        },
        service: {
            validate: (val) => val !== '' && val !== null && val !== undefined,
            message: 'Please select a service.'
        },
        message: {
            validate: (val) => val && val.trim().length >= 10 && val.trim().length <= 2000,
            message: 'Please enter a message (10–2000 characters).'
        }
    };

    // --- Validate a single field ---
    function validateField(name, value) {
        const rule = validators[name];
        if (!rule) return { valid: true };

        const cleanValue = stripTags(value);
        let isValid;

        if (rule.regex) {
            isValid = rule.regex.test(cleanValue);
        } else if (rule.validate) {
            isValid = rule.validate(cleanValue);
        }

        return { valid: isValid, message: isValid ? '' : rule.message };
    }

    // --- Show/clear error for a field ---
    function showFieldError(fieldName, message) {
        const errorEl = document.getElementById(`error-${fieldName}`);
        const inputEl = document.getElementById(`form-${fieldName}`);
        if (errorEl) errorEl.textContent = message;
        if (inputEl) {
            if (message) {
                inputEl.classList.add('input-error');
                inputEl.setAttribute('aria-invalid', 'true');
            } else {
                inputEl.classList.remove('input-error');
                inputEl.removeAttribute('aria-invalid');
            }
        }
    }

    function clearAllErrors() {
        ['name', 'phone', 'email', 'service', 'message'].forEach(f => showFieldError(f, ''));
    }

    // --- Real-time validation on blur ---
    ['name', 'phone', 'email', 'service', 'message'].forEach(fieldName => {
        const el = document.getElementById(`form-${fieldName}`);
        if (el) {
            const eventName = el.tagName === 'SELECT' ? 'change' : 'blur';
            el.addEventListener(eventName, () => {
                const result = validateField(fieldName, el.value);
                showFieldError(fieldName, result.valid ? '' : result.message);
            });
            el.addEventListener('input', () => {
                showFieldError(fieldName, '');
            });
        }
    });

    // --- Rate Limiting ---
    const submissionTimestamps = [];
    const MAX_SUBMISSIONS = 3;
    const RATE_WINDOW_MS = 5 * 60 * 1000;

    function isRateLimited() {
        const now = Date.now();
        while (submissionTimestamps.length > 0 && now - submissionTimestamps[0] > RATE_WINDOW_MS) {
            submissionTimestamps.shift();
        }
        return submissionTimestamps.length >= MAX_SUBMISSIONS;
    }

    // --- Form Submit Handler ---
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();

        // 1. Honeypot check
        const honeypot = document.getElementById('form-website');
        if (honeypot && honeypot.value.trim() !== '') {
            showFakeSuccess();
            return;
        }

        // 2. Client-side rate limiting
        if (isRateLimited()) {
            const rateLimitMsg = document.createElement('div');
            rateLimitMsg.className = 'form-rate-limit';
            rateLimitMsg.textContent = 'Too many submissions. Please wait a few minutes before trying again.';
            const existing = contactForm.querySelector('.form-rate-limit');
            if (existing) existing.remove();
            contactForm.insertBefore(rateLimitMsg, document.getElementById('form-submit'));
            setTimeout(() => rateLimitMsg.remove(), 5000);
            return;
        }

        // 3. Collect and sanitize form data
        const formData = new FormData(contactForm);
        const rawData = Object.fromEntries(formData);
        delete rawData.website;

        const data = {};
        for (const key in rawData) {
            data[key] = stripTags(rawData[key]);
        }

        // 4. Client-side validation
        let hasErrors = false;
        for (const fieldName of ['name', 'phone', 'email', 'service', 'message']) {
            const result = validateField(fieldName, data[fieldName]);
            if (!result.valid) {
                showFieldError(fieldName, result.message);
                hasErrors = true;
            }
        }

        if (hasErrors) {
            const firstError = contactForm.querySelector('.input-error');
            if (firstError) firstError.focus();
            return;
        }

        // 5. Show loading state
        const submitBtn = document.getElementById('form-submit');
        const btnText = submitBtn.querySelector('span');
        const btnIcon = submitBtn.querySelector('.btn-icon');
        const originalText = btnText.textContent;

        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');
        btnText.textContent = 'Sending...';
        if (btnIcon) btnIcon.style.display = 'none';

        try {
            // 6. POST to backend API
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                submissionTimestamps.push(Date.now());
                showSuccessMessage(data.name, result.message);
            } else if (result.errors) {
                result.errors.forEach(err => {
                    showFieldError(err.field, err.message);
                });
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
                btnText.textContent = originalText;
                if (btnIcon) btnIcon.style.display = '';
            } else {
                showErrorMessage(result.message || 'Something went wrong. Please try again.');
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
                btnText.textContent = originalText;
                if (btnIcon) btnIcon.style.display = '';
            }

        } catch (networkError) {
            console.error('Network error:', networkError);
            showErrorMessage('Unable to connect to the server. Please check your internet connection or try again later.');
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
            btnText.textContent = originalText;
            if (btnIcon) btnIcon.style.display = '';
        }
    });

    function showSuccessMessage(safeName, serverMessage) {
        const formWrap = contactForm.parentElement;
        contactForm.style.display = 'none';

        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'form-success-icon';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '36');
        svg.setAttribute('height', '36');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', '20 6 9 17 4 12');
        svg.appendChild(polyline);
        iconDiv.appendChild(svg);
        successDiv.appendChild(iconDiv);

        const h3 = document.createElement('h3');
        h3.textContent = 'Message Sent!';
        successDiv.appendChild(h3);

        const p = document.createElement('p');
        p.textContent = serverMessage || `Thank you for reaching out, ${safeName}! We'll get back to you within 24 hours.`;
        successDiv.appendChild(p);

        const lockNote = document.createElement('p');
        lockNote.className = 'form-success-secure';
        lockNote.textContent = '🔒 Your information has been submitted securely.';
        successDiv.appendChild(lockNote);

        formWrap.appendChild(successDiv);
    }

    function showErrorMessage(message) {
        const existing = contactForm.querySelector('.form-server-error');
        if (existing) existing.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-server-error';
        errorDiv.textContent = message;
        contactForm.insertBefore(errorDiv, document.getElementById('form-submit'));
        setTimeout(() => errorDiv.remove(), 8000);
    }

    function showFakeSuccess() {
        const formWrap = contactForm.parentElement;
        contactForm.style.display = 'none';

        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        const h3 = document.createElement('h3');
        h3.textContent = 'Message Sent!';
        successDiv.appendChild(h3);
        const p = document.createElement('p');
        p.textContent = 'Thank you for reaching out! We\'ll get back to you soon.';
        successDiv.appendChild(p);
        formWrap.appendChild(successDiv);
    }

    // ========== Add Ripple Effect to Buttons ==========
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.25);
                border-radius: 50%;
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out forwards;
                pointer-events: none;
            `;

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // ========== About Image Stack 3D Hover ==========
    const aboutStack = document.querySelector('.about-image-stack');
    if (aboutStack) {
        aboutStack.addEventListener('mousemove', (e) => {
            const rect = aboutStack.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            const cards = aboutStack.querySelectorAll('.about-img-card');
            cards.forEach((card, i) => {
                const depth = (3 - i) * 8;
                const rotateX = y * -8;
                const rotateY = x * 8;
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${depth}px)`;
            });
        });

        aboutStack.addEventListener('mouseleave', () => {
            const cards = aboutStack.querySelectorAll('.about-img-card');
            cards[0].style.transform = 'rotate(-5deg) translateZ(30px)';
            cards[1].style.transform = 'rotate(3deg) translateZ(20px)';
            cards[2].style.transform = 'rotate(-2deg) translateZ(10px)';
        });
    }

});
