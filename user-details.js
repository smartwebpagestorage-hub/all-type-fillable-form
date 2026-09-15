/**
 * User Details & Authentication Data Hub
 * Manages user registration, local persistence, session management,
 * Google Sheets real-time synchronization, and export functions for admin view.
 * 
 * Curated by Niraj Kumar, Section Supervisor, RO, Faridabad
 * Contact: smart.webpage.storage@gmail.com | 8700383426
 */

const UserDetailsHub = (function() {
  const STORAGE_KEY_USERS = 'portalRegisteredUsers';
  const STORAGE_KEY_SESSION = 'portalActiveUserSession';
  const STORAGE_KEY_WEBHOOK = 'portalGoogleSheetWebhookUrl';

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
      name: 'परीक्षण यूजर (Test Entry - Niraj Kumar)',
      email: 'smart.webpage.storage@gmail.com',
      mobile: '8700383426',
      password: 'EPFO#TEST123',
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

  // Initialize storage if empty
  function getAllUsers() {
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
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
    }
  }

  // Register New User
  function registerUser({ name, email, mobile, password }) {
    name = (name || '').trim();
    email = (email || '').trim().toLowerCase();
    mobile = (mobile || '').trim();
    password = (password || '').trim();

    if (!name || !email || !mobile || !password) {
      return { success: false, message: 'कृपया सभी आवश्यक फ़ील्ड भरें (Please fill all fields)' };
    }

    if (!/^\d{10}$/.test(mobile)) {
      return { success: false, message: 'कृपया 10-अंकीय मान्य मोबाइल नंबर दर्ज करें (Enter valid 10-digit mobile)' };
    }

    const users = getAllUsers();
    const existing = users.find(u => u.email === email || u.mobile === mobile);
    if (existing) {
      return { 
        success: false, 
        message: 'यह ईमेल या मोबाइल पहले से पंजीकृत है। कृपया साइन इन करें। (Already registered, please sign in)' 
      };
    }

    const newUser = {
      id: 'USR_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: name,
      email: email,
      mobile: mobile,
      password: password,
      registeredAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      registeredTimestamp: Date.now(),
      lastLoginAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      totalLogins: 1,
      formsAccessed: []
    };

    users.unshift(newUser);
    saveAllUsers(users);
    setActiveUser(newUser);

    // Forward automatically to Google Sheet in real-time
    forwardToGoogleSheet(newUser);

    return { success: true, user: newUser, message: 'पंजीकरण सफल रहा! (Registration successful)' };
  }

  // Authenticate Returning User
  function loginUser({ email, password }) {
    email = (email || '').trim().toLowerCase();
    password = (password || '').trim();

    if (!email || !password) {
      return { success: false, message: 'कृपया ईमेल और पासवर्ड दर्ज करें (Enter email and password)' };
    }

    const users = getAllUsers();
    const userIndex = users.findIndex(u => (u.email === email || u.mobile === email) && u.password === password);

    if (userIndex === -1) {
      return { success: false, message: 'अमान्य ईमेल या पासवर्ड। कृपया पुनः प्रयास करें। (Invalid credentials)' };
    }

    const user = users[userIndex];
    user.lastLoginAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    user.totalLogins = (user.totalLogins || 0) + 1;
    users[userIndex] = user;
    saveAllUsers(users);

    setActiveUser(user);
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

    const headers = ['S.No', 'User ID', 'Full Name', 'Email Address', 'Mobile Number', 'Password', 'Registration Date', 'Last Login', 'Total Logins'];
    const rows = users.map((u, i) => [
      i + 1,
      `"${u.id || ''}"`,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${u.mobile || ''}"`,
      `"${(u.password || '').replace(/"/g, '""')}"`,
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

  return {
    getAllUsers,
    registerUser,
    loginUser,
    logoutUser,
    getActiveUser,
    exportUsersToCSV,
    exportUsersToJSON,
    getWebhookUrl,
    setWebhookUrl,
    testWebhook
  };
})();

// Attach to window
if (typeof window !== 'undefined') {
  window.UserDetailsHub = UserDetailsHub;
}
