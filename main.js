/* =============================================
   MARS ENGINEERING SOLUTIONS
   3D Professional Industrial Website - JavaScript
   Interactive 3D Engine, Canvas, Animations, Theme Toggle
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ========== Initialize Lucide Icons ==========
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ========== Theme Toggle ==========
    const themeToggle = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;

    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('mars-theme') || 'dark';
    htmlEl.setAttribute('data-theme', savedTheme);

    function getCurrentTheme() {
        return htmlEl.getAttribute('data-theme') || 'dark';
    }

    function toggleTheme() {
        const current = getCurrentTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', next);
        localStorage.setItem('mars-theme', next);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Get theme-aware accent & text colors
    function getThemeColors() {
        const isLight = getCurrentTheme() === 'light';
        return {
            isLight: isLight,
            accentRgb: isLight ? '234, 88, 12' : '230, 126, 34',      // Crisp Amber/Orange
            steelRgb: isLight ? '30, 41, 59' : '52, 152, 219',
            gridRgb: isLight ? '234, 88, 12' : '230, 126, 34',
            particleAlpha: isLight ? 0.35 : 0.45,
            gearAlpha: isLight ? 0.25 : 0.35,
            gridAlpha: isLight ? 0.08 : 0.05
        };
    }

    // ========== Preloader ==========
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
            }, 1200);
        });
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 2500);
    }

    // ========== FULL 3D INDUSTRIAL ENGINE CANVAS ==========
    const canvas = document.getElementById('hero-3d-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let mouseX = 0;
        let mouseY = 0;
        let targetRotX = 0;
        let targetRotY = 0;
        let rotX = 0;
        let rotY = 0;

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - width / 2) / (width / 2);
            mouseY = (e.clientY - height / 2) / (height / 2);
            targetRotY = mouseX * 0.4;
            targetRotX = -mouseY * 0.4;
        });

        // --- 3D Projection Engine Helper ---
        const FOCAL_LENGTH = 400;

        function project3D(x, y, z, rx, ry) {
            // Rotate around Y axis
            let cosY = Math.cos(ry);
            let sinY = Math.sin(ry);
            let x1 = x * cosY + z * sinY;
            let z1 = -x * sinY + z * cosY;

            // Rotate around X axis
            let cosX = Math.cos(rx);
            let sinX = Math.sin(rx);
            let y2 = y * cosX - z1 * sinX;
            let z2 = y * sinX + z1 * cosX;

            // Perspective projection
            let distance = FOCAL_LENGTH + z2 + 300;
            if (distance < 10) distance = 10;
            let scale = FOCAL_LENGTH / distance;

            return {
                screenX: width / 2 + x1 * scale,
                screenY: height / 2 + y2 * scale,
                scale: scale,
                z: z2
            };
        }

        // --- 1. 3D Floating Particles Class ---
        class Particle3D {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = (Math.random() - 0.5) * 1600;
                this.y = (Math.random() - 0.5) * 1200;
                this.z = (Math.random() - 0.5) * 800;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.vz = (Math.random() - 0.5) * 0.8;
                this.radius = Math.random() * 2 + 1;
                this.isNode = Math.random() > 0.65;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.z += this.vz;

                if (Math.abs(this.x) > 1000) this.x = -this.x;
                if (Math.abs(this.y) > 800) this.y = -this.y;
                if (Math.abs(this.z) > 500) this.z = -this.z;
            }
        }

        // Initialize 3D particles
        const numParticles = Math.min(80, Math.floor(width / 16));
        const particles3D = Array.from({ length: numParticles }, () => new Particle3D());

        // --- 2. Procedural 3D Mechanical Gear Builder ---
        function createGearGeometry(teeth, innerR, outerR, depth) {
            const vertices = [];
            const faces = [];
            const angleStep = (Math.PI * 2) / teeth;

            for (let i = 0; i < teeth; i++) {
                let a1 = i * angleStep;
                let a2 = a1 + angleStep * 0.35;
                let a3 = a1 + angleStep * 0.65;
                let a4 = a1 + angleStep;

                // Front face vertices
                vertices.push({ x: Math.cos(a1) * innerR, y: Math.sin(a1) * innerR, z: depth / 2 });
                vertices.push({ x: Math.cos(a2) * outerR, y: Math.sin(a2) * outerR, z: depth / 2 });
                vertices.push({ x: Math.cos(a3) * outerR, y: Math.sin(a3) * outerR, z: depth / 2 });
                vertices.push({ x: Math.cos(a4) * innerR, y: Math.sin(a4) * innerR, z: depth / 2 });

                // Back face vertices
                vertices.push({ x: Math.cos(a1) * innerR, y: Math.sin(a1) * innerR, z: -depth / 2 });
                vertices.push({ x: Math.cos(a2) * outerR, y: Math.sin(a2) * outerR, z: -depth / 2 });
                vertices.push({ x: Math.cos(a3) * outerR, y: Math.sin(a3) * outerR, z: -depth / 2 });
                vertices.push({ x: Math.cos(a4) * innerR, y: Math.sin(a4) * innerR, z: -depth / 2 });
            }
            return vertices;
        }

        const gear1Verts = createGearGeometry(12, 140, 180, 40);
        const gear2Verts = createGearGeometry(8, 80, 110, 30);
        let gearAngle1 = 0;
        let gearAngle2 = 0;

        // --- 3D Wireframe Box / Cube ---
        function createCubeGeometry(size) {
            const s = size / 2;
            return [
                {x:-s, y:-s, z:-s}, {x:s, y:-s, z:-s}, {x:s, y:s, z:-s}, {x:-s, y:s, z:-s},
                {x:-s, y:-s, z:s},  {x:s, y:-s, z:s},  {x:s, y:s, z:s},  {x:-s, y:s, z:s}
            ];
        }
        const cubeVerts = createCubeGeometry(120);
        const cubeEdges = [
            [0,1],[1,2],[2,3],[3,0],
            [4,5],[5,6],[6,7],[7,4],
            [0,4],[1,5],[2,6],[3,7]
        ];
        let cubeRotX = 0;
        let cubeRotY = 0;

        // --- Draw 3D Gear ---
        function draw3DGear(ctx, verts, centerX, centerY, centerZ, selfAngle, rotX, rotY, colorRgb, alpha) {
            const projected = [];
            const cosA = Math.cos(selfAngle);
            const sinA = Math.sin(selfAngle);

            for (let v of verts) {
                // Rotate gear around its own center
                let rx = v.x * cosA - v.y * sinA;
                let ry = v.x * sinA + v.y * cosA;
                let rz = v.z;

                // World position
                let wx = centerX + rx;
                let wy = centerY + ry;
                let wz = centerZ + rz;

                let p = project3D(wx, wy, wz, rotX, rotY);
                projected.push(p);
            }

            ctx.strokeStyle = `rgba(${colorRgb}, ${alpha})`;
            ctx.lineWidth = 1.2;

            // Draw front & back faces
            const half = projected.length / 2;
            ctx.beginPath();
            for (let i = 0; i < half; i++) {
                let p = projected[i];
                if (i === 0) ctx.moveTo(p.screenX, p.screenY);
                else ctx.lineTo(p.screenX, p.screenY);
            }
            ctx.closePath();
            ctx.stroke();

            ctx.beginPath();
            for (let i = half; i < projected.length; i++) {
                let p = projected[i];
                if (i === half) ctx.moveTo(p.screenX, p.screenY);
                else ctx.lineTo(p.screenX, p.screenY);
            }
            ctx.closePath();
            ctx.stroke();

            // Connect front and back
            ctx.beginPath();
            for (let i = 0; i < half; i += 2) {
                let p1 = projected[i];
                let p2 = projected[i + half];
                ctx.moveTo(p1.screenX, p1.screenY);
                ctx.lineTo(p2.screenX, p2.screenY);
            }
            ctx.stroke();
        }

        // --- Draw 3D Cube ---
        function draw3DCube(ctx, verts, edges, centerX, centerY, centerZ, rxSelf, rySelf, rotX, rotY, colorRgb, alpha) {
            const cosX = Math.cos(rxSelf), sinX = Math.sin(rxSelf);
            const cosY = Math.cos(rySelf), sinY = Math.sin(rySelf);
            const projected = [];

            for (let v of verts) {
                let x1 = v.x * cosY + v.z * sinY;
                let z1 = -v.x * sinY + v.z * cosY;
                let y2 = v.y * cosX - z1 * sinX;
                let z2 = v.y * sinX + z1 * cosX;

                let p = project3D(centerX + x1, centerY + y2, centerZ + z2, rotX, rotY);
                projected.push(p);
            }

            ctx.strokeStyle = `rgba(${colorRgb}, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let e of edges) {
                let p1 = projected[e[0]];
                let p2 = projected[e[1]];
                ctx.moveTo(p1.screenX, p1.screenY);
                ctx.lineTo(p2.screenX, p2.screenY);
            }
            ctx.stroke();
        }

        // --- Draw 3D Perspective Grid ---
        function draw3DGrid(ctx, rotX, rotY, colorRgb, alpha) {
            const gridSize = 120;
            const lines = 12;
            const yPos = 250;

            ctx.strokeStyle = `rgba(${colorRgb}, ${alpha})`;
            ctx.lineWidth = 0.8;

            ctx.beginPath();
            // Parallel lines along Z
            for (let i = -lines; i <= lines; i++) {
                let x = i * gridSize;
                let p1 = project3D(x, yPos, -600, rotX, rotY);
                let p2 = project3D(x, yPos, 600, rotX, rotY);
                ctx.moveTo(p1.screenX, p1.screenY);
                ctx.lineTo(p2.screenX, p2.screenY);
            }

            // Cross lines along X
            for (let j = -5; j <= 5; j++) {
                let z = j * gridSize;
                let p1 = project3D(-lines * gridSize, yPos, z, rotX, rotY);
                let p2 = project3D(lines * gridSize, yPos, z, rotX, rotY);
                ctx.moveTo(p1.screenX, p1.screenY);
                ctx.lineTo(p2.screenX, p2.screenY);
            }
            ctx.stroke();
        }

        // --- Main Render Loop ---
        function render3D() {
            ctx.clearRect(0, 0, width, height);

            // Smooth rotation interpolation
            rotX += (targetRotX - rotX) * 0.05;
            rotY += (targetRotY - rotY) * 0.05;

            gearAngle1 += 0.008;
            gearAngle2 -= 0.012;
            cubeRotX += 0.006;
            cubeRotY += 0.009;

            const tc = getThemeColors();

            // 1. Render 3D Perspective Grid
            draw3DGrid(ctx, rotX, rotY, tc.gridRgb, tc.gridAlpha);

            // 2. Render 3D Gears
            draw3DGear(ctx, gear1Verts, -280, -60, -100, gearAngle1, rotX, rotY, tc.accentRgb, tc.gearAlpha);
            draw3DGear(ctx, gear2Verts, 320, 100, -50, gearAngle2, rotX, rotY, tc.accentRgb, tc.gearAlpha * 0.85);

            // 3. Render 3D Floating Structure Cube
            draw3DCube(ctx, cubeVerts, cubeEdges, 260, -160, 50, cubeRotX, cubeRotY, rotX, rotY, tc.steelRgb, tc.gearAlpha * 0.7);

            // 4. Render 3D Particles & Node Connections
            const screenParticles = [];
            for (let p of particles3D) {
                p.update();
                let proj = project3D(p.x, p.y, p.z, rotX, rotY);
                screenParticles.push(proj);

                // Draw Particle
                let size = p.radius * proj.scale;
                ctx.beginPath();
                ctx.arc(proj.screenX, proj.screenY, Math.max(0.5, size), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${tc.accentRgb}, ${tc.particleAlpha * proj.scale})`;
                ctx.fill();

                if (p.isNode) {
                    ctx.beginPath();
                    ctx.arc(proj.screenX, proj.screenY, size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${tc.accentRgb}, ${tc.particleAlpha * 0.15 * proj.scale})`;
                    ctx.fill();
                }
            }

            // Draw 3D Connection Lines
            ctx.lineWidth = 0.6;
            for (let i = 0; i < screenParticles.length; i++) {
                for (let j = i + 1; j < screenParticles.length; j++) {
                    let p1 = screenParticles[i];
                    let p2 = screenParticles[j];

                    let dx = p1.screenX - p2.screenX;
                    let dy = p1.screenY - p2.screenY;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 130) {
                        let lineAlpha = (1 - dist / 130) * 0.18 * ((p1.scale + p2.scale) / 2);
                        ctx.beginPath();
                        ctx.moveTo(p1.screenX, p1.screenY);
                        ctx.lineTo(p2.screenX, p2.screenY);
                        ctx.strokeStyle = `rgba(${tc.accentRgb}, ${lineAlpha})`;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(render3D);
        }

        render3D();
    }

    // ========== Navbar Scroll Effect ==========
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    function handleScroll() {
        const scrollY = window.scrollY;

        if (navbar) {
            if (scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        if (backToTop) {
            if (scrollY > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Active nav link update
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

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ========== Mobile Navigation ==========
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

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
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;

            const glowX = (x / rect.width) * 100;
            const glowY = (y / rect.height) * 100;
            card.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, var(--accent-surface) 0%, var(--bg-card-solid) 65%)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            card.style.background = '';
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
            const rotateX = (y - centerY) / 18;
            const rotateY = (centerX - x) / 18;

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
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    // ========== Parallax Effect ==========
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const patterns = document.querySelectorAll('.section-industrial-bg');
        patterns.forEach(pattern => {
            const section = pattern.parentElement;
            if (section) {
                const sectionTop = section.offsetTop;
                const offset = (scrollY - sectionTop) * 0.03;
                pattern.style.transform = `translateY(${offset}px)`;
            }
        });

        const heroBg = document.querySelector('.hero-bg-image');
        if (heroBg && scrollY < window.innerHeight) {
            heroBg.style.transform = `scale(${1.02 + scrollY * 0.0001}) translateY(${scrollY * 0.12}px)`;
        }
    });

    // ========== Smooth Scroll ==========
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

    // ========== Hero Badge Typing Animation ==========
    const heroTypedText = document.getElementById('hero-typed-text');
    if (heroTypedText) {
        const texts = [
            'Trusted Engineering Partner',
            'Quality & Safety First',
            'Complete Industrial Engineering',
            'Tamil Nadu\'s Industry Leader'
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
                typingSpeed = 35;
            } else {
                heroTypedText.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 75;
            }

            if (!isDeleting && charIndex === currentText.length) {
                isDeleting = true;
                typingSpeed = 2200;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typingSpeed = 400;
            }

            setTimeout(typeEffect, typingSpeed);
        }

        setTimeout(typeEffect, 2500);
    }

    // ========== Services Heading Running Words Animation ==========
    const servicesRunningText = document.getElementById('services-running-text');
    if (servicesRunningText) {
        const trustPhrases = [
            '100% Certified Safety',
            'Zero Downtime Execution',
            'On-Time Project Delivery',
            'Turnkey Industrial Quality',
            '24/7 Dedicated Support',
            '500+ Projects Completed'
        ];
        let phraseIndex = 0;
        let charIdx = 0;
        let isDeletingPhrase = false;
        let pSpeed = 80;

        function typeServicesText() {
            const currentPhrase = trustPhrases[phraseIndex];

            if (isDeletingPhrase) {
                servicesRunningText.textContent = currentPhrase.substring(0, charIdx - 1);
                charIdx--;
                pSpeed = 35;
            } else {
                servicesRunningText.textContent = currentPhrase.substring(0, charIdx + 1);
                charIdx++;
                pSpeed = 75;
            }

            if (!isDeletingPhrase && charIdx === currentPhrase.length) {
                isDeletingPhrase = true;
                pSpeed = 2400;
            } else if (isDeletingPhrase && charIdx === 0) {
                isDeletingPhrase = false;
                phraseIndex = (phraseIndex + 1) % trustPhrases.length;
                pSpeed = 400;
            }

            setTimeout(typeServicesText, pSpeed);
        }

        setTimeout(typeServicesText, 1000);
    }

    // ========== Contact Form Handler ==========
    const contactForm = document.getElementById('contact-form');

    function stripTags(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.textContent.trim();
    }

    const validators = {
        name: {
            regex: /^[A-Za-z\s.'\\-]{2,100}$/,
            message: 'Please enter a valid name (2–100 letters).'
        },
        phone: {
            regex: /^[+]?[0-9\s\\-]{10,15}$/,
            message: 'Please enter a valid phone number (10–15 digits).'
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

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAllErrors();

            const honeypot = document.getElementById('form-website');
            if (honeypot && honeypot.value.trim() !== '') {
                showFakeSuccess();
                return;
            }

            const formData = new FormData(contactForm);
            const rawData = Object.fromEntries(formData);
            delete rawData.website;

            const data = {};
            for (const key in rawData) {
                data[key] = stripTags(rawData[key]);
            }

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

            const submitBtn = document.getElementById('form-submit');
            const btnText = submitBtn.querySelector('span');
            const btnIcon = submitBtn.querySelector('.btn-icon');
            const originalText = btnText.textContent;

            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
            btnText.textContent = 'Sending...';
            if (btnIcon) btnIcon.style.display = 'none';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.success) {
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
                showErrorMessage('Unable to connect to server. Please try again.');
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
                btnText.textContent = originalText;
                if (btnIcon) btnIcon.style.display = '';
            }
        });
    }

    function showSuccessMessage(safeName, serverMessage) {
        const formWrap = contactForm.parentElement;
        contactForm.style.display = 'none';

        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'form-success-icon';
        iconDiv.innerHTML = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
        successDiv.appendChild(iconDiv);

        const h3 = document.createElement('h3');
        h3.textContent = 'Message Sent!';
        successDiv.appendChild(h3);

        const p = document.createElement('p');
        p.textContent = serverMessage || `Thank you, ${safeName}! We'll contact you within 24 hours.`;
        successDiv.appendChild(p);

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
        successDiv.innerHTML = `<h3>Message Sent!</h3><p>Thank you for reaching out! We'll get back to you soon.</p>`;
        formWrap.appendChild(successDiv);
    }

    // ========== Magnetic Contact Icons ==========
    const contactIcons = document.querySelectorAll('.contact-item-icon');
    contactIcons.forEach(icon => {
        icon.addEventListener('mousemove', (e) => {
            const rect = icon.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            icon.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px) scale(1.1)`;
        });
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = '';
        });
    });

    // ========== 3D Tilt Effect for Review Cards ==========
    function applyReviewCardTilt(card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;

            const glowX = (x / rect.width) * 100;
            const glowY = (y / rect.height) * 100;
            card.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, var(--accent-surface) 0%, var(--bg-card-solid) 65%)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            card.style.background = '';
        });
    }

    document.querySelectorAll('.review-card').forEach(applyReviewCardTilt);

    // ========== Interactive Star Rating Picker ==========
    const ratingPicker = document.getElementById('rating-picker');
    const reviewRatingInput = document.getElementById('review-rating');
    const ratingLabelText = document.getElementById('rating-label-text');

    const ratingDescriptions = {
        1: '1.0 / 5 Stars (Poor)',
        2: '2.0 / 5 Stars (Fair)',
        3: '3.0 / 5 Stars (Good)',
        4: '4.0 / 5 Stars (Very Good)',
        5: '5.0 / 5 Stars (Excellent)'
    };

    if (ratingPicker && reviewRatingInput) {
        const starBtns = ratingPicker.querySelectorAll('.star-btn');

        function updateStarUI(val) {
            starBtns.forEach(btn => {
                const btnVal = parseInt(btn.getAttribute('data-value'));
                if (btnVal <= val) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            if (ratingLabelText) {
                ratingLabelText.textContent = ratingDescriptions[val] || `${val}.0 / 5 Stars`;
            }
        }

        starBtns.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                const val = parseInt(btn.getAttribute('data-value'));
                starBtns.forEach(b => {
                    const bVal = parseInt(b.getAttribute('data-value'));
                    if (bVal <= val) b.classList.add('hover-active');
                    else b.classList.remove('hover-active');
                });
            });

            btn.addEventListener('mouseleave', () => {
                starBtns.forEach(b => b.classList.remove('hover-active'));
            });

            btn.addEventListener('click', () => {
                const val = parseInt(btn.getAttribute('data-value'));
                reviewRatingInput.value = val;
                updateStarUI(val);
            });
        });
    }

    // ========== Review Form & Storage Handler ==========
    const reviewForm = document.getElementById('review-form');
    const reviewsGrid = document.getElementById('reviews-grid');
    const totalReviewsCount = document.getElementById('total-reviews-count');

    function getInitials(name) {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    function getStarString(rating) {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }

    function renderReviewCard(rev, isNew = true) {
        if (!reviewsGrid) return;

        const card = document.createElement('div');
        card.className = 'review-card animate-on-scroll visible';

        const initials = getInitials(rev.name);
        const stars = getStarString(parseInt(rev.rating));

        card.innerHTML = `
            <div class="review-card-top">
                <div class="reviewer-avatar avatar-custom">${initials}</div>
                <div class="reviewer-meta">
                    <h4>${escapeHtml(rev.name)}</h4>
                    <span class="reviewer-role">${escapeHtml(rev.company)}</span>
                </div>
                <div class="review-badge"><i data-lucide="shield-check"></i> Verified Client</div>
            </div>
            <div class="review-stars-display">
                <span class="stars-gold">${stars}</span>
                <span class="rating-num">${parseFloat(rev.rating).toFixed(1)}</span>
            </div>
            <h5 class="review-title">"${escapeHtml(rev.headline)}"</h5>
            <p class="review-text">"${escapeHtml(rev.comment)}"</p>
            <div class="review-footer">
                <span class="review-service"><i data-lucide="check-circle-2"></i> ${escapeHtml(rev.service)}</span>
                <span class="review-date">${rev.date || 'Just now'}</span>
            </div>
        `;

        reviewsGrid.insertBefore(card, reviewsGrid.firstChild);
        applyReviewCardTilt(card);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function loadSavedReviews() {
        try {
            const saved = JSON.parse(localStorage.getItem('mars-user-reviews') || '[]');
            if (totalReviewsCount) {
                totalReviewsCount.textContent = (98 + saved.length) + '+';
            }

            saved.forEach(rev => {
                renderReviewCard(rev, false);
            });
        } catch (err) {}
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    loadSavedReviews();

    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('review-name');
            const companyInput = document.getElementById('review-company');
            const serviceInput = document.getElementById('review-service');
            const headlineInput = document.getElementById('review-headline');
            const commentInput = document.getElementById('review-comment');
            const ratingVal = document.getElementById('review-rating').value;

            let valid = true;

            if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
                document.getElementById('error-review-name').textContent = 'Please enter your name.';
                valid = false;
            } else {
                document.getElementById('error-review-name').textContent = '';
            }

            if (!companyInput.value.trim() || companyInput.value.trim().length < 2) {
                document.getElementById('error-review-company').textContent = 'Please enter your company or designation.';
                valid = false;
            } else {
                document.getElementById('error-review-company').textContent = '';
            }

            if (!serviceInput.value) {
                document.getElementById('error-review-service').textContent = 'Please select a service.';
                valid = false;
            } else {
                document.getElementById('error-review-service').textContent = '';
            }

            if (!headlineInput.value.trim() || headlineInput.value.trim().length < 5) {
                document.getElementById('error-review-headline').textContent = 'Please enter a headline.';
                valid = false;
            } else {
                document.getElementById('error-review-headline').textContent = '';
            }

            if (!commentInput.value.trim() || commentInput.value.trim().length < 10) {
                document.getElementById('error-review-comment').textContent = 'Please enter your detailed feedback (at least 10 characters).';
                valid = false;
            } else {
                document.getElementById('error-review-comment').textContent = '';
            }

            if (!valid) return;

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            const newReview = {
                id: Date.now(),
                name: nameInput.value.trim(),
                company: companyInput.value.trim(),
                service: serviceInput.value,
                headline: headlineInput.value.trim(),
                comment: commentInput.value.trim(),
                rating: ratingVal,
                date: dateStr
            };

            let saved = [];
            try {
                saved = JSON.parse(localStorage.getItem('mars-user-reviews') || '[]');
            } catch (err) {}

            saved.unshift(newReview);
            try {
                localStorage.setItem('mars-user-reviews', JSON.stringify(saved));
            } catch (err) {}

            renderReviewCard(newReview, true);

            if (totalReviewsCount) {
                totalReviewsCount.textContent = (98 + saved.length) + '+';
            }

            reviewForm.reset();
            if (ratingPicker) {
                document.getElementById('review-rating').value = '5';
                const starBtns = ratingPicker.querySelectorAll('.star-btn');
                starBtns.forEach(b => b.classList.add('active'));
                if (ratingLabelText) ratingLabelText.textContent = '5.0 / 5 Stars (Excellent)';
            }

            const submitBtn = document.getElementById('review-submit-btn');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span><i data-lucide="check-circle-2"></i> Review Published!</span>`;
            submitBtn.style.background = '#22c55e';
            if (typeof lucide !== 'undefined') lucide.createIcons();

            setTimeout(() => {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.style.background = '';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 4000);
        });
    }

});
