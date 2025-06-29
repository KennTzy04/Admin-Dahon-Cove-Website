// Public Website JavaScript
let siteSettings = {};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadAllContent();
    setupScrollAnimations();
});

// Load all content from Firebase
async function loadAllContent() {
    try {
        await Promise.all([
            loadSettings(),
            loadGallery(),
            loadPackages(),
            loadTestimonials()
        ]);
    } catch (error) {
        console.error('Error loading content:', error);
        showError('Failed to load content. Please try again later.');
    }
}

// Load site settings
async function loadSettings() {
    try {
        const doc = await db.collection('siteSettings').doc('main').get();
        if (doc.exists) {
            siteSettings = doc.data();
            updateSiteContent();
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Update site content based on settings
function updateSiteContent() {
    // Update page title
    if (siteSettings.siteTitle) {
        document.title = siteSettings.siteTitle;
        const navbarBrand = document.querySelector('.navbar-brand');
        if (navbarBrand) {
            navbarBrand.innerHTML = `<i class="bi bi-tree"></i> ${siteSettings.siteTitle}`;
        }
    }
    
    // Update about section
    const aboutContent = document.getElementById('aboutContent');
    if (aboutContent && siteSettings.aboutSection) {
        aboutContent.innerHTML = `
            <div class="col-md-8 mx-auto">
                <p class="lead">${siteSettings.aboutSection}</p>
            </div>
        `;
    }
    
    // Update contact section
    const contactContent = document.getElementById('contactContent');
    if (contactContent) {
        let contactHTML = '<div class="col-md-8 mx-auto">';
        
        if (siteSettings.contactEmail) {
            contactHTML += `
                <div class="contact-info mb-4">
                    <i class="bi bi-envelope"></i>
                    <h5>Email</h5>
                    <p><a href="mailto:${siteSettings.contactEmail}">${siteSettings.contactEmail}</a></p>
                </div>
            `;
        }
        
        if (siteSettings.contactPhone) {
            contactHTML += `
                <div class="contact-info mb-4">
                    <i class="bi bi-telephone"></i>
                    <h5>Phone</h5>
                    <p><a href="tel:${siteSettings.contactPhone}">${siteSettings.contactPhone}</a></p>
                </div>
            `;
        }
        
        if (siteSettings.contactAddress) {
            contactHTML += `
                <div class="contact-info mb-4">
                    <i class="bi bi-geo-alt"></i>
                    <h5>Address</h5>
                    <p>${siteSettings.contactAddress}</p>
                </div>
            `;
        }
        
        contactHTML += '</div>';
        contactContent.innerHTML = contactHTML;
    }
}

// Load gallery images
async function loadGallery() {
    try {
        const snapshot = await db.collection('gallery').orderBy('uploadedAt', 'desc').limit(12).get();
        const galleryContent = document.getElementById('galleryContent');
        
        if (snapshot.empty) {
            galleryContent.innerHTML = '<div class="col-12 text-center"><p>No images available yet.</p></div>';
            return;
        }
        
        let galleryHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            galleryHTML += `
                <div class="col-md-4 col-lg-3">
                    <div class="gallery-item">
                        <img src="${data.imageUrl}" alt="${data.title || 'Gallery Image'}" class="img-fluid">
                        ${data.title ? `<div class="p-2 text-center"><strong>${data.title}</strong></div>` : ''}
                        ${data.description ? `<div class="px-2 pb-2 text-muted small text-center">${data.description}</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        galleryContent.innerHTML = galleryHTML;
    } catch (error) {
        console.error('Error loading gallery:', error);
        document.getElementById('galleryContent').innerHTML = '<div class="col-12 text-center"><p>Error loading gallery.</p></div>';
    }
}

// Load packages
async function loadPackages() {
    try {
        const snapshot = await db.collection('packages').orderBy('order', 'asc').get();
        const packagesContent = document.getElementById('packagesContent');
        
        if (snapshot.empty) {
            packagesContent.innerHTML = '<div class="col-12 text-center"><p>No packages available yet.</p></div>';
            return;
        }
        
        let packagesHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            packagesHTML += `
                <div class="col-md-6 col-lg-4">
                    <div class="package-card card h-100">
                        <div class="card-header text-center">
                            <h5 class="mb-0">${data.name}</h5>
                        </div>
                        <div class="card-body text-center">
                            <div class="package-price mb-3">${data.price}</div>
                            <ul class="feature-list">
                                ${data.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="card-footer text-center">
                            <button class="btn btn-primary" onclick="contactUs()">Book Now</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        packagesContent.innerHTML = packagesHTML;
    } catch (error) {
        console.error('Error loading packages:', error);
        document.getElementById('packagesContent').innerHTML = '<div class="col-12 text-center"><p>Error loading packages.</p></div>';
    }
}

// Load testimonials
async function loadTestimonials() {
    try {
        const snapshot = await db.collection('testimonials').orderBy('order', 'asc').limit(6).get();
        const testimonialsContent = document.getElementById('testimonialsContent');
        
        if (snapshot.empty) {
            testimonialsContent.innerHTML = '<div class="col-12 text-center"><p>No testimonials available yet.</p></div>';
            return;
        }
        
        let testimonialsHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            testimonialsHTML += `
                <div class="col-md-6 col-lg-4">
                    <div class="testimonial-card card h-100">
                        <div class="card-body text-center">
                            ${data.imageUrl ? 
                                `<img src="${data.imageUrl}" alt="${data.name}" class="testimonial-avatar mb-3">` : 
                                `<div class="testimonial-avatar mb-3 bg-secondary d-flex align-items-center justify-content-center text-white mx-auto">${data.name.charAt(0).toUpperCase()}</div>`
                            }
                            <h6 class="mb-2">${data.name}</h6>
                            <p class="testimonial-text">"${data.text}"</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        testimonialsContent.innerHTML = testimonialsHTML;
    } catch (error) {
        console.error('Error loading testimonials:', error);
        document.getElementById('testimonialsContent').innerHTML = '<div class="col-12 text-center"><p>Error loading testimonials.</p></div>';
    }
}

// Setup scroll animations
function setupScrollAnimations() {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Contact us function
function contactUs() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Show error message
function showError(message) {
    // Create a simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3';
    errorDiv.style.zIndex = '9999';
    errorDiv.innerHTML = message;
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading states
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="text-center"><div class="loading"></div><p>Loading...</p></div>';
    }
}

// Initialize the website
console.log('Dahon Cove website initialized');
