/**
 * User Details & Authentication Data Hub
 * Manages user registration, local persistence, session management,
 * permanent code-file database, Google Sheets real-time synchronization,
 * and export functions for admin view.
 * 
 * Curated by Niraj Kumar, Section Supervisor, RO, Faridabad
 * Contact: smart.webpage.storage@gmail.com | 8700383426
 */

const UserDetailsHub = (function() {
  const STORAGE_KEY_USERS = 'portalRegisteredUsers';
  const STORAGE_KEY_SESSION = 'portalActiveUserSession';
  const STORAGE_KEY_WEBHOOK = 'portalGoogleSheetWebhookUrl';
  const STORAGE_KEY_LAST_EMAIL = 'portalLastRegisteredEmail';
  const STORAGE_KEY_CUSTOM_SETTINGS = 'portalFormCustomizations';
  const STORAGE_KEY_CUSTOM_VIDEOS = 'portalCustomVideos';
  const STORAGE_KEY_LOGIN_REQUIRED_FOR_PRINT = 'portalLoginRequiredForPrint';
  const STORAGE_KEY_CUSTOM_LETTERS = 'portalCustomLetters';
  const STORAGE_KEY_CUSTOM_DEPARTMENTS = 'portalCustomDepartments';

  // =========================================================================
  // 1. Permanent In-Code Registered Users (Bake directly in code file)
  //    ये यूज़र्स कोड फाइल में स्थायी रूप से सेव रहते हैं।
  //    ब्राउज़र कैश या लोकल स्टोरेज डिलीट होने पर भी ये यूज़र्स बने रहते हैं।
  // =========================================================================
  const IN_CODE_REGISTERED_USERS = [
    {
      id: 'USR_ADMIN_01',
      name: 'Niraj Kumar (Admin)',
      email: 'smart.webpage.storage@gmail.com',
      mobile: '8700383426',
      password: 'EPFO#Admin123',
      userType: 'admin',
      userTypeLabel: '👑 मुख्य प्रशासक (Admin)',
      officeName: 'Regional Office, Faridabad',
      designation: 'Section Supervisor / Portal Admin',
      registeredAt: '16/09/2026, 10:00:00 am',
      registeredTimestamp: 1789533600000,
      lastLoginAt: '16/09/2026, 10:00:00 am',
      totalLogins: 10,
      formsAccessed: []
    }
  ];

  // =========================================================================
  // 1.1. Firebase Cloud Firestore & Authentication Engine
  // =========================================================================
  const FIREBASE_CONFIG = {
    projectId: "sarkari-forms-seva-555",
    appId: "1:922883854339:web:545dcb2b8287d23a98fe36",
    storageBucket: "sarkari-forms-seva-555.firebasestorage.app",
    apiKey: "AIzaSyAvhsuERgmkWkHcy5WD5K71gUzoMQXSP3Y",
    authDomain: "sarkari-forms-seva-555.firebaseapp.com",
    messagingSenderId: "922883854339"
  };

  let firebaseApp = null;
  let firestoreDb = null;
  let firebaseAuth = null;

  function initFirebase() {
    if (typeof firebase !== 'undefined' && !firebaseApp) {
      try {
        if (!firebase.apps || firebase.apps.length === 0) {
          firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
        } else {
          firebaseApp = firebase.apps[0];
        }
        if (typeof firebase.firestore !== 'undefined') {
          firestoreDb = firebase.firestore();
        }
        if (typeof firebase.auth !== 'undefined') {
          firebaseAuth = firebase.auth();
        }
      } catch (e) {
        console.warn('Firebase init warning:', e);
      }
    }
    return firestoreDb;
  }

  function ensureFirebaseLoaded() {
    if (typeof firebase !== 'undefined' && firestoreDb) {
      return Promise.resolve(firestoreDb);
    }
    if (typeof firebase !== 'undefined') {
      initFirebase();
      if (firestoreDb) return Promise.resolve(firestoreDb);
    }
    return new Promise((resolve) => {
      if (typeof document === 'undefined') return resolve(null);
      if (typeof firebase !== 'undefined') {
        initFirebase();
        return resolve(firestoreDb);
      }
      const scriptApp = document.createElement('script');
      scriptApp.src = 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js';
      scriptApp.onload = () => {
        const scriptStore = document.createElement('script');
        scriptStore.src = 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore-compat.js';
        scriptStore.onload = () => {
          initFirebase();
          resolve(firestoreDb);
        };
        scriptStore.onerror = () => resolve(null);
        document.head.appendChild(scriptStore);
      };
      scriptApp.onerror = () => resolve(null);
      document.head.appendChild(scriptApp);
    });
  }

  // Save single user to Firestore 'users' collection
  async function saveUserToFirestore(userData) {
    initFirebase();
    if (!firestoreDb) return false;
    try {
      const docId = (userData.email || '').toLowerCase().replace(/[^a-z0-9]/g, '_') || userData.id;
      await firestoreDb.collection('users').doc(docId).set(userData, { merge: true });
      console.log('User synced to Firestore:', docId);
      return true;
    } catch (e) {
      console.error('Firestore user save error:', e);
      return false;
    }
  }

  // Fetch all users from Firestore 'users' collection
  async function fetchUsersFromFirestore() {
    initFirebase();
    if (!firestoreDb) return getAllUsers();
    try {
      const snapshot = await firestoreDb.collection('users').get();
      const firestoreUsers = [];
      snapshot.forEach(doc => {
        firestoreUsers.push(doc.data());
      });
      if (firestoreUsers.length > 0) {
        const stored = getStoredUsersOnly();
        firestoreUsers.forEach(fu => {
          const idx = stored.findIndex(u => (u.email && u.email === fu.email) || (u.id && u.id === fu.id));
          if (idx === -1) {
            stored.push(fu);
          } else {
            stored[idx] = { ...stored[idx], ...fu };
          }
        });
        saveAllUsers(stored);
        return getAllUsers();
      }
    } catch (e) {
      console.warn('Firestore fetch warning:', e);
    }
    return getAllUsers();
  }

  // =========================================================================
  // 1.2. OTP Password Reset Engine
  // =========================================================================
  function sendPasswordResetOtp(emailOrMobile) {
    initFirebase();
    const identifier = (emailOrMobile || '').trim().toLowerCase();
    const allUsers = getAllUsers();
    const user = allUsers.find(u => 
      (u.email || '').toLowerCase() === identifier || (u.mobile || '') === identifier
    );

    if (!user) {
      return { success: false, message: 'इस ईमेल अथवा मोबाइल से कोई पंजीकृत खाता नहीं मिला। (User account not found)' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + (10 * 60 * 1000); // 10 minutes

    const otpData = {
      identifier: identifier,
      otp: otp,
      expiry: expiry,
      userEmail: user.email,
      userName: user.name
    };
    try {
      localStorage.setItem('portal_pwd_reset_otp', JSON.stringify(otpData));
    } catch (e) {}

    // Send Firebase Auth email if available
    if (firebaseAuth && user.email) {
      try {
        firebaseAuth.sendPasswordResetEmail(user.email).catch(e => console.log('Firebase Auth reset email note:', e));
      } catch (e) {}
    }

    return {
      success: true,
      otp: otp,
      email: user.email,
      name: user.name,
      message: `सत्यापन कोड जारी कर दिया गया है। आपका 6-अंकीय OTP है: ${otp} (यह 10 मिनट के लिए मान्य है)`
    };
  }

  function verifyPasswordResetOtp(emailOrMobile, enteredOtp) {
    let raw = null;
    try {
      raw = localStorage.getItem('portal_pwd_reset_otp');
    } catch (e) {}

    if (!raw) {
      return { success: false, message: 'कोई सक्रिय ओटीपी अनुरोध नहीं मिला। कृपया पहले "ओटीपी प्राप्त करें" पर क्लिक करें।' };
    }

    let otpData;
    try {
      otpData = JSON.parse(raw);
    } catch (e) {
      return { success: false, message: 'ओटीपी डेटा अमान्य है।' };
    }

    if (Date.now() > otpData.expiry) {
      try { localStorage.removeItem('portal_pwd_reset_otp'); } catch (e) {}
      return { success: false, message: 'ओटीपी की समय सीमा समाप्त (Expired) हो चुकी है। कृपया नया ओटीपी प्राप्त करें।' };
    }

    const identifier = (emailOrMobile || '').trim().toLowerCase();
    const cleanEntered = (enteredOtp || '').trim();

    if (otpData.otp !== cleanEntered) {
      return { success: false, message: 'अमान्य ओटीपी! कृपया सही 6-अंकीय कोड दर्ज करें।' };
    }

    return { success: true, message: 'ओटीपी सत्यापन सफल!' };
  }

  async function resetUserPassword(emailOrMobile, newPassword) {
    const identifier = (emailOrMobile || '').trim().toLowerCase();
    const cleanPwd = (newPassword || '').trim();

    if (!cleanPwd || cleanPwd.length < 4) {
      return { success: false, message: 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' };
    }

    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => 
      (u.email || '').toLowerCase() === identifier || (u.mobile || '') === identifier
    );

    if (userIndex === -1) {
      return { success: false, message: 'यूज़र खाता नहीं मिला।' };
    }

    allUsers[userIndex].password = cleanPwd;
    const updatedUser = allUsers[userIndex];

    const stored = getStoredUsersOnly();
    const storedIdx = stored.findIndex(u => (u.email && u.email.toLowerCase() === identifier) || u.mobile === identifier);
    if (storedIdx !== -1) {
      stored[storedIdx].password = cleanPwd;
      saveAllUsers(stored);
    }

    try { localStorage.removeItem('portal_pwd_reset_otp'); } catch (e) {}

    // Sync to Cloud Firestore
    await saveUserToFirestore(updatedUser);

    return { success: true, message: '🎉 पासवर्ड सफलतापूर्वक बदल दिया गया है! अब आप नए पासवर्ड से लॉगिन कर सकते हैं।' };
  }

  // Fallback Google Sheets Webhook URL (can also be saved via Admin Dashboard)
  let GOOGLE_SHEET_WEBHOOK_URL = ''; 

  // Webhook URL getter & setter
  function getWebhookUrl() {
    try {
      return (localStorage.getItem(STORAGE_KEY_WEBHOOK) || GOOGLE_SHEET_WEBHOOK_URL || '').trim();
    } catch (e) {
      return GOOGLE_SHEET_WEBHOOK_URL;
    }
  }

  function setWebhookUrl(url) {
    try {
      const cleanUrl = (url || '').trim();
      localStorage.setItem(STORAGE_KEY_WEBHOOK, cleanUrl);
      GOOGLE_SHEET_WEBHOOK_URL = cleanUrl;
      return true;
    } catch (e) {
      console.error('Error saving webhook URL', e);
      return false;
    }
  }

  // Forward user data to Google Sheet
  function forwardToGoogleSheet(userData) {
    const webhookUrl = getWebhookUrl();
    if (!webhookUrl) return Promise.resolve({ success: false, message: 'No webhook URL configured' });

    // Note: 'no-cors' mode with text/plain body allows direct submission to Google Apps Script Web Apps
    return fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(userData)
    }).then(() => {
      console.log('Data successfully forwarded to Google Sheet');
      return { success: true };
    }).catch(err => {
      console.warn('Webhook forwarding notice:', err);
      return { success: false, error: err };
    });
  }

  // Test Webhook connection
  function testWebhook(customUrl = null) {
    const targetUrl = customUrl ? customUrl.trim() : getWebhookUrl();
    if (!targetUrl) {
      return Promise.reject(new Error('कृपया पहले मान्य Google Apps Script Webhook URL दर्ज करें।'));
    }

    const testPayload = {
      id: 'TEST_' + Date.now(),
      userType: 'epfo_staff',
      userTypeLabel: 'EPFO कार्यालयीन स्टाफ (EPFO Staff)',
      name: 'परीक्षण यूजर (Test Entry - Niraj Kumar)',
      email: 'smart.webpage.storage@gmail.com',
      mobile: '8700383426',
      password: 'EPFO#TEST123',
      establishmentName: 'Regional Office, Faridabad (RO Faridabad)',
      establishmentCode: 'EPFO-FBD-001',
      designation: 'Section Supervisor',
      registeredAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      lastLoginAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      totalLogins: 1
    };

    return fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(testPayload)
    }).then(() => {
      return { success: true, message: 'परीक्षण डेटा आपकी Google Sheet में सफलतापूर्वक भेज दिया गया है!' };
    });
  }

  // Retrieve stored users from localStorage only
  function getStoredUsersOnly() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading users from storage', e);
      return [];
    }
  }

  function saveAllUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to storage', e);
    }
  }

  // Get combined users (In-Code Users + LocalStorage Users)
  function getAllUsers() {
    const storedUsers = getStoredUsersOnly();
    const userMap = new Map();

    // 1. First add permanent in-code registered users
    IN_CODE_REGISTERED_USERS.forEach(u => {
      const key = (u.email || '').toLowerCase().trim();
      if (key) {
        userMap.set(key, { ...u });
      }
    });

    // 2. Then merge stored users (stored users will preserve updated login counts & latest registrations)
    storedUsers.forEach(u => {
      const key = (u.email || '').toLowerCase().trim();
      if (key) {
        if (userMap.has(key)) {
          userMap.set(key, { ...userMap.get(key), ...u });
        } else {
          userMap.set(key, { ...u });
        }
      }
    });

    return Array.from(userMap.values());
  }

  // Active Session Helper
  function getActiveUser() {
    try {
      const session = localStorage.getItem(STORAGE_KEY_SESSION);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  }

  function setActiveUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    } else {
      const sessionData = {
        id: user.id,
        userType: user.userType || 'member',
        userTypeLabel: user.userTypeLabel || 'EPFO सदस्य',
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        establishmentName: user.establishmentName || '',
        establishmentCode: user.establishmentCode || '',
        establishmentAddress: user.establishmentAddress || '',
        officeName: user.officeName || '',
        employeeId: user.employeeId || '',
        designation: user.designation || '',
        departmentName: user.departmentName || '',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
    }
  }

  // Register New User (Supports 4 Distinct User Roles)
  function registerUser(userData) {
    userData = userData || {};
    const userType = userData.userType || 'member'; // 'member' | 'employer' | 'epfo_staff' | 'govt_staff'
    const name = (userData.name || '').trim();
    const email = (userData.email || '').trim().toLowerCase();
    const mobile = (userData.mobile || '').trim();
    const password = (userData.password || '').trim();

    // Basic Common Validation
    if (!name) {
      return { success: false, message: 'कृपया अपना नाम दर्ज करें (Please enter name)' };
    }
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return { success: false, message: 'कृपया 10-अंकीय मान्य मोबाइल नंबर दर्ज करें (Enter valid 10-digit mobile)' };
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return { success: false, message: 'कृपया मान्य ईमेल आईडी दर्ज करें (Enter valid email address)' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए (Password minimum 4 chars)' };
    }

    // Role Specific Validation
    let userTypeLabel = 'EPFO सदस्य (Member)';
    let establishmentName = '';
    let establishmentCode = '';
    let establishmentAddress = '';
    let officeName = '';
    let employeeId = '';
    let designation = '';
    let departmentName = '';

    if (userType === 'employer') {
      userTypeLabel = 'नियोक्ता / कंपनी (Employer)';
      establishmentName = (userData.establishmentName || '').trim();
      establishmentCode = (userData.establishmentCode || '').trim().toUpperCase();
      establishmentAddress = (userData.establishmentAddress || '').trim();

      if (!establishmentName) {
        return { success: false, message: 'कृपया प्रतिष्ठान/कंपनी का नाम दर्ज करें (Enter Establishment Name)' };
      }
      if (!establishmentCode) {
        return { success: false, message: 'कृपया स्थापना कोड (Estt. Code) दर्ज करें (Enter Estt Code)' };
      }
      if (!establishmentAddress) {
        return { success: false, message: 'कृपया प्रतिष्ठान का पता दर्ज करें (Enter Establishment Address)' };
      }
    } else if (userType === 'epfo_staff') {
      userTypeLabel = 'EPFO कार्यालयीन स्टाफ (EPFO Staff)';
      officeName = (userData.officeName || '').trim();
      employeeId = (userData.employeeId || '').trim().toUpperCase();
      designation = (userData.designation || '').trim();

      if (!officeName) {
        return { success: false, message: 'कृपया EPFO कार्यालय का नाम दर्ज करें (Enter Office Name)' };
      }
      if (!employeeId) {
        return { success: false, message: 'कृपया कर्मचारी पहचान संख्या (Employee ID / PF No.) दर्ज करें' };
      }
      if (!designation) {
        return { success: false, message: 'कृपया अपना पदनाम (Designation) दर्ज करें' };
      }
    } else if (userType === 'govt_staff') {
      userTypeLabel = 'अन्य सरकारी कार्यालय (Govt Staff)';
      departmentName = (userData.departmentName || '').trim();
      designation = (userData.designation || '').trim();

      if (!departmentName) {
        return { success: false, message: 'कृपया मंत्रालय/विभाग का नाम दर्ज करें (Enter Ministry/Department)' };
      }
      if (!designation) {
        return { success: false, message: 'कृपया अपना पदनाम (Designation) दर्ज करें' };
      }
    }

    const allUsers = getAllUsers();
    const existing = allUsers.find(u => (u.email || '').toLowerCase() === email || u.mobile === mobile);
    if (existing) {
      return { 
        success: false, 
        alreadyRegistered: true,
        email: existing.email,
        mobile: existing.mobile,
        userType: existing.userType || 'member',
        message: 'यह ईमेल या मोबाइल पहले से पंजीकृत है। कृपया अपना पासवर्ड डालकर साइन इन करें।' 
      };
    }

    const newUser = {
      id: 'USR_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      userType: userType,
      userTypeLabel: userTypeLabel,
      name: name,
      email: email,
      mobile: mobile,
      password: password,
      establishmentName: establishmentName,
      establishmentCode: establishmentCode,
      establishmentAddress: establishmentAddress,
      officeName: officeName,
      employeeId: employeeId,
      designation: designation,
      departmentName: departmentName,
      registeredAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      registeredTimestamp: Date.now(),
      lastLoginAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      totalLogins: 1,
      formsAccessed: []
    };

    const stored = getStoredUsersOnly();
    stored.unshift(newUser);
    saveAllUsers(stored);

    setActiveUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY_LAST_EMAIL, email);
    } catch (e) {}

    // Forward automatically to Google Sheet in real-time
    forwardToGoogleSheet(newUser);

    // Sync to Cloud Firestore in real-time
    try {
      saveUserToFirestore(newUser);
    } catch (e) {
      console.warn('Firestore sync note:', e);
    }

    return { success: true, user: newUser, message: 'पंजीकरण सफल रहा! (Registration successful)' };
  }

  // Authenticate Returning User (by Email OR 10-digit Mobile)
  function loginUser({ email, password }) {
    const inputIdentifier = (email || '').trim().toLowerCase();
    password = (password || '').trim();

    if (!inputIdentifier && !password) {
      return { success: false, message: 'कृपया ईमेल/मोबाइल और पासवर्ड दर्ज करें (Enter email/mobile and password)' };
    }

    // Master Admin Override (EPFO#121007 or admin email)
    if (password === 'EPFO#121007' || (inputIdentifier === 'smart.webpage.storage@gmail.com' && (password === 'EPFO#Admin123' || password === 'EPFO#121007'))) {
      const adminUser = {
        id: 'USR_ADMIN_01',
        name: 'Niraj Kumar (Admin)',
        email: 'smart.webpage.storage@gmail.com',
        mobile: '8700383426',
        password: password,
        userType: 'admin',
        userTypeLabel: '👑 मुख्य प्रशासक (Admin)',
        officeName: 'Regional Office, Faridabad',
        designation: 'Section Supervisor / Portal Admin',
        lastLoginAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        totalLogins: 10
      };
      setActiveUser(adminUser);
      return { success: true, user: adminUser, message: '👑 एडमिन प्रमाणीकरण सफल रहा! (Admin Login Successful)' };
    }

    const allUsers = getAllUsers();
    const user = allUsers.find(u => 
      ((u.email || '').toLowerCase() === inputIdentifier || (u.mobile || '') === inputIdentifier)
    );

    if (!user) {
      return { 
        success: false, 
        notRegistered: true, 
        message: 'यह ईमेल/मोबाइल पंजीकृत नहीं है। कृपया पहले साइन अप करें।' 
      };
    }

    if (user.password !== password) {
      return { 
        success: false, 
        message: 'पासवर्ड गलत है! कृपया सही पासवर्ड दर्ज करें।' 
      };
    }

    // Success! Update stats
    user.lastLoginAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    user.totalLogins = (user.totalLogins || 0) + 1;

    const stored = getStoredUsersOnly();
    const storedIdx = stored.findIndex(u => (u.email || '').toLowerCase() === (user.email || '').toLowerCase());
    if (storedIdx >= 0) {
      stored[storedIdx] = user;
    } else {
      stored.unshift(user);
    }
    saveAllUsers(stored);

    setActiveUser(user);
    try {
      localStorage.setItem(STORAGE_KEY_LAST_EMAIL, user.email);
    } catch (e) {}

    return { success: true, user: user, message: 'लॉगिन सफल रहा! (Login successful)' };
  }

  function logoutUser() {
    setActiveUser(null);
    return { success: true };
  }

  // Export Users to CSV (Excel format)
  function exportUsersToCSV() {
    const users = getAllUsers();
    if (users.length === 0) {
      alert('कोई यूजर डेटा मौजूद नहीं है (No user records found to export)');
      return;
    }

    const headers = [
      'S.No',
      'User ID',
      'User Role / Type',
      'Full Name',
      'Mobile Number',
      'Email Address',
      'Password',
      'Estt / Office / Dept Name',
      'Estt Code / Emp ID',
      'Designation',
      'Estt Address',
      'Registration Date',
      'Last Login',
      'Total Logins'
    ];
    const rows = users.map((u, i) => [
      i + 1,
      `"${u.id || ''}"`,
      `"${(u.userTypeLabel || u.userType || 'सदस्य').replace(/"/g, '""')}"`,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${u.mobile || ''}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.password || '').replace(/"/g, '""')}"`,
      `"${(u.establishmentName || u.officeName || u.departmentName || '').replace(/"/g, '""')}"`,
      `"${(u.establishmentCode || u.employeeId || '').replace(/"/g, '""')}"`,
      `"${(u.designation || '').replace(/"/g, '""')}"`,
      `"${(u.establishmentAddress || '').replace(/"/g, '""')}"`,
      `"${u.registeredAt || ''}"`,
      `"${u.lastLoginAt || ''}"`,
      u.totalLogins || 1
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sarkari_Portal_Users_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Export Users to JSON
  function exportUsersToJSON() {
    const users = getAllUsers();
    const jsonStr = JSON.stringify(users, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sarkari_Portal_Users_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Generate updated code snippet of IN_CODE_REGISTERED_USERS
  function getUsersCodeSnippet() {
    const users = getAllUsers();
    return JSON.stringify(users, null, 2);
  }

  // =========================================================================
  // Role-Based Access Control (RBAC) Permissions Matrix
  // =========================================================================
  const FORM_ROLE_PERMISSIONS = {
    // 🏢 Employer Forms (नियोक्ता / कंपनी)
    'epfo-form-5a': ['employer'],
    'epfo-rejoining-letter-and-noting': ['employer', 'epfo_staff'],
    'epfo-eps-to-pf-merger': ['employer', 'epfo_staff'],
    'epfo-high-value-claim-verification': ['employer', 'epfo_staff'],
    'epfo-high-value-employer-reply': ['employer'],
    'epfo-high-value-staff-letter': ['epfo_staff'],
    
    // 👥 Multi-Role (Member & Employer Joint Forms)
    'epfo-joint-declaration': ['member', 'employer'],
    'onroll-family-form': ['member', 'employer'],

    // 👨‍💼 Member Forms (EPFO सदस्य / कर्मचारी)
    'epfo-form-31-advance': ['member'],
    'epfo-form-10d': ['member'],
    'epfo-death-claim': ['member'],
    'epfo-composite-claim-aadhar': ['member'],
    'epfo-guest-house-booking': ['member', 'epfo_staff'],

    // 🏛️ EPFO Staff Forms (कार्यालयीन उपयोग / स्टाफ)
    'epfo-revised-annexure-k': ['epfo_staff'],
    'epfo-form13-signature-verification': ['epfo_staff'],
    'epfo-letterhead-noting': ['epfo_staff'],
    'stationery-requirement-form': ['epfo_staff'],
    'stationery-requisition': ['epfo_staff'],

    // 🇮🇳 Central Govt Forms (केंद्रीय सरकार कर्मचारी)
    'tour-programme': ['epfo_staff', 'govt_staff'],
    'gar14a-ta-bill': ['epfo_staff', 'govt_staff'],
    'children-education-allowance': ['epfo_staff', 'govt_staff'],
    'epfo-leave-and-joining': ['epfo_staff', 'govt_staff']
  };

  const ROLE_NAMES = {
    'member': 'EPFO सदस्य (Member)',
    'employer': 'नियोक्ता / कंपनी (Employer)',
    'epfo_staff': 'EPFO कार्यालयीन स्टाफ (Office Staff)',
    'govt_staff': 'अन्य सरकारी कर्मचारी (Govt Staff)'
  };

  function normalizeFormKey(identifier) {
    if (!identifier) return '';
    let key = String(identifier).toLowerCase().trim();
    key = key.split('?')[0].split('#')[0];
    key = key.replace(/\.html$/, '');
    const parts = key.split('/');
    key = parts[parts.length - 1];
    return key;
  }

  function getAllowedRolesForForm(identifier) {
    const key = normalizeFormKey(identifier);
    return FORM_ROLE_PERMISSIONS[key] || ['member', 'employer', 'epfo_staff', 'govt_staff'];
  }

  function getRoleDisplayName(role) {
    return ROLE_NAMES[role] || role;
  }

  function isUserAuthorizedForForm(identifier, user = null) {
    const targetUser = user || getActiveUser();
    if (!targetUser) {
      return {
        authorized: false,
        reason: 'not_logged_in',
        message: 'फॉर्म का उपयोग करने के लिए कृपया पहले लॉगिन करें।'
      };
    }

    // Admin override: Full unrestricted access to ALL 20 forms!
    if (targetUser.userType === 'admin' || targetUser.id === 'USR_ADMIN_01' || (targetUser.email || '').toLowerCase() === 'smart.webpage.storage@gmail.com') {
      return { authorized: true, userRole: 'admin', isAdmin: true };
    }

    const key = normalizeFormKey(identifier);
    const allowed = FORM_ROLE_PERMISSIONS[key];
    if (!allowed) {
      return { authorized: true, userRole: targetUser.userType || 'member' };
    }

    const userRole = targetUser.userType || 'member';
    if (allowed.includes(userRole)) {
      return { authorized: true, userRole };
    }

    const allowedNames = allowed.map(r => getRoleDisplayName(r)).join(' अथवा ');
    const userRoleName = getRoleDisplayName(userRole);

    return {
      authorized: false,
      reason: 'role_mismatch',
      formKey: key,
      userRole: userRole,
      userRoleName: userRoleName,
      allowedRoles: allowed,
      allowedRoleNames: allowedNames,
      message: `🚫 अनाधिकृत पहुंच: यह प्रपत्र केवल [${allowedNames}] के लिए अधिकृत है। आप '[${userRoleName}]' के रूप में लॉगिन हैं।`
    };
  }

  // =========================================================================
  // Form Customizations & Video Hub Persistence APIs
  // =========================================================================
  function getAllFormCustomizations() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CUSTOM_SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function getFormCustomization(formId) {
    const all = getAllFormCustomizations();
    return all[formId] || null;
  }

  function saveFormCustomization(formId, settings) {
    try {
      const all = getAllFormCustomizations();
      all[formId] = { ...(all[formId] || {}), ...settings, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY_CUSTOM_SETTINGS, JSON.stringify(all));
      return { success: true };
    } catch (e) {
      return { success: false, error: e };
    }
  }

  function resetFormCustomization(formId) {
    try {
      const all = getAllFormCustomizations();
      delete all[formId];
      localStorage.setItem(STORAGE_KEY_CUSTOM_SETTINGS, JSON.stringify(all));
      localStorage.removeItem('form_override_' + formId);
      return { success: true };
    } catch (e) {
      return { success: false, error: e };
    }
  }

  // =========================================================================
  // Custom Noting, Official Letters & Orders Hub (Admin Dynamic Templates)
  // =========================================================================
  function getAllCustomLetters() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CUSTOM_LETTERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Could not read custom letters:', e);
      return [];
    }
  }

  function getCustomLetterById(letterId) {
    if (!letterId) return null;
    const all = getAllCustomLetters();
    return all.find(item => item.id === letterId) || null;
  }

  async function saveCustomLetter(letterData) {
    const letters = getAllCustomLetters();
    if (!letterData.id) {
      letterData.id = 'LETTER_' + Date.now();
      letterData.createdAt = new Date().toLocaleString('hi-IN');
      letters.unshift(letterData);
    } else {
      const idx = letters.findIndex(l => l.id === letterData.id);
      letterData.updatedAt = new Date().toLocaleString('hi-IN');
      if (idx >= 0) {
        letters[idx] = letterData;
      } else {
        letters.unshift(letterData);
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_LETTERS, JSON.stringify(letters));
    } catch (e) {
      console.error('Could not save custom letter to localStorage:', e);
      return { success: false, error: e };
    }

    // Realtime broadcast so portal updates immediately
    try {
      window.dispatchEvent(new CustomEvent('portalCustomLettersChanged', { detail: { letter: letterData } }));
    } catch (e) {}

    // Firestore Sync
    initFirebase();
    if (firestoreDb) {
      try {
        await firestoreDb.collection('custom_letters').doc(letterData.id).set(letterData, { merge: true });
      } catch (err) {
        console.warn('Firestore custom letter sync notice:', err);
      }
    }

    return { success: true, letter: letterData };
  }

  async function deleteCustomLetter(letterId) {
    let letters = getAllCustomLetters();
    letters = letters.filter(l => l.id !== letterId);

    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_LETTERS, JSON.stringify(letters));
    } catch (e) {
      console.error('Could not update custom letters in localStorage:', e);
    }

    try {
      window.dispatchEvent(new CustomEvent('portalCustomLettersChanged', { detail: { deletedId: letterId } }));
    } catch (e) {}

    initFirebase();
    if (firestoreDb) {
      try {
        await firestoreDb.collection('custom_letters').doc(letterId).delete();
      } catch (err) {
        console.warn('Firestore custom letter delete notice:', err);
      }
    }

    return { success: true };
  }

  // =========================================================================
  // Department Management System (Dynamic Department Tabs & Categories)
  // =========================================================================
  const DEFAULT_DEPARTMENTS = [
    {
      id: 'epfo-member',
      icon: '👨‍💼',
      title: 'EPFO सदस्य प्रपत्र (EPFO Member Services)',
      shortName: 'EPFO सदस्य (Member)',
      subtitle: 'PF Advance 31, पेंशन 10D, मृत्यु दावा, पुनर्विवाह घोषणा',
      desc: 'पीएफ अग्रिम निकासी (Form 31), मासिक पेंशन (Form 10-D), मृत्यु दावा कंपोजिट फॉर्म, आधार कंपोजिट दावा (19/10C/31), पुनर्विवाह न करने का घोषणा-पत्र, संयुक्त घोषणा, ऑन-रोल व गेस्ट हाउस प्रपत्र।',
      color: '#0284c7',
      isDefault: true
    },
    {
      id: 'epfo-employer',
      icon: '🏢',
      title: 'EPFO नियोक्ता प्रपत्र (EPFO Employer Services)',
      shortName: 'EPFO नियोक्ता (Employer)',
      subtitle: 'Rejoining, Form 5A, NCP Days, Exit Reason',
      desc: 'पुनः कार्यग्रहण पत्र (Rejoining Letter), गलत NCP Days स्पष्टीकरण पत्र, नौकरी छोड़ने का कारण (Reason of Exit) संशोधन पत्र, स्वामित्व रिटर्न (Form 5-A), फॉर्म-13 हस्ताक्षर सत्यापन, ईपीएस अंशदान विलय व संयुक्त घोषणा।',
      color: '#059669',
      isDefault: true
    },
    {
      id: 'epfo-staff',
      icon: '🏛️',
      title: 'EPFO कार्यालयीन प्रपत्र (EPFO Staff & Office Notes)',
      shortName: 'EPFO स्टाफ (Office)',
      subtitle: 'Noting Sheet, Annexure-K, टूर बिल',
      desc: 'विधिक नोटिंग शीट (Rejoining Legal Note), संशोधित एनेक्सचर-K, कार्यालयीन नोटिंग, टूर प्रोग्राम, स्टेशनरी मांग पत्र, गेस्ट हाउस एवं अवकाश आवेदन।',
      color: '#d97706',
      isDefault: true
    },
    {
      id: 'govt',
      icon: '🇮🇳',
      title: 'सरकारी कर्मचारी प्रपत्र (Govt Employee Forms)',
      shortName: 'सरकारी कर्मचारी (Govt)',
      subtitle: 'GAR 14-A, CEA, टूर प्रोग्राम, लीव रिपोर्ट',
      desc: 'यात्रा भत्ता बिल (GAR 14-A TA Bill), बाल शिक्षा भत्ता (CEA), टूर प्रोग्राम, आधिकारिक अवकाश एवं कार्यभार ग्रहण रिपोर्ट, स्टेशनरी प्रपत्र।',
      color: '#dc2626',
      isDefault: true
    },
    {
      id: 'uidai',
      icon: '🆔',
      title: 'भारतीय विशिष्ट पहचान प्राधिकरण (UIDAI / Aadhaar)',
      shortName: 'आधार / UIDAI',
      subtitle: 'राजपत्रित अधिकारी मानक प्रमाणपत्र (A4)',
      desc: 'आधार एनरोलमेंट व सुधार हेतु राजपत्रित अधिकारी, सांसद, विधायक, तहसीलदार एवं मान्यता प्राप्त शिक्षण संस्थान द्वारा जारी 1-पेज A4 मानक प्रमाणपत्र।',
      color: '#ea580c',
      isDefault: true
    },
    {
      id: 'incometax',
      icon: '💰',
      title: 'आयकर विभाग (Income Tax Department)',
      shortName: 'आयकर (Income Tax)',
      subtitle: 'Form 15G - शून्य TDS स्व-घोषणा',
      desc: 'आयकर अधिनियम की धारा 197A(1) के तहत ईपीएफ निकासी या ब्याज आय पर शून्य टीडीएस कटौती हेतु वरिष्ठ एवं गैर-वरिष्ठ नागरिकों का घोषणा पत्र।',
      color: '#16a34a',
      isDefault: true
    },
    {
      id: 'rto',
      icon: '🚗',
      title: 'परिवहन विभाग (RTO / Parivahan)',
      shortName: 'परिवहन / RTO',
      subtitle: 'Form 29 & 30 - वाहन स्वामित्व अंतरण',
      desc: 'मोटर वाहन अधिनियम 1988 के तहत खरीदार एवं विक्रेता द्वारा उपयोग हेतु वाहन स्वामित्व अंतरण, सूचना एवं अधिकारिक अनापत्ति (NOC) सेट।',
      color: '#0891b2',
      isDefault: true
    }
  ];

  function getCustomDepartments() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CUSTOM_DEPARTMENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Could not read custom departments:', e);
      return [];
    }
  }

  function getAllDepartments() {
    const custom = getCustomDepartments();
    const list = [...DEFAULT_DEPARTMENTS];
    custom.forEach(cd => {
      const idx = list.findIndex(d => d.id === cd.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...cd };
      } else {
        list.push(cd);
      }
    });
    return list;
  }

  function getDepartmentById(deptId) {
    if (!deptId) return null;
    return getAllDepartments().find(d => d.id === deptId) || null;
  }

  async function saveCustomDepartment(deptData) {
    if (!deptData || !deptData.title) {
      return { success: false, message: 'विभाग का नाम आवश्यक है।' };
    }
    let id = deptData.id || '';
    if (!id) {
      id = 'dept_' + (deptData.shortName || deptData.title).toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      if (!id || id === 'dept_') id = 'dept_' + Date.now();
    }
    deptData.id = id;
    deptData.icon = deptData.icon || '📁';
    deptData.shortName = deptData.shortName || deptData.title;
    deptData.subtitle = deptData.subtitle || 'विभागीय आधिकारिक प्रपत्र व पत्र';
    deptData.desc = deptData.desc || (deptData.title + ' हेतु ऑनलाइन भरने एवं प्रिंट करने योग्य प्रपत्र।');
    deptData.color = deptData.color || '#0284c7';
    deptData.isDefault = false;
    deptData.updatedAt = new Date().toISOString();

    const custom = getCustomDepartments();
    const idx = custom.findIndex(d => d.id === id);
    if (idx >= 0) {
      custom[idx] = deptData;
    } else {
      custom.push(deptData);
    }

    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_DEPARTMENTS, JSON.stringify(custom));
    } catch (e) {
      console.error('Could not save custom department to localStorage:', e);
      return { success: false, error: e };
    }

    try {
      window.dispatchEvent(new CustomEvent('portalDepartmentsChanged', { detail: { department: deptData } }));
    } catch (e) {}

    // Firestore Sync
    initFirebase();
    if (firestoreDb) {
      try {
        await firestoreDb.collection('custom_departments').doc(id).set(deptData, { merge: true });
        console.log('Department synced to Firestore:', id);
      } catch (err) {
        console.warn('Firestore department sync error:', err);
      }
    }

    return { success: true, department: deptData };
  }

  async function deleteCustomDepartment(deptId) {
    if (!deptId) return { success: false };
    if (DEFAULT_DEPARTMENTS.some(d => d.id === deptId)) {
      return { success: false, message: 'डिफ़ॉल्ट सरकारी विभाग हटाया नहीं जा सकता।' };
    }

    let custom = getCustomDepartments();
    custom = custom.filter(d => d.id !== deptId);

    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_DEPARTMENTS, JSON.stringify(custom));
    } catch (e) {
      console.error('Could not update custom departments:', e);
    }

    try {
      window.dispatchEvent(new CustomEvent('portalDepartmentsChanged', { detail: { deletedId: deptId } }));
    } catch (e) {}

    initFirebase();
    if (firestoreDb) {
      try {
        await firestoreDb.collection('custom_departments').doc(deptId).delete();
      } catch (err) {
        console.warn('Firestore department delete notice:', err);
      }
    }

    return { success: true };
  }

  async function fetchCustomDepartmentsFromFirestore() {
    initFirebase();
    if (!firestoreDb) return getAllDepartments();
    try {
      const snapshot = await firestoreDb.collection('custom_departments').get();
      const firestoreDepts = [];
      snapshot.forEach(doc => {
        firestoreDepts.push(doc.data());
      });
      if (firestoreDepts.length > 0) {
        const local = getCustomDepartments();
        firestoreDepts.forEach(fd => {
          const idx = local.findIndex(d => d.id === fd.id);
          if (idx === -1) {
            local.push(fd);
          } else {
            local[idx] = { ...local[idx], ...fd };
          }
        });
        localStorage.setItem(STORAGE_KEY_CUSTOM_DEPARTMENTS, JSON.stringify(local));
        try {
          window.dispatchEvent(new CustomEvent('portalDepartmentsChanged', { detail: { count: firestoreDepts.length } }));
        } catch (e) {}
      }
      return getAllDepartments();
    } catch (e) {
      console.warn('Could not fetch custom departments from Firestore:', e);
      return getAllDepartments();
    }
  }

  async function fetchCustomLettersFromFirestore() {
    initFirebase();
    if (!firestoreDb) return getAllCustomLetters();
    try {
      const snapshot = await firestoreDb.collection('custom_letters').get();
      const firestoreLetters = [];
      snapshot.forEach(doc => {
        firestoreLetters.push(doc.data());
      });
      if (firestoreLetters.length > 0) {
        const local = getAllCustomLetters();
        firestoreLetters.forEach(fl => {
          const idx = local.findIndex(l => l.id === fl.id);
          if (idx === -1) {
            local.push(fl);
          } else {
            local[idx] = { ...local[idx], ...fl };
          }
        });
        localStorage.setItem(STORAGE_KEY_CUSTOM_LETTERS, JSON.stringify(local));
        try {
          window.dispatchEvent(new CustomEvent('portalCustomLettersChanged', { detail: { count: firestoreLetters.length } }));
        } catch (e) {}
      }
      return getAllCustomLetters();
    } catch (e) {
      console.warn('Could not fetch custom letters from Firestore:', e);
      return getAllCustomLetters();
    }
  }

  // =========================================================================
  // Official Pre-existing Letters & Notings Content Overrides (Firestore + Local)
  // =========================================================================
  const OFFICIAL_LETTER_TEMPLATES = {
    'epfo-rejoining-letter': {
      letterKey: 'epfo-rejoining-letter',
      name: 'EPFO Rejoining Request Letter (पुनः कार्यग्रहण अनुरोध पत्र)',
      file: 'epfo-rejoining-letter-and-noting.html?tab=employer',
      docType: 'letter',
      officeHeader: 'ESTABLISHMENT / COMPANY NAME HERE',
      officeAddress: 'ESTABLISHMENT ADDRESS & CONTACT DETAILS',
      refNo: 'REF: EST/REJOIN/2026/____',
      recipient: "To,\nThe Regional P.F. Commissioner,\nEmployees' Provident Fund Organisation,\nRegional Office, Faridabad (Haryana).",
      subject: "Transfer of remaining accumulation and correction in Date of Joining in r/o Shri/Smt. ____________, UAN: ____________",
      mainContent: "Sir/Madam,\n\nWith reference to the subject cited above, it is submitted that the above named employee was reinstated/rejoined into the services of our establishment following the orders of the Hon'ble Court / competent authority.\n\nIn accordance with the directives and service record regularisation, you are kindly requested to process the transfer of remaining PF accumulations, update the service history, and effect necessary corrections in the Date of Joining in EPFO database.\n\nThe detailed particulars of the member along with certified copies of rejoining orders, attendance register, and identity documents are enclosed herewith for your kind consideration and necessary verification.",
      signatory: "Authorized Signatory / For Establishment\n[Sign & Seal of Employer]"
    },
    'epfo-rejoining-noting': {
      letterKey: 'epfo-rejoining-noting',
      name: 'EPFO Rejoining Legal Office Note (विधिक कार्यालयीन नोटिंग)',
      file: 'epfo-rejoining-letter-and-noting.html?tab=noting',
      docType: 'noting',
      officeHeader: "कर्मचारी भविष्य निधि संगठन / EMPLOYEES' PROVIDENT FUND ORGANISATION\nक्षेत्रीय कार्यालय, फरीदाबाद (हरियाणा) / Regional Office, Faridabad",
      officeAddress: 'विधिक एवं सेवा बहाली कार्यालयीन नोटिंग (LEGAL OFFICE NOTE SHEET)',
      refNo: 'EPFO/RO/FBD/LEGAL/REJOIN/2026/____',
      recipient: "सक्षम प्राधिकारी के अवलोकन एवं आदेशार्थ प्रस्तुत (Submitted for Orders)",
      subject: "विधिक एवं सेवा बहाली पश्चात पीएफ अंशदान अंतरण एवं कार्यग्रहण तिथि सुधार बाबत — श्री/श्रीमती ____________, UAN: ____________",
      mainContent: "प्रस्तुत प्रकरण में नियोक्ता द्वारा माननीय न्यायालय/सक्षम प्राधिकारी के आदेशोपरांत कर्मचारी के पुनः कार्यग्रहण (Rejoining) तथा शेष पीएफ संचय अंतरण व कार्यग्रहण तिथि में संशोधन हेतु अनुरोध पत्र प्रस्तुत किया गया है।\n\nस्थापना के रिकॉर्ड एवं नियोक्ता द्वारा प्रस्तुत प्रमाण पत्रों की प्रारंभिक जांच कर ली गई है। सदस्य का ईपीएस एवं ईपीएफ अंशदान विवरण नियमानुसार सत्यापित किया जाना अपेक्षित है।\n\nउक्त के आलोक में, यदि अनुमोदित हो तो, सदस्य के सेवा इतिहास को नियमित करने तथा पीएफ संचय के अंतरण/संशोधन हेतु सक्षम अधिकारी का अनुमोदन प्राप्त करने हेतु नोट प्रस्तुत है।",
      signatory: "लिपिक (Dealing Assistant) • अनुभाग पर्यवेक्षक (Section Supervisor) • APFC • RPFC"
    },
    'epfo-eps-merger-letter': {
      letterKey: 'epfo-eps-merger-letter',
      name: 'EPFO EPS to EPF Merger Employer Letter (ईपीएस से ईपीएफ अंशदान अंतरण पत्र)',
      file: 'epfo-eps-to-pf-merger.html?view=letter',
      docType: 'letter',
      officeHeader: 'ESTABLISHMENT / EMPLOYER LETTERHEAD',
      officeAddress: 'REGISTERED OFFICE ADDRESS & EST CODE',
      refNo: 'EST/EPS-MERGE/2026/____',
      recipient: "To,\nThe Regional P.F. Commissioner,\nEmployees' Provident Fund Organisation,\nRegional Office, Faridabad (Haryana).",
      subject: "Request for Merger of EPS Pension Contribution into EPF Main Account in r/o Excluded / Past Service Employee",
      mainContent: "Sir/Madam,\n\nWith reference to the subject cited above, we submit that the EPS contribution of the subject member was inadvertently deposited or requires merger into the EPF main account as per the statutory scheme provisions and wage ceiling directives.\n\nWe hereby confirm the wage and contribution details and request that the necessary adjustment/merger from Pension Fund to Provident Fund account be carried out at the earliest.",
      signatory: "Authorized Signatory / For Establishment\n[Sign & Seal of Employer]"
    },
    'epfo-eps-merger-noting': {
      letterKey: 'epfo-eps-merger-noting',
      name: 'EPFO EPS to EPF Merger Office Note Sheet (ईपीएस अंतरण कार्यालयीन नोटशीट)',
      file: 'epfo-eps-to-pf-merger.html?view=noting',
      docType: 'noting',
      officeHeader: "कर्मचारी भविष्य निधि संगठन / EMPLOYEES' PROVIDENT FUND ORGANISATION\nक्षेत्रीय कार्यालय, फरीदाबाद (हरियाणा)",
      officeAddress: 'कार्यालयीन नोटिंग शीट (OFFICE NOTE SHEET) — अंशदान समायोजन अनुभाग',
      refNo: 'EPFO/RO/FBD/ACCOUNTS/MERGER/2026/____',
      recipient: "सहायक भविष्य निधि आयुक्त (लेखा) के विचारार्थ प्रस्तुत",
      subject: "ईपीएस पेंशन अंशदान को ईपीएफ मुख्य खाते में अंतरण एवं समायोजन बाबत",
      mainContent: "प्रस्तुत प्रकरण में प्रतिष्ठान द्वारा सदस्य के ईपीएस अंशदान को ईपीएफ खाते में समायोजित करने हेतु पत्र प्रस्तुत किया गया है। सदस्य के वेतन विवरण एवं अंशदान की प्रविष्टियों का मिलान किया गया है।\n\nनियमों के अनुसार यदि सदस्य पेंशन योजना के अंतर्गत अपात्र अथवा गैर-सदस्यता श्रेणी में आता है, तो अंतरण किया जाना विधिसम्मत है। कृपया अनुमोदन प्रदान करने का कष्ट करें।",
      signatory: "वरिष्ठ सामाजिक सुरक्षा सहायक (SSSA) • अनुभाग पर्यवेक्षक (SS) • सहायक आयुक्त (APFC)"
    },
    'epfo-high-value-letter': {
      letterKey: 'epfo-high-value-letter',
      name: 'EPFO High Value Claim KYC Email Verification Letter (उच्च मूल्य दावा सत्यापन पत्र)',
      file: 'epfo-high-value-claim-verification.html',
      docType: 'letter',
      officeHeader: "कर्मचारी भविष्य निधि संगठन / EMPLOYEES' PROVIDENT FUND ORGANISATION",
      officeAddress: "क्षेत्रीय कार्यालय, फरीदाबाद (हरियाणा) / Regional Office, Faridabad",
      refNo: 'EPFO/RO/FBD/HVC/VERIFY/2026/____',
      recipient: "To,\nThe Authorized Signatory,\n[Establishment Name & Code]",
      subject: "Verification of High Value Claim KYC / Bank / Service Details in r/o Member Shri/Smt. ____________",
      mainContent: "Sir/Madam,\n\nAn online final withdrawal/advance claim of high value has been received from the subject member. In accordance with head office fraud-prevention circulars, you are requested to verify whether the member was actually employed, the bank account details match establishment records, and no discrepancy exists.\n\nPlease furnish your verification reply along with attendance/wage register copy within 3 working days.",
      signatory: "Assistant P.F. Commissioner / Section Supervisor (Claims)\nEPFO, RO Faridabad"
    },
    'epfo-form13-letter': {
      letterKey: 'epfo-form13-letter',
      name: 'EPFO Form-13 Signature Verification Letter (हस्ताक्षर एवं सदस्य विवरण सत्यापन पत्र)',
      file: 'epfo-form13-signature-verification.html',
      docType: 'letter',
      officeHeader: "कर्मचारी भविष्य निधि संगठन / EMPLOYEES' PROVIDENT FUND ORGANISATION",
      officeAddress: "क्षेत्रीय कार्यालय, फरीदाबाद (हरियाणा) / Regional Office, Faridabad",
      refNo: 'EPFO/RO/FBD/TRANSFER/F13/2026/____',
      recipient: "To,\nThe Regional P.F. Commissioner / Employer,\n[Previous Office / Establishment Details]",
      subject: "Verification of Member Signature and Service Particulars on Online Transfer Claim (Form-13)",
      mainContent: "Sir/Madam,\n\nWith reference to Form-13 transfer application submitted by the member for transferring PF balance from previous account to current account, you are requested to verify the member's specimen signature and service dates as per your office record.\n\nYour early confirmation will facilitate expeditious settlement of the transfer claim.",
      signatory: "Section Supervisor (Transfer Section)\nEPFO, RO Faridabad"
    },
    'stationery-indent-noting': {
      letterKey: 'stationery-indent-noting',
      name: 'EPFO Stationery Indent & Office Note Sheet (स्टेशनरी मांग नोटशीट)',
      file: 'stationery-requirement-form.html',
      docType: 'noting',
      officeHeader: "कर्मचारी भविष्य निधि संगठन / EMPLOYEES' PROVIDENT FUND ORGANISATION",
      officeAddress: 'प्रशासन / केयरटेकर अनुभाग — कार्यालयीन स्टेशनरी मांग नोट',
      refNo: 'EPFO/RO/FBD/CT/STATIONERY/2026/____',
      recipient: "प्रशासनिक अधिकारी / सहायक आयुक्त (प्रशासन) के अनुमोदनार्थ",
      subject: "अनुभागों हेतु आवश्यक स्टेशनरी एवं प्रपत्रों की मांग व निर्गम बाबत",
      mainContent: "कार्यालय के विभिन्न अनुभागों के सुचारु कार्य संचालन हेतु आवश्यक स्टेशनरी सामग्री (जैसे A4 पेपर रिम, रजिस्टर, पेन, फाइल कवर इत्यादि) की मांग सूची संलग्न है।\n\nस्टॉक रजिस्टर के अनुसार वर्तमान शेष न्यूनतम स्तर पर पहुंच चुका है। अतः संलग्न मांग पत्र अनुसार स्टेशनरी क्रय/निर्गम की स्वीकृति हेतु नोट प्रस्तुत है।",
      signatory: "केयरटेकर / कनिष्ठ सहायक • अनुभाग पर्यवेक्षक (प्रशासन) • APFC (प्रशासन)"
    },
    'epfo-letterhead-noting-tpl': {
      letterKey: 'epfo-letterhead-noting-tpl',
      name: 'EPFO Blank Letterhead & Official Noting Sheet (लेटरहेड व नोटशीट)',
      file: 'epfo-letterhead-noting.html',
      docType: 'noting',
      officeHeader: "कर्मचारी भविष्य निधि संगठन / EMPLOYEES' PROVIDENT FUND ORGANISATION",
      officeAddress: 'क्षेत्रीय कार्यालय, फरीदाबाद (हरियाणा) | दूरभाष: 0129-2422000',
      refNo: 'पत्रांक / File No.: EPFO/RO/FBD/2026/____',
      recipient: 'कार्यालयीन टिप्पणी एवं पत्राचार हेतु (Official Note / Letter)',
      subject: 'कार्यालयीन विषय यहाँ लिखें (Subject of Noting / Letter)',
      mainContent: 'यहाँ आधिकारिक टिप्पणी अथवा शासकीय पत्र का मुख्य विवरण लिखें। आप इसमें आवश्यकतानुसार पैराग्राफ, संदर्भ और विधिक तथ्य दर्ज कर सकते हैं।',
      signatory: 'अधिकृत हस्ताक्षरकर्ता (Authorized Signatory)'
    }
  };

  function getAllOfficialLetterTemplates() {
    return OFFICIAL_LETTER_TEMPLATES;
  }

  function getLetterCustomization(letterKey) {
    if (!letterKey) return null;
    try {
      const saved = localStorage.getItem('portal_letter_custom_' + letterKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading letter customization from local storage:', e);
    }
    return OFFICIAL_LETTER_TEMPLATES[letterKey] || null;
  }

  async function saveLetterCustomization(letterKey, data) {
    if (!letterKey) return { success: false, message: 'अमान्य प्रपत्र कुंजी (Invalid letter key)' };
    data.letterKey = letterKey;
    data.updatedAt = new Date().toLocaleString('hi-IN');
    data.updatedTimestamp = Date.now();

    // 1. Instant local persistence
    try {
      localStorage.setItem('portal_letter_custom_' + letterKey, JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage save warning:', e);
    }

    // 2. Broadcast realtime event
    try {
      window.dispatchEvent(new CustomEvent('portalLetterCustomizationChanged', { detail: { letterKey, data } }));
    } catch (e) {}

    // 3. Save to Firebase Cloud Firestore
    let firestoreSuccess = false;
    try {
      const db = await ensureFirebaseLoaded();
      if (db) {
        await db.collection('portal_letter_customizations').doc(letterKey).set(data, { merge: true });
        firestoreSuccess = true;
        console.log('🎉 Letter customization saved to Firebase Firestore:', letterKey);
      }
    } catch (err) {
      console.error('Firestore saveLetterCustomization error:', err);
    }

    return { success: true, firestore: firestoreSuccess, data: data };
  }

  async function fetchLetterCustomizationFromFirestore(letterKey) {
    try {
      const db = await ensureFirebaseLoaded();
      if (db) {
        const doc = await db.collection('portal_letter_customizations').doc(letterKey).get();
        if (doc && doc.exists) {
          const cloudData = doc.data();
          localStorage.setItem('portal_letter_custom_' + letterKey, JSON.stringify(cloudData));
          return cloudData;
        }
      }
    } catch (e) {
      console.warn('Firestore fetch letter customization warning:', e);
    }
    return getLetterCustomization(letterKey);
  }

  async function resetLetterCustomization(letterKey) {
    try {
      localStorage.removeItem('portal_letter_custom_' + letterKey);
      const db = await ensureFirebaseLoaded();
      if (db) {
        try {
          await db.collection('portal_letter_customizations').doc(letterKey).delete();
        } catch (e) {}
      }
      return { success: true };
    } catch (e) {
      console.warn('Error resetting letter customization:', e);
      return { success: false, error: e };
    }
  }


  // =========================================================================
  // IndexedDB Media Storage for Uploaded Video Files
  // =========================================================================
  const DB_NAME = 'sarkari_forms_media_db';
  const DB_VERSION = 1;
  const STORE_NAME = 'videos';

  function openMediaDB() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve(null);
        return;
      }
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => {
          console.warn('IndexedDB open error:', e.target.error);
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB not supported or accessible', err);
        resolve(null);
      }
    });
  }

  function storeVideoBlob(id, file) {
    return openMediaDB().then(db => {
      if (!db) return Promise.reject(new Error('IndexedDB storage is not supported in this browser.'));
      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put({
            id: id,
            file: file,
            name: file.name || 'uploaded_video.mp4',
            type: file.type || 'video/mp4',
            size: file.size || 0,
            updatedAt: Date.now()
          });
          req.onsuccess = () => resolve(true);
          req.onerror = (e) => reject(e.target.error);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  function getVideoBlob(id) {
    return openMediaDB().then(db => {
      if (!db) return Promise.resolve(null);
      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(id);
          req.onsuccess = () => resolve(req.result ? req.result.file : null);
          req.onerror = (e) => {
            console.warn('Error reading video blob:', e.target.error);
            resolve(null);
          };
        } catch (e) {
          resolve(null);
        }
      });
    });
  }

  function deleteVideoBlob(id) {
    return openMediaDB().then(db => {
      if (!db) return Promise.resolve(true);
      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.delete(id);
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch (e) {
          resolve(false);
        }
      });
    });
  }

  function formatYouTubeEmbedUrl(url) {
    if (!url) return '';
    url = url.trim();
    if (url.includes('embed/')) return url;
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
    return url;
  }

  function getAllCustomVideos() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CUSTOM_VIDEOS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  async function saveCustomVideo(videoObj, fileBlob = null) {
    try {
      const all = getAllCustomVideos();
      const videoId = videoObj.id || ('VID_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
      videoObj.id = videoId;

      if (fileBlob) {
        await storeVideoBlob(videoId, fileBlob);
        videoObj.hasFileBlob = true;
        videoObj.fileName = fileBlob.name || 'uploaded_video.mp4';
        videoObj.fileSize = fileBlob.size ? (fileBlob.size / (1024 * 1024)).toFixed(2) + ' MB' : '';
        videoObj.fileType = fileBlob.type || 'video/mp4';
        videoObj.url = ''; // file takes precedence
      } else if (videoObj.url) {
        videoObj.url = formatYouTubeEmbedUrl(videoObj.url);
        videoObj.hasFileBlob = false;
      }

      const existingIdx = all.findIndex(v => v.id === videoId);
      if (existingIdx >= 0) {
        all[existingIdx] = { ...all[existingIdx], ...videoObj, updatedAt: new Date().toISOString() };
      } else {
        all.unshift({
          ...videoObj,
          createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        });
      }
      localStorage.setItem(STORAGE_KEY_CUSTOM_VIDEOS, JSON.stringify(all));
      return { success: true, video: videoObj };
    } catch (e) {
      console.error('Error in saveCustomVideo:', e);
      return { success: false, error: e };
    }
  }

  async function deleteCustomVideo(videoId) {
    try {
      let all = getAllCustomVideos();
      all = all.filter(v => v.id !== videoId);
      localStorage.setItem(STORAGE_KEY_CUSTOM_VIDEOS, JSON.stringify(all));
      await deleteVideoBlob(videoId);
      return { success: true };
    } catch (e) {
      return { success: false, error: e };
    }
  }

  async function resolveVideoPlaySource(videoObj) {
    if (!videoObj) return null;
    if (videoObj.hasFileBlob) {
      const blob = await getVideoBlob(videoObj.id);
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        return { type: 'file', url: objectUrl, mimeType: videoObj.fileType || 'video/mp4' };
      }
    }
    if (videoObj.url) {
      const embedUrl = formatYouTubeEmbedUrl(videoObj.url);
      return { type: 'iframe', url: embedUrl };
    }
    return null;
  }

  // =========================================================================
  // 12. Master Gatekeeper: Require Login for Print & Download
  // =========================================================================
  // 12. Master Gatekeeper: Require Login for Print & Download
  //     डिफॉल्ट रूप से यह FALSE (खुला मोड) रहता है।
  //     एडमिन पैनल से ON करने पर ही प्रिंट / डाउनलोड के समय लॉगिन मांगा जाएगा।
  // =========================================================================
  function isLoginRequiredForPrint() {
    try {
      const val = localStorage.getItem(STORAGE_KEY_LOGIN_REQUIRED_FOR_PRINT);
      return val === 'true';
    } catch (e) {
      return false;
    }
  }

  function setLoginRequiredForPrint(enabled) {
    try {
      const boolVal = Boolean(enabled);
      localStorage.setItem(STORAGE_KEY_LOGIN_REQUIRED_FOR_PRINT, boolVal ? 'true' : 'false');
      
      // Real-time Cloud Sync to Firebase Firestore
      initFirebase();
      if (firestoreDb) {
        firestoreDb.collection('portal_settings').doc('gatekeeper').set({
          loginRequiredForPrint: boolVal,
          updatedAt: new Date().toISOString()
        }, { merge: true }).then(() => {
          console.log('✅ Gatekeeper status synced to Cloud Firestore:', boolVal);
        }).catch(err => {
          console.warn('Firestore gatekeeper sync notice:', err);
        });
      }
      return boolVal;
    } catch (e) {
      console.warn('Could not save login required setting:', e);
      return false;
    }
  }

  async function syncGatekeeperFromFirestore() {
    try {
      initFirebase();
      if (!firestoreDb) return isLoginRequiredForPrint();
      const doc = await firestoreDb.collection('portal_settings').doc('gatekeeper').get();
      if (doc && doc.exists) {
        const data = doc.data();
        if (data && typeof data.loginRequiredForPrint === 'boolean') {
          const remoteVal = data.loginRequiredForPrint;
          localStorage.setItem(STORAGE_KEY_LOGIN_REQUIRED_FOR_PRINT, remoteVal ? 'true' : 'false');
          window.dispatchEvent(new CustomEvent('gatekeeperSettingsUpdated', { detail: { enabled: remoteVal } }));
          return remoteVal;
        }
      }
    } catch (e) {
      console.warn('Firestore gatekeeper sync notice:', e);
    }
    return isLoginRequiredForPrint();
  }

  let pendingPrintAction = null;

  function triggerPrintAuthModal(actionType = 'print', onSuccessCallback = null) {
    pendingPrintAction = onSuccessCallback;

    // Check if main portal auth modal exists
    const portalAuthModal = document.getElementById('authGateModal');
    if (portalAuthModal && typeof window.openAuthModal === 'function') {
      window.openAuthModal(null, 'signin');
      return;
    }

    // Otherwise, ensure dedicated standalone Print Auth Modal is injected into the DOM
    ensurePrintAuthModalDOM();
    const modal = document.getElementById('printGateAuthModal');
    if (modal) {
      const actionTextEl = document.getElementById('printGateActionText');
      if (actionTextEl) {
        actionTextEl.textContent = actionType === 'download' 
          ? 'प्रपत्र की PDF फाइल डाउनलोड करने के लिए कृपया साइन इन या रजिस्टर करें।'
          : 'प्रपत्र का प्रिंट (Print) निकालने के लिए कृपया साइन इन या रजिस्टर करें।';
      }
      modal.classList.add('active');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function ensurePrintAuthModalDOM() {
    if (document.getElementById('printGateAuthModal')) return;

    const modalHtml = `
      <div id="printGateAuthModal" style="display:none; position:fixed; inset:0; background:rgba(15,23,42,0.85); backdrop-filter:blur(6px); z-index:9999999; align-items:center; justify-content:center; padding:16px; font-family:'Plus Jakarta Sans','Noto Sans Devanagari',sans-serif;">
        <div style="background:#ffffff; border-radius:16px; width:100%; max-width:480px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); border:1px solid #e2e8f0; overflow:hidden; animation:pgFadeIn 0.25s ease-out;">
          <div style="background:linear-gradient(135deg, #0284c7, #0369a1); color:#ffffff; padding:18px 20px; display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:20px;">🔒</span>
                <h3 style="font-size:17px; font-weight:800; margin:0;">प्रिंट एवं डाउनलोड सुरक्षा</h3>
              </div>
              <p id="printGateActionText" style="font-size:12.5px; opacity:0.92; margin-top:5px; line-height:1.4;">
                प्रपत्र का प्रिंट निकालने या PDF डाउनलोड करने के लिए कृपया साइन इन करें।
              </p>
            </div>
            <button type="button" id="btnClosePrintGate" style="background:rgba(255,255,255,0.2); border:none; color:#ffffff; width:30px; height:30px; border-radius:50%; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; line-height:1;" title="बंद करें">✕</button>
          </div>

          <div style="padding:16px 20px 20px;">
            <!-- Tabs -->
            <div style="display:flex; gap:8px; border-bottom:1.5px solid #e2e8f0; padding-bottom:10px; margin-bottom:16px;">
              <button type="button" id="pgTabSignIn" style="flex:1; padding:8px 12px; font-size:13px; font-weight:700; border:none; border-radius:6px; cursor:pointer; background:#e0f2fe; color:#0369a1;">
                👤 साइन इन (Sign In)
              </button>
              <button type="button" id="pgTabSignUp" style="flex:1; padding:8px 12px; font-size:13px; font-weight:700; border:none; border-radius:6px; cursor:pointer; background:#f1f5f9; color:#64748b;">
                📝 नया खाता (Register)
              </button>
            </div>

            <!-- Error Notice -->
            <div id="pgAuthError" style="display:none; background:#fee2e2; color:#dc2626; padding:8px 12px; border-radius:6px; font-size:12px; font-weight:600; margin-bottom:14px; border:1px solid #fca5a5;"></div>

            <!-- Sign In Pane -->
            <form id="pgSignInForm">
              <div style="margin-bottom:12px;">
                <label style="display:block; font-size:12px; font-weight:700; color:#334155; margin-bottom:4px;">ईमेल आईडी अथवा मोबाइल नंबर *</label>
                <input type="text" id="pgSignInEmail" placeholder="उदा. 8700383426 या email@example.com" required style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:13px; box-sizing:border-box;">
              </div>
              <div style="margin-bottom:16px;">
                <label style="display:block; font-size:12px; font-weight:700; color:#334155; margin-bottom:4px;">पासवर्ड (Password) *</label>
                <input type="password" id="pgSignInPassword" placeholder="अपना पासवर्ड दर्ज करें" required style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:13px; box-sizing:border-box;">
              </div>
              <button type="submit" style="width:100%; padding:11px; background:linear-gradient(135deg, #0284c7, #0369a1); color:#ffffff; border:none; border-radius:8px; font-size:14px; font-weight:800; cursor:pointer; box-shadow:0 2px 8px rgba(2,132,199,0.3);">
                ✅ साइन इन करें एवं प्रिंट जारी रखें
              </button>
            </form>

            <!-- Sign Up Pane -->
            <form id="pgSignUpForm" style="display:none;">
              <div style="margin-bottom:10px;">
                <label style="display:block; font-size:12px; font-weight:700; color:#334155; margin-bottom:4px;">पूरा नाम (Full Name) *</label>
                <input type="text" id="pgSignUpName" placeholder="उदा. Ramesh Kumar" required style="width:100%; padding:8px 12px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:13px; box-sizing:border-box;">
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
                <div>
                  <label style="display:block; font-size:12px; font-weight:700; color:#334155; margin-bottom:4px;">मोबाइल नंबर *</label>
                  <input type="tel" id="pgSignUpMobile" maxlength="10" placeholder="10 अंक" required style="width:100%; padding:8px 12px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:13px; box-sizing:border-box;">
                </div>
                <div>
                  <label style="display:block; font-size:12px; font-weight:700; color:#334155; margin-bottom:4px;">ईमेल आईडी *</label>
                  <input type="email" id="pgSignUpEmail" placeholder="user@gmail.com" required style="width:100%; padding:8px 12px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:13px; box-sizing:border-box;">
                </div>
              </div>
              <div style="margin-bottom:14px;">
                <label style="display:block; font-size:12px; font-weight:700; color:#334155; margin-bottom:4px;">नया पासवर्ड बनाएं *</label>
                <input type="password" id="pgSignUpPassword" placeholder="कम से कम 4 अक्षर" required style="width:100%; padding:8px 12px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:13px; box-sizing:border-box;">
              </div>
              <button type="submit" style="width:100%; padding:11px; background:linear-gradient(135deg, #10b981, #059669); color:#ffffff; border:none; border-radius:8px; font-size:14px; font-weight:800; cursor:pointer; box-shadow:0 2px 8px rgba(16,185,129,0.3);">
                ✨ रजिस्टर करें एवं प्रिंट जारी रखें
              </button>
            </form>

            <div style="margin-top:14px; padding-top:12px; border-top:1px dashed #e2e8f0; font-size:11.5px; color:#64748b; text-align:center;">
              🛡️ 100% सुरक्षित • आपका फॉर्म में भरा हुआ डेटा बिल्कुल नहीं मिटेगा।
            </div>
          </div>
        </div>
      </div>
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes pgFadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(styleEl);

    const div = document.createElement('div');
    div.innerHTML = modalHtml;
    document.body.appendChild(div.firstElementChild);

    // Setup event listeners inside the modal
    const modal = document.getElementById('printGateAuthModal');
    const btnClose = document.getElementById('btnClosePrintGate');
    const btnGuest = document.getElementById('btnPgContinueGuest');
    const tabSignIn = document.getElementById('pgTabSignIn');
    const tabSignUp = document.getElementById('pgTabSignUp');
    const formSignIn = document.getElementById('pgSignInForm');
    const formSignUp = document.getElementById('pgSignUpForm');
    const errBox = document.getElementById('pgAuthError');

    function closeModal() {
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnGuest) {
      btnGuest.addEventListener('click', () => {
        closeModal();
        if (typeof pendingPrintAction === 'function') {
          const action = pendingPrintAction;
          pendingPrintAction = null;
          action();
        }
      });
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    if (tabSignIn) {
      tabSignIn.addEventListener('click', () => {
        tabSignIn.style.background = '#e0f2fe';
        tabSignIn.style.color = '#0369a1';
        tabSignUp.style.background = '#f1f5f9';
        tabSignUp.style.color = '#64748b';
        formSignIn.style.display = 'block';
        formSignUp.style.display = 'none';
        if (errBox) errBox.style.display = 'none';
      });
    }

    if (tabSignUp) {
      tabSignUp.addEventListener('click', () => {
        tabSignUp.style.background = '#e0f2fe';
        tabSignUp.style.color = '#0369a1';
        tabSignIn.style.background = '#f1f5f9';
        tabSignIn.style.color = '#64748b';
        formSignUp.style.display = 'block';
        formSignIn.style.display = 'none';
        if (errBox) errBox.style.display = 'none';
      });
    }

    // Prefill last email
    const lastEmail = localStorage.getItem(STORAGE_KEY_LAST_EMAIL);
    if (lastEmail) {
      const emailInput = document.getElementById('pgSignInEmail');
      if (emailInput) emailInput.value = lastEmail;
    }

    if (formSignIn) {
      formSignIn.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('pgSignInEmail')?.value.trim();
        const password = document.getElementById('pgSignInPassword')?.value.trim();
        const res = loginUser({ email, password });
        if (!res.success) {
          if (errBox) {
            errBox.textContent = res.message;
            errBox.style.display = 'block';
          } else {
            alert(res.message);
          }
          return;
        }

        closeModal();
        if (typeof pendingPrintAction === 'function') {
          const action = pendingPrintAction;
          pendingPrintAction = null;
          action();
        }
      });
    }

    if (formSignUp) {
      formSignUp.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('pgSignUpName')?.value.trim();
        const mobile = document.getElementById('pgSignUpMobile')?.value.trim();
        const email = document.getElementById('pgSignUpEmail')?.value.trim();
        const password = document.getElementById('pgSignUpPassword')?.value.trim();

        const res = registerUser({
          userType: 'member',
          name,
          mobile,
          email,
          password
        });

        if (!res.success) {
          if (res.alreadyRegistered) {
            // Switch to sign in tab
            if (tabSignIn) tabSignIn.click();
            const signInEmailInput = document.getElementById('pgSignInEmail');
            if (signInEmailInput) signInEmailInput.value = email;
            if (errBox) {
              errBox.textContent = 'ℹ️ यह खाता पहले से पंजीकृत है! कृपया अपना पासवर्ड डालकर साइन इन करें।';
              errBox.style.background = '#e0f2fe';
              errBox.style.color = '#0369a1';
              errBox.style.display = 'block';
            }
            return;
          }

          if (errBox) {
            errBox.textContent = res.message;
            errBox.style.display = 'block';
          } else {
            alert(res.message);
          }
          return;
        }

        closeModal();
        if (typeof pendingPrintAction === 'function') {
          const action = pendingPrintAction;
          pendingPrintAction = null;
          action();
        }
      });
    }
  }

  // Setup universal print and download interceptor
  function setupPrintInterceptor() {
    if (typeof window === 'undefined') return;

    // Inject universal print style shield into document head
    if (typeof document !== 'undefined' && document.head && !document.getElementById('universalPrintShieldStyle')) {
      const universalPrintStyle = document.createElement('style');
      universalPrintStyle.id = 'universalPrintShieldStyle';
      universalPrintStyle.textContent = `
        @media print {
          html, body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            display: block !important;
          }
          .no-print, .sheet-badge, [class*="sheet-badge"] {
            display: none !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
          }
          body, .form-container, .printable-area, .sheet, .form-sheet, article, main, table, input, textarea, select {
            font-family: 'Noto Sans Devanagari', 'Inter', 'Plus Jakarta Sans', 'Nirmala UI', 'Mangal', sans-serif !important;
          }
          input::placeholder,
          textarea::placeholder,
          input::-webkit-input-placeholder,
          textarea::-webkit-input-placeholder,
          input::-moz-placeholder,
          textarea::-moz-placeholder,
          input:-ms-input-placeholder,
          textarea:-ms-input-placeholder {
            color: transparent !important;
            -webkit-text-fill-color: transparent !important;
            opacity: 0 !important;
          }
        }
      `;
      document.head.appendChild(universalPrintStyle);
    }

    // Intercept html2pdf to prevent html2canvas Devanagari / Hindi font shaping corruption and 2-page raster canvas slicing
    const safeHtml2Pdf = function() {
      return {
        set: function() { return this; },
        from: function() { return this; },
        to: function() { return this; },
        toPdf: function() { return this; },
        output: function() { return Promise.resolve(); },
        save: function() {
          const toastMsg = '📄 100% शुद्ध हिंदी फॉन्ट व 1 पेज में सुरक्षित करने के लिए: प्रिंट विंडो में Destination "Save as PDF" चुनें।';
          if (typeof window.showToast === 'function') {
            window.showToast(toastMsg);
          } else {
            console.log(toastMsg);
          }
          setTimeout(() => {
            window.print();
          }, 350);
          return Promise.resolve();
        }
      };
    };
    try {
      window.html2pdf = safeHtml2Pdf;
    } catch(err) {}

    // Dynamic placeholder suppression so blank forms print 100% clean
    function hidePlaceholdersForPrint() {
      document.querySelectorAll('input, textarea').forEach(el => {
        if (el.placeholder) {
          el.setAttribute('data-print-placeholder', el.placeholder);
          el.placeholder = '';
        }
      });
    }

    function restorePlaceholdersAfterPrint() {
      document.querySelectorAll('input[data-print-placeholder], textarea[data-print-placeholder]').forEach(el => {
        el.placeholder = el.getAttribute('data-print-placeholder');
        el.removeAttribute('data-print-placeholder');
      });
    }

    window.addEventListener('beforeprint', hidePlaceholdersForPrint);
    window.addEventListener('afterprint', restorePlaceholdersAfterPrint);

    // Intercept window.print
    const originalPrint = window.print;
    window.__rawPrint = originalPrint;

    window.print = function() {
      hidePlaceholdersForPrint();
      if (isLoginRequiredForPrint() && !getActiveUser()) {
        triggerPrintAuthModal('print', () => {
          originalPrint.call(window);
          setTimeout(restorePlaceholdersAfterPrint, 1500);
        });
        restorePlaceholdersAfterPrint();
        return;
      }
      originalPrint.call(window);
      setTimeout(restorePlaceholdersAfterPrint, 1500);
    };

    // Intercept Ctrl+P / Cmd+P
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        hidePlaceholdersForPrint();
        setTimeout(restorePlaceholdersAfterPrint, 1500);
        if (isLoginRequiredForPrint() && !getActiveUser()) {
          e.preventDefault();
          e.stopPropagation();
          triggerPrintAuthModal('print', () => {
            originalPrint.call(window);
            setTimeout(restorePlaceholdersAfterPrint, 1500);
          });
        }
      }
    }, true);

    // Intercept PDF download / export buttons across all forms
    document.addEventListener('click', (e) => {
      const pdfBtn = e.target.closest('#btnSavePdf, #btnSavePDF, #btnExportPDF, #btnExportPdf, #btnDownloadPDF, #btnDownloadPdf, .btn-export-pdf, .btn-download-pdf, .btn-pdf, .btn-action.btn-pdf, [data-action="export-pdf"], [data-action="download-pdf"], button[onclick*="downloadPDF"], button[onclick*="exportPDF"], button[onclick*="savePdf"], button[onclick*="savePDF"]');
      if (pdfBtn && !pdfBtn.dataset.bypassGate) {
        hidePlaceholdersForPrint();
        setTimeout(restorePlaceholdersAfterPrint, 2500);
        if (isLoginRequiredForPrint() && !getActiveUser()) {
          e.preventDefault();
          e.stopPropagation();
          triggerPrintAuthModal('download', () => {
            pdfBtn.dataset.bypassGate = 'true';
            pdfBtn.click();
            delete pdfBtn.dataset.bypassGate;
          });
          return;
        }

        // Show Hindi guidance toast and route to native high-definition vector print
        const toastMsg = '📄 100% शुद्ध हिंदी फॉन्ट व 1 पेज में PDF सेव करने के लिए: प्रिंट विंडो में Destination "Save as PDF" चुनें।';
        if (typeof window.showToast === 'function') {
          window.showToast(toastMsg);
        } else {
          console.log(toastMsg);
        }

        // If the button triggers html2pdf, safeHtml2Pdf handles it. Otherwise trigger window.print
        if (!window.html2pdf || window.html2pdf === safeHtml2Pdf) {
          e.preventDefault();
          e.stopPropagation();
          setTimeout(() => {
            window.print();
          }, 350);
        }
      }
    }, true);
  }

  if (typeof document !== 'undefined') {
    const runInterceptors = () => {
      setupPrintInterceptor();
      syncGatekeeperFromFirestore();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runInterceptors);
    } else {
      runInterceptors();
    }
  }

  return {
    getAllUsers,
    registerUser,
    loginUser,
    logoutUser,
    getActiveUser,
    exportUsersToCSV,
    exportUsersToJSON,
    getUsersCodeSnippet,
    getWebhookUrl,
    setWebhookUrl,
    testWebhook,
    isUserAuthorizedForForm,
    getAllowedRolesForForm,
    getRoleDisplayName,
    getAllFormCustomizations,
    getFormCustomization,
    saveFormCustomization,
    resetFormCustomization,
    getAllCustomVideos,
    saveCustomVideo,
    deleteCustomVideo,
    getVideoBlob,
    storeVideoBlob,
    deleteVideoBlob,
    resolveVideoPlaySource,
    formatYouTubeEmbedUrl,
    saveUserToFirestore,
    fetchUsersFromFirestore,
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    resetUserPassword,
    isLoginRequiredForPrint,
    setLoginRequiredForPrint,
    syncGatekeeperFromFirestore,
    triggerPrintAuthModal,
    getAllCustomLetters,
    getCustomLetterById,
    saveCustomLetter,
    deleteCustomLetter,
    getAllDepartments,
    getCustomDepartments,
    getDepartmentById,
    saveCustomDepartment,
    deleteCustomDepartment,
    fetchCustomDepartmentsFromFirestore,
    fetchCustomLettersFromFirestore,
    getAllOfficialLetterTemplates,
    getLetterCustomization,
    saveLetterCustomization,
    fetchLetterCustomizationFromFirestore,
    resetLetterCustomization
  };
})();

// Attach to window
if (typeof window !== 'undefined') {
  window.UserDetailsHub = UserDetailsHub;
}

