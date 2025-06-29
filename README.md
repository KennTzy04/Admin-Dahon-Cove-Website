# Dahon Cove Admin Panel

A responsive, secure admin panel built with HTML, CSS, JavaScript, and Firebase for managing a resort/guesthouse website.

## 🚀 Features

### 🔐 Authentication
- Firebase Authentication (Email/Password)
- Secure login/logout functionality
- Protected admin routes

### 📸 Gallery Manager
- Upload images to Firebase Storage
- Display images in responsive grid
- Delete images with confirmation
- Store image metadata (title, description)

### 📝 Blog & Article Manager
- Create, edit, and delete blog posts
- Rich text content support
- Multiple image uploads per post
- Automatic date tracking

### 💲 Price Packages Section
- Add/edit/delete pricing packages
- Feature lists for each package
- Customizable display order
- Professional pricing display

### 💬 Testimonials Section
- Add/edit/delete customer testimonials
- Profile image uploads
- Customizable display order
- Professional testimonial cards

### 🧾 General Settings
- Site title and branding
- About section content
- Contact information (email, phone, address)
- All content editable through admin panel

## 📁 Project Structure

```
USING FIREBASE/
├── admin.html              # Admin panel interface
├── index.html              # Public-facing website
├── firebase.json           # Firebase hosting configuration
├── firestore.rules         # Firestore security rules
├── storage.rules           # Firebase Storage security rules
├── firestore.indexes.json  # Firestore indexes
├── css/
│   ├── admin.css          # Admin panel styles
│   └── style.css          # Public website styles
├── js/
│   ├── firebase-config.js # Firebase configuration
│   ├── admin.js           # Admin panel functionality
│   └── main.js            # Public website functionality
└── README.md              # This file
```

## 🔧 Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable the following services:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**
   - **Hosting**

### 2. Firebase Configuration

1. In your Firebase project, go to Project Settings
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web
4. Register your app and copy the configuration
5. Replace the placeholder values in `js/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Security Rules Setup

The project includes pre-configured security rules:

- **Firestore Rules** (`firestore.rules`): Only authenticated users can read/write
- **Storage Rules** (`storage.rules`): Only authenticated users can upload/delete files

Deploy these rules in Firebase Console or using Firebase CLI.

### 4. Create Admin User

1. In Firebase Console, go to Authentication
2. Click "Add user"
3. Enter email and password for admin access
4. Use these credentials to log into the admin panel

### 5. Deploy to Firebase Hosting

#### Option A: Using Firebase CLI
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (select existing project)
firebase init hosting

# Deploy
firebase deploy
```

#### Option B: Using Firebase Console
1. Go to Firebase Console > Hosting
2. Click "Get started"
3. Upload your project files
4. Deploy

## 🗄️ Firestore Database Structure

### Collections

#### `gallery`
```javascript
{
  title: "string",
  description: "string", 
  imageUrl: "string",
  fileName: "string",
  uploadedAt: "timestamp",
  uploadedBy: "string (user ID)"
}
```

#### `blogs`
```javascript
{
  title: "string",
  content: "string",
  images: ["array of image URLs"],
  date: "timestamp",
  updatedAt: "timestamp",
  author: "string (user ID)"
}
```

#### `packages`
```javascript
{
  name: "string",
  price: "string",
  features: ["array of features"],
  order: "number",
  updatedAt: "timestamp"
}
```

#### `testimonials`
```javascript
{
  name: "string",
  text: "string",
  imageUrl: "string (optional)",
  order: "number",
  updatedAt: "timestamp"
}
```

#### `siteSettings`
```javascript
{
  siteTitle: "string",
  aboutSection: "string",
  contactEmail: "string",
  contactPhone: "string", 
  contactAddress: "string",
  updatedAt: "timestamp"
}
```

## 🔐 Security Features

- **Authentication Required**: All admin functions require Firebase Authentication
- **Secure Rules**: Firestore and Storage rules prevent unauthorized access
- **Protected Routes**: Admin panel only accessible to authenticated users
- **Input Validation**: Client-side validation for all forms
- **Error Handling**: Comprehensive error handling and user feedback

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Bootstrap 5**: Modern, clean interface
- **Loading States**: Visual feedback during operations
- **Success/Error Alerts**: User-friendly notifications
- **Smooth Animations**: CSS transitions and hover effects
- **Tabbed Interface**: Organized admin sections
- **Image Previews**: Visual feedback for uploads

## 🚀 Deployment

### Admin Panel Access
- URL: `https://your-project.firebaseapp.com/admin`
- Protected by Firebase Authentication
- Only accessible to registered admin users

### Public Website
- URL: `https://your-project.firebaseapp.com`
- Displays content managed through admin panel
- Responsive design for all devices

## 📱 Responsive Features

- Mobile-first design approach
- Bootstrap 5 responsive grid system
- Touch-friendly interface
- Optimized for all screen sizes
- Fast loading on mobile networks

## 🔧 Customization

### Styling
- Modify `css/admin.css` for admin panel styling
- Modify `css/style.css` for public website styling
- Bootstrap 5 classes for quick styling changes

### Functionality
- Add new sections in `js/admin.js`
- Modify data structure in Firestore
- Add new Firebase services as needed

### Content
- All content editable through admin panel
- No hardcoded content
- Dynamic loading from Firebase

## 🛠️ Troubleshooting

### Common Issues

1. **Firebase not initialized**
   - Check `js/firebase-config.js` has correct credentials
   - Ensure Firebase SDK is loaded

2. **Authentication errors**
   - Verify admin user exists in Firebase Console
   - Check email/password are correct

3. **Upload failures**
   - Verify Storage rules are deployed
   - Check file size limits
   - Ensure proper file types

4. **Database errors**
   - Verify Firestore rules are deployed
   - Check collection names match code
   - Ensure proper data structure

### Debug Mode
Open browser console to see detailed error messages and debug information.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Support

For support or questions:
1. Check the troubleshooting section
2. Review Firebase documentation
3. Check browser console for errors
4. Verify all Firebase services are enabled

## 🔄 Updates

To update the project:
1. Backup your Firebase configuration
2. Update the code files
3. Re-deploy to Firebase Hosting
4. Test all functionality

---

**Note**: Remember to replace all placeholder Firebase configuration values with your actual project credentials before deploying. 