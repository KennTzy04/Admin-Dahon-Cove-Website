// Admin Panel JavaScript
let currentUser = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing admin panel...');
    
    // DOM Elements
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    console.log('DOM elements found:', {
        loginSection: !!loginSection,
        dashboardSection: !!dashboardSection,
        loginForm: !!loginForm,
        loginError: !!loginError
    });

    // Authentication Functions
    function showAlert(message, type = 'success') {
        const alertContainer = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        alertContainer.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    function showLoading() {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        document.body.appendChild(loading);
    }

    function hideLoading() {
        const loading = document.querySelector('.loading-overlay');
        if (loading) {
            loading.remove();
        }
    }

    // Check authentication state on page load
    console.log('Setting up auth state listener...');
    console.log('Firebase auth object:', auth);
    console.log('Firebase db object:', db);
    console.log('Firebase storage object:', storage);
    
    // Ensure DOM elements exist
    if (!loginSection || !dashboardSection) {
        console.error('Critical DOM elements not found!');
        console.error('loginSection:', loginSection);
        console.error('dashboardSection:', dashboardSection);
        return;
    }
    
    auth.onAuthStateChanged((user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'No user');
        console.log('User details:', user ? { uid: user.uid, email: user.email } : 'No user');
        
        if (user) {
            currentUser = user;
            console.log('Showing dashboard, hiding login...');
            console.log('Login section display before:', loginSection.style.display);
            console.log('Dashboard section display before:', dashboardSection.style.display);
            
            // Force hide loading overlay first
            hideLoading();
            
            // Show dashboard and hide login
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            
            console.log('Login section display after:', loginSection.style.display);
            console.log('Dashboard section display after:', dashboardSection.style.display);
            
            // Add a small delay to ensure DOM updates
            setTimeout(() => {
                loadAllData();
            }, 100);
        } else {
            currentUser = null;
            console.log('Showing login, hiding dashboard...');
            loginSection.style.display = 'block';
            dashboardSection.style.display = 'none';
        }
    });

    // Login form handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        console.log('Login attempt for:', email);
        
        try {
            showLoading();
            await auth.signInWithEmailAndPassword(email, password);
            console.log('Login successful!');
            showAlert('Login successful!', 'success');
            // Don't hide loading here - let the auth state listener handle it
        } catch (error) {
            console.error('Login error:', error);
            hideLoading(); // Hide loading on error
            loginError.textContent = error.message;
            loginError.style.display = 'block';
        }
    });

    // Logout function
    window.logout = function() {
        auth.signOut().then(() => {
            showAlert('Logged out successfully', 'info');
        }).catch((error) => {
            console.error('Logout error:', error);
            showAlert('Error logging out', 'danger');
        });
    };

    // Manual dashboard toggle for debugging
    window.toggleDashboard = function() {
        console.log('Manual dashboard toggle called');
        console.log('Current user:', currentUser);
        console.log('Login section display:', loginSection.style.display);
        console.log('Dashboard section display:', dashboardSection.style.display);
        
        if (currentUser) {
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            hideLoading();
            loadAllData();
            showAlert('Dashboard manually activated', 'info');
        } else {
            showAlert('No user logged in', 'warning');
        }
    };

    // Load all data when dashboard is shown
    function loadAllData() {
        console.log('Loading all data...');
        loadGallery();
        loadBlogPosts();
        loadPackages();
        loadTestimonials();
        loadSettings();
    }

    // ==================== GALLERY MANAGEMENT ====================

    // Gallery form handler
    document.getElementById('galleryUploadForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = document.getElementById('galleryImage').files[0];
        const title = document.getElementById('imageTitle').value;
        const description = document.getElementById('imageDescription').value;
        
        if (!file) {
            showAlert('Please select an image', 'warning');
            return;
        }
        
        try {
            showLoading();
            
            // Upload image to Firebase Storage
            const storageRef = storage.ref(`gallery/${Date.now()}_${file.name}`);
            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            // Save metadata to Firestore
            await db.collection('gallery').add({
                title: title || '',
                description: description || '',
                imageUrl: downloadURL,
                fileName: file.name,
                uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
                uploadedBy: currentUser.uid
            });
            
            showAlert('Image uploaded successfully!', 'success');
            document.getElementById('galleryUploadForm').reset();
            loadGallery();
        } catch (error) {
            console.error('Upload error:', error);
            showAlert('Error uploading image: ' + error.message, 'danger');
        } finally {
            hideLoading();
        }
    });

    // Load gallery images
    async function loadGallery() {
        try {
            const snapshot = await db.collection('gallery').orderBy('uploadedAt', 'desc').get();
            const galleryGrid = document.getElementById('galleryGrid');
            galleryGrid.innerHTML = '';
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                const div = document.createElement('div');
                div.className = 'col-md-4 col-lg-3';
                div.innerHTML = `
                    <div class="gallery-item">
                        <img src="${data.imageUrl}" alt="${data.title}" class="img-fluid">
                        <div class="overlay">
                            <button class="btn btn-danger btn-sm" onclick="deleteGalleryImage('${doc.id}', '${data.fileName}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                        ${data.title ? `<div class="p-2"><strong>${data.title}</strong></div>` : ''}
                        ${data.description ? `<div class="px-2 pb-2 text-muted small">${data.description}</div>` : ''}
                    </div>
                `;
                galleryGrid.appendChild(div);
            });
        } catch (error) {
            console.error('Error loading gallery:', error);
            showAlert('Error loading gallery', 'danger');
        }
    }

    // Delete gallery image
    async function deleteGalleryImage(docId, fileName) {
        if (!confirm('Are you sure you want to delete this image?')) return;
        
        try {
            showLoading();
            
            // Delete from Firestore
            await db.collection('gallery').doc(docId).delete();
            
            // Delete from Storage (optional - you might want to keep the file)
            try {
                const storageRef = storage.ref(`gallery/${fileName}`);
                await storageRef.delete();
            } catch (storageError) {
                console.log('Storage file not found, continuing...');
            }
            
            showAlert('Image deleted successfully!', 'success');
            loadGallery();
        } catch (error) {
            console.error('Delete error:', error);
            showAlert('Error deleting image: ' + error.message, 'danger');
        } finally {
            hideLoading();
        }
    }

    // ==================== BLOG MANAGEMENT ====================

    // Blog form handler
    document.getElementById('blogForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('blogTitle').value;
        const content = document.getElementById('blogContent').value;
        const files = document.getElementById('blogImages').files;
        const blogId = document.getElementById('blogId').value;
        
        try {
            showLoading();
            
            const blogData = {
                title: title,
                content: content,
                date: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                author: currentUser.uid
            };
            
            // Handle image uploads
            if (files.length > 0) {
                const imageUrls = [];
                for (let file of files) {
                    const storageRef = storage.ref(`blogs/${Date.now()}_${file.name}`);
                    const snapshot = await storageRef.put(file);
                    const downloadURL = await snapshot.ref.getDownloadURL();
                    imageUrls.push(downloadURL);
                }
                blogData.images = imageUrls;
            }
            
            if (blogId) {
                // Update existing blog
                await db.collection('blogs').doc(blogId).update(blogData);
                showAlert('Blog post updated successfully!', 'success');
            } else {
                // Create new blog
                await db.collection('blogs').add(blogData);
                showAlert('Blog post created successfully!', 'success');
            }
            
            document.getElementById('blogForm').reset();
            document.getElementById('blogId').value = '';
            loadBlogPosts();
        } catch (error) {
            console.error('Blog save error:', error);
            showAlert('Error saving blog post: ' + error.message, 'danger');
        } finally {
            hideLoading();
        }
    });

    // Load blog posts
    async function loadBlogPosts() {
        try {
            const snapshot = await db.collection('blogs').orderBy('date', 'desc').get();
            const blogList = document.getElementById('blogList');
            blogList.innerHTML = '';
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                const date = data.date ? new Date(data.date.toDate()).toLocaleDateString() : 'No date';
                const div = document.createElement('div');
                div.className = 'blog-card card';
                div.innerHTML = `
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${data.title}</h6>
                        <div>
                            <button class="btn btn-sm btn-outline-primary" onclick="editBlog('${doc.id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteBlog('${doc.id}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="text-muted small">Published: ${date}</p>
                        <p>${data.content.substring(0, 200)}${data.content.length > 200 ? '...' : ''}</p>
                        ${data.images && data.images.length > 0 ? 
                            `<div class="mt-2">
                                <small class="text-muted">${data.images.length} image(s) attached</small>
                            </div>` : ''
                        }
                    </div>
                `;
                blogList.appendChild(div);
            });
        } catch (error) {
            console.error('Error loading blogs:', error);
            showAlert('Error loading blog posts', 'danger');
        }
    }

    // Edit blog post
    async function editBlog(blogId) {
        try {
            const doc = await db.collection('blogs').doc(blogId).get();
            const data = doc.data();
            
            document.getElementById('blogTitle').value = data.title;
            document.getElementById('blogContent').value = data.content;
            document.getElementById('blogId').value = blogId;
            
            // Scroll to form
            document.getElementById('blog-tab').click();
            document.getElementById('blogForm').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading blog for edit:', error);
            showAlert('Error loading blog post', 'danger');
        }
    }

    // Delete blog post
    async function deleteBlog(blogId) {
        if (!confirm('Are you sure you want to delete this blog post?')) return;
        
        try {
            showLoading();
            await db.collection('blogs').doc(blogId).delete();
            showAlert('Blog post deleted successfully!', 'success');
            loadBlogPosts();
        } catch (error) {
            console.error('Delete blog error:', error);
            showAlert('Error deleting blog post: ' + error.message, 'danger');
        } finally {
            hideLoading();
        }
    }

    // Reset blog form
    function resetBlogForm() {
        document.getElementById('blogForm').reset();
        document.getElementById('blogId').value = '';
    }

    // ==================== PACKAGES MANAGEMENT ====================

    // Package form handler
    document.getElementById('packageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('packageName').value;
        const price = document.getElementById('packagePrice').value;
        const features = document.getElementById('packageFeatures').value;
        const order = parseInt(document.getElementById('packageOrder').value) || 1;
        const packageId = document.getElementById('packageId').value;
        
        const featuresList = features.split('\n').filter(feature => feature.trim() !== '');
        
        try {
            showLoading();
            
            const packageData = {
                name: name,
                price: price,
                features: featuresList,
                order: order,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (packageId) {
                await db.collection('packages').doc(packageId).update(packageData);
                showAlert('Package updated successfully!', 'success');
            } else {
                await db.collection('packages').add(packageData);
                showAlert('Package created successfully!', 'success');
            }
            
            document.getElementById('packageForm').reset();
            document.getElementById('packageOrder').value = '1';
            document.getElementById('packageId').value = '';
            loadPackages();
        } catch (error) {
            console.error('Package save error:', error);
            showAlert('Error saving package: ' + error.message, 'danger');
        } finally {
            hideLoading();
        }
    });

    // Load packages
    async function loadPackages() {
        try {
            const snapshot = await db.collection('packages').orderBy('order', 'asc').get();
            const packagesList = document.getElementById('packagesList');
            packagesList.innerHTML = '';
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                const div = document.createElement('div');
                div.className = 'package-card card';
                div.innerHTML = `
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${data.name}</h6>
                        <div>
                            <button class="btn btn-sm btn-outline-primary" onclick="editPackage('${doc.id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deletePackage('${doc.id}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <h5 class="text-primary">${data.price}</h5>
                        <ul class="feature-list">
                            ${data.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                        <small class="text-muted">Order: ${data.order}</small>
                    </div>
                `;
                packagesList.appendChild(div);
            });
        } catch (error) {
            console.error('Error loading packages:', error);
            showAlert('Error loading packages', 'danger');
        }
    }

    // Edit package
    async function editPackage(packageId) {
        try {
            const doc = await db.collection('packages').doc(packageId).get();
            const data = doc.data();
            
            document.getElementById('packageName').value = data.name;
            document.getElementById('packagePrice').value = data.price;
            document.getElementById('packageFeatures').value = data.features.join('\n');
            document.getElementById('packageOrder').value = data.order;
            document.getElementById('packageId').value = packageId;
            
            document.getElementById('packages-tab').click();
            document.getElementById('packageForm').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading package for edit:', error);
            showAlert('Error loading package', 'danger');
        }
    }

    // Delete package
    async function deletePackage(packageId) {
        if (!confirm('Are you sure you want to delete this package?')) return;
        
        try {
            showLoading();
            await db.collection('packages').doc(packageId).delete();
            showAlert('Package deleted successfully!', 'success');
            loadPackages();
        } catch (error) {
            console.error('Delete package error:', error);
            showAlert('Error deleting package: ' + error.message, 'danger');
        } finally {
            hideLoading();
        }
    }

    // Reset package form
    function resetPackageForm() {
        document.getElementById('packageForm').reset();
        document.getElementById('packageOrder').value = '1';
        document.getElementById('packageId').value = '';
    }

    // ==================== TESTIMONIALS MANAGEMENT ====================

    // Testimonial form handler
    document.getElementById('testimonialForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('testimonialName').value;
        const text = document.getElementById('testimonialText').value;
        const order = parseInt(document.getElementById('testimonialOrder').value) || 1;
        const file = document.getElementById('testimonialImage').files[0];
        const testimonialId = document.getElementById('testimonialId').value;
        
        try {
            showLoading();
            
            const testimonialData = {
                name: name,
                text: text,
                order: order,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Handle image upload
            if (file) {
                const storageRef = storage.ref(`testimonials/${Date.now()}_${file.name}`);
                const snapshot = await storageRef.put(file);
                const downloadURL = await snapshot.ref.getDownloadURL();
                testimonialData.imageUrl = downloadURL;
            }
            
            if (testimonialId) {
                await db.collection('testimonials').doc(testimonialId).update(testimonialData);
                showAlert('Testimonial updated successfully!', 'success');
            } else {
                await db.collection('testimonials').add(testimonialData);
                showAlert('Testimonial created successfully!', 'success');
            }
            
            document.getElementById('testimonialForm').reset();
            document.getElementById('testimonialOrder').value = '1';
            document.getElementById('testimonialId').value = '';
            loadTestimonials();
        } catch (error) {
            console.error('Testimonial save error:', error);
            showAlert('Error saving testimonial: ' + error.message, 'danger');
        } finally {
            hideLoading();
        }
    });

    // Load testimonials
    async function loadTestimonials() {
        try {
            const snapshot = await db.collection('testimonials').orderBy('order', 'asc').get();
            const testimonialsList = document.getElementById('testimonialsList');
            testimonialsList.innerHTML = '';
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                const div = document.createElement('div');
                div.className = 'testimonial-card card';
                div.innerHTML = `
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${data.name}</h6>
                        <div>
                            <button class="btn btn-sm btn-outline-primary" onclick="editTestimonial('${doc.id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteTestimonial('${doc.id}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="d-flex align-items-start">
                            ${data.imageUrl ? 
                                `<img src="${data.imageUrl}" alt="${data.name}" class="testimonial-avatar me-3">` : 
                                '<div class="testimonial-avatar me-3 bg-secondary d-flex align-items-center justify-content-center text-white">' + 
                                data.name.charAt(0).toUpperCase() + '</div>'
                            }
                            <div class="flex-grow-1">
                                <p class="mb-2">"${data.text}"</p>
                                <small class="text-muted">Order: ${data.order}</small>
                            </div>
                        </div>
                    </div>
                `;
                testimonialsList.appendChild(div);
            });
        } catch (error) {
            console.error('Error loading testimonials:', error);
            showAlert('Error loading testimonials', 'danger');
        }
    }

    // Edit testimonial
    async function editTestimonial(testimonialId) {
        try {
            const doc = await db.collection('testimonials').doc(testimonialId).get();
            const data = doc.data();
            
            document.getElementById('testimonialName').value = data.name;
            document.getElementById('testimonialText').value = data.text;
            document.getElementById('testimonialOrder').value = data.order;
            document.getElementById('testimonialId').value = testimonialId;
            
            document.getElementById('testimonials-tab').click();
            document.getElementById('testimonialForm').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading testimonial for edit:', error);
            showAlert('Error loading testimonial', 'danger');
        }
    }

    // Delete testimonial
    async function deleteTestimonial(testimonialId) {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        
        try {
            showLoading();
            await db.collection('testimonials').doc(testimonialId).delete();
            showAlert('Testimonial deleted successfully!', 'success');
            loadTestimonials();
        } catch (error) {
            console.error('Delete testimonial error:', error);
            showAlert('Error deleting testimonial: ' + error.message, 'danger');
        } finally {
            hideLoading();
        }
    }

    // Reset testimonial form
    function resetTestimonialForm() {
        document.getElementById('testimonialForm').reset();
        document.getElementById('testimonialOrder').value = '1';
        document.getElementById('testimonialId').value = '';
    }

    // ==================== SETTINGS MANAGEMENT ====================

    // Settings form handler
    document.getElementById('settingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const siteTitle = document.getElementById('siteTitle').value;
        const aboutSection = document.getElementById('aboutSection').value;
        const contactEmail = document.getElementById('contactEmail').value;
        const contactPhone = document.getElementById('contactPhone').value;
        const contactAddress = document.getElementById('contactAddress').value;
        
        try {
            showLoading();
            
            const settingsData = {
                siteTitle: siteTitle,
                aboutSection: aboutSection,
                contactEmail: contactEmail,
                contactPhone: contactPhone,
                contactAddress: contactAddress,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('siteSettings').doc('main').set(settingsData);
            showAlert('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Settings save error:', error);
            showAlert('Error saving settings: ' + error.message, 'danger');
        } finally {
            hideLoading();
        }
    });

    // Load settings
    async function loadSettings() {
        try {
            const doc = await db.collection('siteSettings').doc('main').get();
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('siteTitle').value = data.siteTitle || '';
                document.getElementById('aboutSection').value = data.aboutSection || '';
                document.getElementById('contactEmail').value = data.contactEmail || '';
                document.getElementById('contactPhone').value = data.contactPhone || '';
                document.getElementById('contactAddress').value = data.contactAddress || '';
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            showAlert('Error loading settings', 'danger');
        }
    }

    // Make functions globally accessible for onclick handlers
    window.deleteGalleryImage = deleteGalleryImage;
    window.editBlog = editBlog;
    window.deleteBlog = deleteBlog;
    window.resetBlogForm = resetBlogForm;
    window.editPackage = editPackage;
    window.deletePackage = deletePackage;
    window.resetPackageForm = resetPackageForm;
    window.editTestimonial = editTestimonial;
    window.deleteTestimonial = deleteTestimonial;
    window.resetTestimonialForm = resetTestimonialForm;

    // Initialize the admin panel
    console.log('Admin panel initialized');
}); 