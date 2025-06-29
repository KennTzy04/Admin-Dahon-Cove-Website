// Firebase Configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBrfWPzO7K6SkgH3fbeRS4Z6t2OT5k-aiY",
    authDomain: "dahon-cove-resort-website.firebaseapp.com",
    projectId: "dahon-cove-resort-website",
    storageBucket: "dahon-cove-resort-website.appspot.com",
    messagingSenderId: "842286051891",
    appId: "1:842286051891:web:1efb748fef5826310ee946",
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase with error handling
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase app:', error);
}

// Initialize Firebase services with error handling
let auth, db, storage;

try {
    auth = firebase.auth();
    console.log('Firebase Auth initialized');
} catch (error) {
    console.error('Error initializing Firebase Auth:', error);
}

try {
    db = firebase.firestore();
    console.log('Firebase Firestore initialized');
} catch (error) {
    console.error('Error initializing Firebase Firestore:', error);
}

try {
    storage = firebase.storage();
    console.log('Firebase Storage initialized');
} catch (error) {
    console.error('Error initializing Firebase Storage:', error);
}

// Enable Firestore offline persistence with better error handling
if (db) {
    db.enablePersistence()
        .then(() => {
            console.log('Firestore offline persistence enabled');
        })
        .catch((err) => {
            if (err.code == 'failed-precondition') {
                console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code == 'unimplemented') {
                console.log('The current browser does not support persistence.');
            } else {
                console.error('Error enabling Firestore persistence:', err);
            }
        });
}

// Test Firebase services
function testFirebaseServices() {
    console.log('Testing Firebase services...');
    
    // Test Auth
    if (auth) {
        console.log('✅ Firebase Auth is available');
    } else {
        console.error('❌ Firebase Auth is not available');
    }
    
    // Test Firestore
    if (db) {
        console.log('✅ Firebase Firestore is available');
    } else {
        console.error('❌ Firebase Firestore is not available');
    }
    
    // Test Storage
    if (storage) {
        console.log('✅ Firebase Storage is available');
    } else {
        console.error('❌ Firebase Storage is not available');
    }
}

// Run test when page loads
document.addEventListener('DOMContentLoaded', function() {
    testFirebaseServices();
});

console.log('Firebase configuration loaded successfully'); 