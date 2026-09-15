/**
 * =========================================================================
 * Google Apps Script - Automatic User Details Logger for Google Sheets
 * पोर्टल: सरकारी फॉर्म सेवा (Sarkari Form Seva)
 * Curated by: Niraj Kumar, Section Supervisor, RO, Faridabad
 * Contact: smart.webpage.storage@gmail.com | 8700383426
 * =========================================================================
 * 
 * 📌 इसे Google Sheet में लगाने के आसान 4 स्टेप्स (2 Minutes Setup):
 * 
 * 1. अपने Google Drive में जाएं -> New Google Sheet बनाएं (नाम दें: "Sarkari Portal Users").
 * 2. ऊपर मेनू में "Extensions" -> "Apps Script" पर क्लिक करें।
 * 3. वहाँ जो पुराना कोड लिखा हो उसे हटाकर नीचे दिया गया पूरा कोड पेस्ट कर दें और Save (Ctrl+S) करें।
 * 4. ऊपर दाईं ओर नीले रंग के "Deploy" बटन पर क्लिक करें -> "New deployment" चुनें:
 *    - Select type: "Web app" (गियर आइकन पर क्लिक करके)
 *    - Description: "User Registration Webhook"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (यह बहुत जरूरी है!)
 *    - "Deploy" पर क्लिक करें और permissions Authorize करें।
 * 5. जो "Web app URL" (e.g. https://script.google.com/macros/s/.../exec) मिलेगा:
 *    उसे कॉपी करें और अपने Admin Dashboard (admin-users.html) में पेस्ट करके "Save & Test" पर क्लिक करें!
 * =========================================================================
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Auto-create professional headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "S.No",
        "User ID",
        "Full Name (नाम)",
        "Email Address (ईमेल)",
        "Mobile Number (मोबाइल)",
        "Password (पासवर्ड)",
        "Registration Date (पंजीकरण समय)",
        "Last Login",
        "Total Logins"
      ]);
      
      // Style header row with Navy Blue background & bold text
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setBackground("#0284c7");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    // Parse incoming JSON data from portal
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    var nextSNo = sheet.getLastRow(); // Since header is row 1
    
    // Append new registered user row
    sheet.appendRow([
      nextSNo,
      data.id || ("USR_" + new Date().getTime()),
      data.name || "",
      data.email || "",
      "'" + (data.mobile || ""), // apostrophe ensures mobile is saved as text without truncation
      data.password || "",
      data.registeredAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.lastLoginAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.totalLogins || 1
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "User appended successfully" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput("सरकारी फॉर्म सेवा - Google Sheet Webhook is Live and Ready!")
    .setMimeType(ContentService.MimeType.TEXT);
}
