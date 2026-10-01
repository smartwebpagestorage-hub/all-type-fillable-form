using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;
using System.Management;
using System.Security.Cryptography;
using Microsoft.Win32;

namespace SarkariFormsSeva
{
    static class Program
    {
        private const string MASTER_PASSWORD = "040278221195080511110416";
        private const string SALT = "SarkariFormsSeva-HardwareLock-2026-NirajKumar";

        private static HttpListener listener;
        private static Thread serverThread;
        private static string appRootDirectory;
        private static int serverPort;

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // Determine app directory (where html files reside)
            string exeDir = AppDomain.CurrentDomain.BaseDirectory;
            if (File.Exists(Path.Combine(exeDir, "index.html")))
            {
                appRootDirectory = exeDir;
            }
            else if (File.Exists(Path.Combine(exeDir, "..", "index.html")))
            {
                appRootDirectory = Path.GetFullPath(Path.Combine(exeDir, ".."));
            }
            else
            {
                appRootDirectory = exeDir;
            }

            // Check if user requested uninstallation/reset
            if (args.Length > 0 && args[0] == "--reset-license")
            {
                ResetLicense();
                MessageBox.Show("लाइसेंस सफलतापूर्वक रीसेट कर दिया गया है।", "सरकारी फॉर्म सेवा", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            // Check if server is already running in background
            string portFile = GetPortFilePath();
            if (File.Exists(portFile))
            {
                try
                {
                    string txt = File.ReadAllText(portFile).Trim();
                    int p;
                    if (int.TryParse(txt, out p))
                    {
                        HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:" + p + "/index.html");
                        req.Timeout = 1000;
                        using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                        {
                            if (resp.StatusCode == HttpStatusCode.OK)
                            {
                                // Server is already running! Just open browser window and exit
                                OpenBrowserWindow("http://127.0.0.1:" + p + "/index.html");
                                return;
                            }
                        }
                    }
                }
                catch { }
            }

            // Step 1: Verify Hardware License
            string currentHwHash = GetHardwareHash();
            bool isLicensed = VerifyLicense(currentHwHash);

            if (!isLicensed)
            {
                // Show Activation Window
                ActivationForm actForm = new ActivationForm(GetShortHardwareId(currentHwHash));
                if (actForm.ShowDialog() != DialogResult.OK)
                {
                    // User cancelled activation
                    return;
                }
            }

            // Step 2: Start 100% Offline Local Web Server
            StartOfflineServer();

            // Save active port
            try
            {
                File.WriteAllText(portFile, serverPort.ToString());
            }
            catch { }

            // Step 3: Run Desktop Application with Taskbar Tray & Multi-Browser Support
            string mainUrl = "http://127.0.0.1:" + serverPort + "/index.html";
            Application.Run(new SarkariAppContext(mainUrl));
        }

        private static string GetPortFilePath()
        {
            string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string dir = Path.Combine(appData, "SarkariFormsSeva");
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            return Path.Combine(dir, "running.port");
        }

        #region Hardware Identification & Anti-Copy Cryptography

        public static string GetHardwareHash()
        {
            string machineGuid = "";
            string motherboardUuid = "";

            try
            {
                using (RegistryKey key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Cryptography"))
                {
                    if (key != null)
                    {
                        object val = key.GetValue("MachineGuid");
                        if (val != null) machineGuid = val.ToString();
                    }
                }
            }
            catch { }

            try
            {
                using (ManagementObjectSearcher mos = new ManagementObjectSearcher("SELECT UUID FROM Win32_ComputerSystemProduct"))
                {
                    foreach (ManagementObject mo in mos.Get())
                    {
                        if (mo["UUID"] != null)
                        {
                            motherboardUuid = mo["UUID"].ToString();
                            break;
                        }
                    }
                }
            }
            catch { }

            string combined = "GUID:" + machineGuid + "|MB:" + motherboardUuid + "|SALT:" + SALT;
            using (SHA256 sha = SHA256.Create())
            {
                byte[] hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(combined));
                StringBuilder sb = new StringBuilder();
                foreach (byte b in hashBytes) sb.Append(b.ToString("x2"));
                return sb.ToString();
            }
        }

        public static string GetShortHardwareId(string hwHash)
        {
            if (string.IsNullOrEmpty(hwHash) || hwHash.Length < 16) return "UNKNOWN-HW";
            return hwHash.Substring(0, 16).ToUpper();
        }

        private static string GetLicenseFilePath()
        {
            string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string dir = Path.Combine(appData, "SarkariFormsSeva");
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            return Path.Combine(dir, "device-license.lic");
        }

        public static bool VerifyLicense(string currentHwHash)
        {
            string licPath = GetLicenseFilePath();
            if (!File.Exists(licPath)) return false;

            try
            {
                byte[] fileBytes = File.ReadAllBytes(licPath);
                string decrypted = DecryptLicense(fileBytes, currentHwHash);
                if (decrypted == null)
                {
                    // Failed decryption means hardware changed / folder copied to another PC!
                    MessageBox.Show(
                        "हार्डवेयर मिसमैच! (Hardware Mismatch Detected)\n\n" +
                        "यह सॉफ़्टवेयर किसी अन्य कंप्यूटर से कॉपी किया गया है। यह केवल मूल अधिकृत सिस्टम पर ही चलेगा।\n\n" +
                        "यदि आपने हार्डवेयर बदला है, तो कृपया दोबारा मास्टर पासवर्ड दर्ज करके एक्टिवेट करें।",
                        "सुरक्षा चेतावनी / Security Alert",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Stop
                    );
                    return false;
                }

                // Check payload
                string[] parts = decrypted.Split('|');
                if (parts.Length >= 2 && parts[0] == "LICENSED" && parts[1] == currentHwHash)
                {
                    return true;
                }
            }
            catch { }

            return false;
        }

        public static bool SaveActivation(string inputPassword, string currentHwHash)
        {
            if (inputPassword != MASTER_PASSWORD) return false;

            try
            {
                string payload = "LICENSED|" + currentHwHash + "|" + DateTime.UtcNow.ToString("O") + "|NIRAJ-KUMAR";
                byte[] encrypted = EncryptLicense(payload, currentHwHash);
                File.WriteAllBytes(GetLicenseFilePath(), encrypted);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static void ResetLicense()
        {
            try
            {
                string licPath = GetLicenseFilePath();
                if (File.Exists(licPath)) File.Delete(licPath);
            }
            catch { }
        }

        private static byte[] EncryptLicense(string plainText, string hwHash)
        {
            byte[] key = SHA256.Create().ComputeHash(Encoding.UTF8.GetBytes(hwHash + SALT));
            byte[] iv = new byte[16];
            Array.Copy(key, 16, iv, 0, 16);

            using (Aes aes = Aes.Create())
            {
                aes.Key = key;
                aes.IV = iv;
                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, aes.CreateEncryptor(), CryptoStreamMode.Write))
                    {
                        byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
                        cs.Write(plainBytes, 0, plainBytes.Length);
                        cs.FlushFinalBlock();
                    }
                    return ms.ToArray();
                }
            }
        }

        private static string DecryptLicense(byte[] cipherBytes, string hwHash)
        {
            try
            {
                byte[] key = SHA256.Create().ComputeHash(Encoding.UTF8.GetBytes(hwHash + SALT));
                byte[] iv = new byte[16];
                Array.Copy(key, 16, iv, 0, 16);

                using (Aes aes = Aes.Create())
                {
                    aes.Key = key;
                    aes.IV = iv;
                    using (MemoryStream ms = new MemoryStream(cipherBytes))
                    {
                        using (CryptoStream cs = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Read))
                        {
                            using (StreamReader reader = new StreamReader(cs, Encoding.UTF8))
                            {
                                return reader.ReadToEnd();
                            }
                        }
                    }
                }
            }
            catch
            {
                return null;
            }
        }

        #endregion

        #region In-Process Offline HTTP Server

        private static void StartOfflineServer()
        {
            Random rnd = new Random();
            for (int i = 0; i < 25; i++)
            {
                int testPort = rnd.Next(10000, 48000);
                try
                {
                    listener = new HttpListener();
                    listener.Prefixes.Add("http://127.0.0.1:" + testPort + "/");
                    listener.Start();
                    serverPort = testPort;
                    break;
                }
                catch
                {
                    listener = null;
                }
            }

            if (listener == null)
            {
                throw new Exception("Unable to bind local offline server on 127.0.0.1");
            }

            serverThread = new Thread(ListenLoop);
            serverThread.IsBackground = true;
            serverThread.Start();
        }

        private static void ListenLoop()
        {
            while (listener != null && listener.IsListening)
            {
                try
                {
                    HttpListenerContext context = listener.GetContext();
                    ThreadPool.QueueUserWorkItem(ProcessRequest, context);
                }
                catch
                {
                    break;
                }
            }
        }

        private static void ProcessRequest(object state)
        {
            HttpListenerContext context = (HttpListenerContext)state;
            HttpListenerRequest request = context.Request;
            HttpListenerResponse response = context.Response;

            try
            {
                string rawUrl = request.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(rawUrl)) rawUrl = "index.html";

                // Prevent path traversal attacks
                rawUrl = rawUrl.Replace('/', Path.DirectorySeparatorChar);
                string filePath = Path.GetFullPath(Path.Combine(appRootDirectory, rawUrl));

                if (!filePath.StartsWith(appRootDirectory, StringComparison.OrdinalIgnoreCase) || !File.Exists(filePath))
                {
                    response.StatusCode = 404;
                    byte[] notFound = Encoding.UTF8.GetBytes("File Not Found");
                    response.OutputStream.Write(notFound, 0, notFound.Length);
                    response.Close();
                    return;
                }

                string ext = Path.GetExtension(filePath).ToLowerInvariant();
                string mime = GetMimeType(ext);
                response.ContentType = mime;
                response.Headers.Add("Access-Control-Allow-Origin", "*");
                response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                response.Headers.Add("Access-Control-Allow-Headers", "*");

                // Anti-tamper & security injection for HTML files
                if (ext == ".html" || ext == ".htm")
                {
                    string htmlContent = File.ReadAllText(filePath, Encoding.UTF8);

                    // Anti-inspect script block
                    string securityScript = @"
<script>
// Anti-Theft & Inspection Shield (Sarkari Forms Seva)
document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
document.addEventListener('keydown', function(e) {
  if (e.keyCode === 123 || 
     (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
     (e.ctrlKey && e.keyCode === 85)) {
    e.preventDefault();
    return false;
  }
});
</script>
</head>";
                    htmlContent = htmlContent.Replace("</head>", securityScript);
                    byte[] htmlBytes = Encoding.UTF8.GetBytes(htmlContent);
                    response.ContentLength64 = htmlBytes.Length;
                    response.OutputStream.Write(htmlBytes, 0, htmlBytes.Length);
                }
                else
                {
                    byte[] fileBytes = File.ReadAllBytes(filePath);
                    response.ContentLength64 = fileBytes.Length;
                    response.OutputStream.Write(fileBytes, 0, fileBytes.Length);
                }
            }
            catch { }
            finally
            {
                try { response.Close(); } catch { }
            }
        }

        private static string GetMimeType(string ext)
        {
            switch (ext)
            {
                case ".html": case ".htm": return "text/html; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".js": return "application/javascript; charset=utf-8";
                case ".json": return "application/json; charset=utf-8";
                case ".svg": return "image/svg+xml";
                case ".png": return "image/png";
                case ".jpg": case ".jpeg": return "image/jpeg";
                case ".gif": return "image/gif";
                case ".ico": return "image/x-icon";
                case ".pdf": return "application/pdf";
                case ".woff": return "font/woff";
                case ".woff2": return "font/woff2";
                case ".ttf": return "font/ttf";
                default: return "application/octet-stream";
            }
        }

        public static void StopOfflineServer()
        {
            try
            {
                string portFile = GetPortFilePath();
                if (File.Exists(portFile)) File.Delete(portFile);
            }
            catch { }

            try
            {
                if (listener != null)
                {
                    listener.Stop();
                    listener.Close();
                    listener = null;
                }
            }
            catch { }
        }

        #endregion

        #region Multi-Browser Launcher (Chrome, Edge, Firefox, Default)

        public static void OpenBrowserWindow(string url)
        {
            string bPath, bArgs;
            bool found = FindBestBrowser(out bPath, out bArgs, url);

            try
            {
                if (found && !string.IsNullOrEmpty(bPath))
                {
                    ProcessStartInfo psi = new ProcessStartInfo(bPath, bArgs)
                    {
                        UseShellExecute = false
                    };
                    Process.Start(psi);
                }
                else
                {
                    Process.Start(url);
                }
            }
            catch
            {
                try { Process.Start(url); } catch { }
            }
        }

        public static bool FindBestBrowser(out string browserPath, out string browserArgs, string url)
        {
            string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);

            // 1. Google Chrome (Preferred for standalone --app mode)
            string chrome = GetBrowserFromAppPaths("chrome.exe");
            if (string.IsNullOrEmpty(chrome))
            {
                string[] chromePaths = new string[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe")
                };
                foreach (string p in chromePaths)
                {
                    if (File.Exists(p)) { chrome = p; break; }
                }
            }

            if (!string.IsNullOrEmpty(chrome))
            {
                string userDataDir = Path.Combine(appData, "SarkariFormsSeva", "ChromeProfile");
                browserPath = chrome;
                browserArgs = "--app=\"" + url + "\" --user-data-dir=\"" + userDataDir + "\" --no-first-run --no-default-browser-check --disable-background-networking --disable-component-update --disable-sync --disable-features=TranslateUI";
                return true;
            }

            // 2. Microsoft Edge (Next best for --app mode)
            string edge = GetBrowserFromAppPaths("msedge.exe");
            if (string.IsNullOrEmpty(edge))
            {
                string[] edgePaths = new string[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe")
                };
                foreach (string p in edgePaths)
                {
                    if (File.Exists(p)) { edge = p; break; }
                }
            }

            if (!string.IsNullOrEmpty(edge))
            {
                string userDataDir = Path.Combine(appData, "SarkariFormsSeva", "EdgeProfile");
                browserPath = edge;
                browserArgs = "--app=\"" + url + "\" --user-data-dir=\"" + userDataDir + "\" --no-first-run --no-default-browser-check --disable-background-networking --disable-component-update --disable-sync --disable-features=TranslateUI";
                return true;
            }

            // 3. Mozilla Firefox
            string firefox = GetBrowserFromAppPaths("firefox.exe");
            if (string.IsNullOrEmpty(firefox))
            {
                string[] firefoxPaths = new string[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Mozilla Firefox\firefox.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Mozilla Firefox\firefox.exe")
                };
                foreach (string p in firefoxPaths)
                {
                    if (File.Exists(p)) { firefox = p; break; }
                }
            }

            if (!string.IsNullOrEmpty(firefox))
            {
                browserPath = firefox;
                browserArgs = "-new-window \"" + url + "\"";
                return true;
            }

            // Fallback: Default browser
            browserPath = null;
            browserArgs = null;
            return false;
        }

        private static string GetBrowserFromAppPaths(string exeName)
        {
            try
            {
                using (RegistryKey key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\" + exeName))
                {
                    if (key != null)
                    {
                        object val = key.GetValue("");
                        if (val != null && File.Exists(val.ToString())) return val.ToString();
                    }
                }
            }
            catch { }

            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\" + exeName))
                {
                    if (key != null)
                    {
                        object val = key.GetValue("");
                        if (val != null && File.Exists(val.ToString())) return val.ToString();
                    }
                }
            }
            catch { }

            return null;
        }

        #endregion
    }

    #region Application Context with Tray Icon

    public class SarkariAppContext : ApplicationContext
    {
        private NotifyIcon trayIcon;
        private ContextMenuStrip trayMenu;
        private string appUrl;

        public SarkariAppContext(string url)
        {
            this.appUrl = url;

            trayMenu = new ContextMenuStrip();

            var itemOpen = trayMenu.Items.Add("🚀 सरकारी फॉर्म सेवा खोलें (Open App)");
            itemOpen.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            itemOpen.Click += (s, e) => Program.OpenBrowserWindow(appUrl);

            trayMenu.Items.Add(new ToolStripSeparator());

            var itemExit = trayMenu.Items.Add("❌ सॉफ़्टवेयर बंद करें (Exit)");
            itemExit.Font = new Font("Segoe UI", 9f);
            itemExit.Click += (s, e) => ExitApp();

            trayIcon = new NotifyIcon();
            trayIcon.Text = "सरकारी फॉर्म सेवा (100% ऑफ़लाइन)";
            trayIcon.Icon = SystemIcons.Application;
            trayIcon.ContextMenuStrip = trayMenu;
            trayIcon.Visible = true;
            trayIcon.DoubleClick += (s, e) => Program.OpenBrowserWindow(appUrl);

            // Open the browser window immediately
            Program.OpenBrowserWindow(appUrl);
        }

        private void ExitApp()
        {
            try
            {
                trayIcon.Visible = false;
                trayIcon.Dispose();
            }
            catch { }

            Program.StopOfflineServer();
            Application.Exit();
        }
    }

    #endregion

    #region Activation Window Form

    public class ActivationForm : Form
    {
        private TextBox txtPassword;
        private Label lblError;
        private Button btnActivate;
        private string shortHardwareId;

        public ActivationForm(string hwId)
        {
            this.shortHardwareId = hwId;
            InitUI();
        }

        private void InitUI()
        {
            this.Text = "सरकारी फॉर्म सेवा - सॉफ़्टवेयर एक्टिवेशन";
            this.Size = new Size(540, 480);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.BackColor = Color.FromArgb(15, 23, 42); // #0f172a
            this.ForeColor = Color.White;

            Panel card = new Panel();
            card.Size = new Size(480, 410);
            card.Location = new Point(22, 16);
            card.BackColor = Color.FromArgb(30, 41, 59); // #1e293b
            card.Paint += (s, e) => {
                ControlPaint.DrawBorder(e.Graphics, card.ClientRectangle, Color.FromArgb(51, 65, 85), ButtonBorderStyle.Solid);
            };
            this.Controls.Add(card);

            Label lblTitle = new Label();
            lblTitle.Text = "सरकारी फॉर्म सेवा";
            lblTitle.Font = new Font("Segoe UI", 18, FontStyle.Bold);
            lblTitle.ForeColor = Color.White;
            lblTitle.TextAlign = ContentAlignment.MiddleCenter;
            lblTitle.Size = new Size(460, 36);
            lblTitle.Location = new Point(10, 20);
            card.Controls.Add(lblTitle);

            Label lblSub = new Label();
            lblSub.Text = "100% ऑफ़लाइन स्टैंडअलोन डेस्कटॉप संस्करण";
            lblSub.Font = new Font("Segoe UI", 10);
            lblSub.ForeColor = Color.FromArgb(148, 163, 184);
            lblSub.TextAlign = ContentAlignment.MiddleCenter;
            lblSub.Size = new Size(460, 22);
            lblSub.Location = new Point(10, 56);
            card.Controls.Add(lblSub);

            // Hardware Box
            Panel hwBox = new Panel();
            hwBox.Size = new Size(440, 68);
            hwBox.Location = new Point(20, 92);
            hwBox.BackColor = Color.FromArgb(15, 23, 42);
            hwBox.Paint += (s, e) => {
                ControlPaint.DrawBorder(e.Graphics, hwBox.ClientRectangle, Color.FromArgb(2, 132, 199), ButtonBorderStyle.Solid);
            };
            card.Controls.Add(hwBox);

            Label lblHwTitle = new Label();
            lblHwTitle.Text = "🔒 सुरक्षा मोड: हार्डवेयर लॉक (Motherboard & Machine Bound)";
            lblHwTitle.Font = new Font("Segoe UI", 8.5f, FontStyle.Bold);
            lblHwTitle.ForeColor = Color.FromArgb(186, 230, 253);
            lblHwTitle.Size = new Size(420, 20);
            lblHwTitle.Location = new Point(10, 8);
            hwBox.Controls.Add(lblHwTitle);

            Label lblHwVal = new Label();
            lblHwVal.Text = "इस कंप्यूटर का हार्डवेयर ID: " + this.shortHardwareId;
            lblHwVal.Font = new Font("Consolas", 10, FontStyle.Bold);
            lblHwVal.ForeColor = Color.FromArgb(56, 189, 248);
            lblHwVal.Size = new Size(420, 22);
            lblHwVal.Location = new Point(10, 32);
            hwBox.Controls.Add(lblHwVal);

            // Password Prompt
            Label lblPwdPrompt = new Label();
            lblPwdPrompt.Text = "मास्टर इंस्टॉलेशन पासवर्ड दर्ज करें:";
            lblPwdPrompt.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            lblPwdPrompt.ForeColor = Color.FromArgb(226, 232, 240);
            lblPwdPrompt.Size = new Size(440, 22);
            lblPwdPrompt.Location = new Point(20, 180);
            card.Controls.Add(lblPwdPrompt);

            txtPassword = new TextBox();
            txtPassword.Size = new Size(440, 32);
            txtPassword.Location = new Point(20, 206);
            txtPassword.Font = new Font("Segoe UI", 12);
            txtPassword.PasswordChar = '●';
            txtPassword.BackColor = Color.FromArgb(15, 23, 42);
            txtPassword.ForeColor = Color.White;
            card.Controls.Add(txtPassword);

            lblError = new Label();
            lblError.Text = "";
            lblError.Font = new Font("Segoe UI", 9, FontStyle.Bold);
            lblError.ForeColor = Color.FromArgb(248, 113, 113);
            lblError.Size = new Size(440, 24);
            lblError.Location = new Point(20, 246);
            card.Controls.Add(lblError);

            btnActivate = new Button();
            btnActivate.Text = "🔓 सॉफ़्टवेयर एक्टिवेट करें एवं शुरू करें";
            btnActivate.Size = new Size(440, 44);
            btnActivate.Location = new Point(20, 276);
            btnActivate.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            btnActivate.BackColor = Color.FromArgb(2, 132, 199);
            btnActivate.ForeColor = Color.White;
            btnActivate.FlatStyle = FlatStyle.Flat;
            btnActivate.FlatAppearance.BorderSize = 0;
            btnActivate.Cursor = Cursors.Hand;
            btnActivate.Click += BtnActivate_Click;
            card.Controls.Add(btnActivate);

            Label lblFooter = new Label();
            lblFooter.Text = "निर्माता: Niraj Kumar, Section Supervisor, RO, Faridabad\nसपोर्ट: smart.webpage.storage@gmail.com | 8700383426";
            lblFooter.Font = new Font("Segoe UI", 8);
            lblFooter.ForeColor = Color.FromArgb(100, 116, 139);
            lblFooter.TextAlign = ContentAlignment.MiddleCenter;
            lblFooter.Size = new Size(440, 36);
            lblFooter.Location = new Point(20, 350);
            card.Controls.Add(lblFooter);

            this.AcceptButton = btnActivate;
        }

        private void BtnActivate_Click(object sender, EventArgs e)
        {
            string pwd = txtPassword.Text.Trim();
            if (string.IsNullOrEmpty(pwd))
            {
                lblError.Text = "कृपया पासवर्ड दर्ज करें!";
                return;
            }

            string hwHash = Program.GetHardwareHash();
            bool success = Program.SaveActivation(pwd, hwHash);

            if (success)
            {
                MessageBox.Show(
                    "सॉफ़्टवेयर सफलतापूर्वक एक्टिवेट हो गया है!\n\nयह केवल इसी कंप्यूटर पर चलने के लिए सुरक्षित रूप से लॉक कर दिया गया है।",
                    "सफल एक्टिवेशन",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
                this.DialogResult = DialogResult.OK;
                this.Close();
            }
            else
            {
                lblError.Text = "❌ अमान्य पासवर्ड! कृपया सही मास्टर पासवर्ड दर्ज करें।";
                txtPassword.Focus();
                txtPassword.SelectAll();
            }
        }
    }

    #endregion
}
