/**
 * सरकारी फॉर्म सेवा (Sarkari Forms Seva)
 * Hardware-Locked Security & License Guard
 * Author: Niraj Kumar, Section Supervisor, RO, Faridabad
 * 
 * Features:
 * 1. Physical Hardware Fingerprint (Motherboard UUID + Windows MachineGuid)
 * 2. Master Password Protection: 040278221195080511110416
 * 3. Cryptographic Anti-Copy Lock (AES-256-GCM Machine Binding)
 * 4. Tamper & Theft Prevention
 */

const crypto = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Master Password specified by author Niraj Kumar
const MASTER_PASSWORD = '040278221195080511110416';
const SALT = 'sarkari-forms-seva-niraj-kumar-hardware-lock-v1';

// Path where host-specific license is saved
function getLicenseDir() {
  const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  const dir = path.join(appData, 'SarkariFormsSeva');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getLicenseFilePath() {
  return path.join(getLicenseDir(), 'device-license.lic');
}

/**
 * 1. Extract Windows Hardware Fingerprint
 * Combines Windows MachineGuid and Motherboard System UUID
 */
function getMachineHardwareId() {
  let machineGuid = '';
  let motherboardUuid = '';

  try {
    // A. Windows MachineGuid from Registry
    const regOutput = execSync('reg query HKLM\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 4000
    });
    const match = regOutput.match(/MachineGuid\s+REG_SZ\s+([a-f0-9\-]+)/i);
    if (match && match[1]) {
      machineGuid = match[1].trim();
    }
  } catch (e) {
    machineGuid = 'fallback-guid-' + os.hostname();
  }

  try {
    // B. Motherboard System UUID via PowerShell CIM
    const uuidOutput = execSync('powershell -NoProfile -Command "(Get-CimInstance Win32_ComputerSystemProduct).UUID"', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 4000
    });
    motherboardUuid = (uuidOutput || '').trim();
  } catch (e) {
    try {
      // Fallback via WMIC if CIM fails
      const wmicOutput = execSync('wmic csproduct get uuid', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
        timeout: 4000
      });
      const lines = wmicOutput.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 1) motherboardUuid = lines[1];
    } catch (err) {
      motherboardUuid = 'fallback-uuid-' + os.cpus()[0]?.model || '';
    }
  }

  // Combine into unique host signature
  const combined = `HOST:${machineGuid}|MB:${motherboardUuid}|USER:${os.userInfo().username}`;
  const hardwareHash = crypto.createHash('sha256').update(combined).digest('hex');
  return {
    raw: combined,
    hash: hardwareHash,
    shortId: hardwareHash.substring(0, 16).toUpperCase()
  };
}

/**
 * 2. Verify Master Password
 */
function checkPassword(inputPassword) {
  if (!inputPassword || typeof inputPassword !== 'string') return false;
  return inputPassword.trim() === MASTER_PASSWORD;
}

/**
 * 3. Activate License on Current Computer
 * Generates an AES-256-GCM encrypted license bound to current machine's hardware hash
 */
function activateLicense(inputPassword) {
  if (!checkPassword(inputPassword)) {
    return { success: false, message: 'अमान्य पासवर्ड! कृपया सही मास्टर इंस्टॉलेशन पासवर्ड दर्ज करें।' };
  }

  try {
    const hw = getMachineHardwareId();
    const licenseData = {
      hwHash: hw.hash,
      machineName: os.hostname(),
      userName: os.userInfo().username,
      activatedAt: new Date().toISOString(),
      app: 'Sarkari Forms Seva Offline Desktop',
      author: 'Niraj Kumar, Section Supervisor',
      signature: crypto.createHmac('sha256', hw.hash).update(MASTER_PASSWORD).digest('hex')
    };

    // Derive 32-byte encryption key strictly from current hardware hash + salt
    const key = crypto.scryptSync(hw.hash, SALT, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(JSON.stringify(licenseData), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    const fileContent = JSON.stringify({
      v: 1,
      iv: iv.toString('hex'),
      authTag,
      data: encrypted,
      shortId: hw.shortId
    }, null, 2);

    fs.writeFileSync(getLicenseFilePath(), fileContent, 'utf8');

    return {
      success: true,
      message: 'सॉफ्टवेयर सफलतापूर्वक एक्टिवेट हो गया है!',
      shortId: hw.shortId
    };
  } catch (error) {
    return { success: false, message: 'एक्टिवेशन में त्रुटि: ' + error.message };
  }
}

/**
 * 4. Verify License Integrity on Startup
 * Validates that current host computer strictly matches the machine where license was created.
 * If copied to another PC, decryption fails or hardware hash mismatches -> Locks immediately!
 */
function verifyLicenseOnStartup() {
  const licenseFile = getLicenseFilePath();
  if (!fs.existsSync(licenseFile)) {
    return {
      isActivated: false,
      reason: 'NO_LICENSE',
      message: 'कृपया पहली बार उपयोग हेतु मास्टर पासवर्ड दर्ज करके एक्टिवेट करें।'
    };
  }

  try {
    const rawContent = fs.readFileSync(licenseFile, 'utf8');
    const licenseWrapper = JSON.parse(rawContent);

    // Current PC hardware ID
    const currentHw = module.exports.getMachineHardwareId();

    // Attempt decryption with current PC's hardware hash
    const key = crypto.scryptSync(currentHw.hash, SALT, 32);
    const iv = Buffer.from(licenseWrapper.iv, 'hex');
    const authTag = Buffer.from(licenseWrapper.authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(licenseWrapper.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const payload = JSON.parse(decrypted);

    // Strict validation: Does the hardware hash match?
    if (payload.hwHash !== currentHw.hash) {
      return {
        isActivated: false,
        reason: 'HARDWARE_MISMATCH',
        message: 'अवैध कॉपी का पता चला! (Unauthorized / Pirated Copy Detected). यह सॉफ्टवेयर किसी अन्य कंप्यूटर से कॉपी किया गया है। यह केवल मूल अधिकृत सिस्टम पर ही चलेगा।'
      };
    }

    // Verify cryptographic signature
    const expectedSig = crypto.createHmac('sha256', currentHw.hash).update(MASTER_PASSWORD).digest('hex');
    if (payload.signature !== expectedSig) {
      return {
        isActivated: false,
        reason: 'TAMPERED_LICENSE',
        message: 'लाइसेंस फाइल के साथ छेड़छाड़ की गई है! कृपया पुन: एक्टिवेट करें।'
      };
    }

    return {
      isActivated: true,
      activatedAt: payload.activatedAt,
      machineName: payload.machineName,
      shortId: currentHw.shortId
    };
  } catch (err) {
    // Decryption failed means this is a different computer!
    return {
      isActivated: false,
      reason: 'HARDWARE_MISMATCH',
      message: 'हार्डवेयर मिसमैच! (Hardware Mismatch Detected). यह सॉफ्टवेयर इस कंप्यूटर के लिए अधिकृत नहीं है या इसे किसी अन्य सिस्टम से कॉपी किया गया है।'
    };
  }
}

/**
 * 5. Uninstall License
 */
function uninstallLicense() {
  try {
    const file = getLicenseFilePath();
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
    return { success: true, message: 'लाइसेंस सफलतापूर्वक हटा दिया गया है।' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

module.exports = {
  MASTER_PASSWORD,
  getMachineHardwareId,
  checkPassword,
  activateLicense,
  verifyLicenseOnStartup,
  uninstallLicense
};
