using System;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;
using System.Management;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Win32;

namespace SarkariFormsSevaInstaller
{
    static class Program
    {
        private const string MASTER_PASSWORD = "040278221195080511110416";
        private const string SALT = "SarkariFormsSeva-HardwareLock-2026-NirajKumar";

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new InstallerForm());
        }

        #region Hardware Security & License Generation

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

        public static void GenerateHardwareLicense(string hwHash)
        {
            string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string dir = Path.Combine(appData, "SarkariFormsSeva");
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

            string payload = "LICENSED|" + hwHash + "|" + DateTime.UtcNow.ToString("O") + "|NIRAJ-KUMAR";
            byte[] encrypted = EncryptLicense(payload, hwHash);
            File.WriteAllBytes(Path.Combine(dir, "device-license.lic"), encrypted);
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

        #endregion

        #region Shortcut Creation

        public static void CreateShortcut(string shortcutPath, string targetExePath, string description, string workingDir)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType != null)
                {
                    object shell = Activator.CreateInstance(shellType);
                    object shortcut = shellType.InvokeMember("CreateShortcut", BindingFlags.InvokeMethod, null, shell, new object[] { shortcutPath });
                    if (shortcut != null)
                    {
                        Type scType = shortcut.GetType();
                        scType.InvokeMember("TargetPath", BindingFlags.SetProperty, null, shortcut, new object[] { targetExePath });
                        scType.InvokeMember("WorkingDirectory", BindingFlags.SetProperty, null, shortcut, new object[] { workingDir });
                        scType.InvokeMember("Description", BindingFlags.SetProperty, null, shortcut, new object[] { description });
                        scType.InvokeMember("Save", BindingFlags.InvokeMethod, null, shortcut, null);
                    }
                }
            }
            catch { }
        }


        #endregion
    }

    public class InstallerForm : Form
    {
        private const string MASTER_PASSWORD = "040278221195080511110416";

        private TextBox txtPassword;
        private Label lblError;
        private Button btnInstall;
        private ProgressBar prgProgress;
        private Label lblStatus;
        private string currentHwHash;

        public InstallerForm()
        {
            currentHwHash = Program.GetHardwareHash();
            InitUI();
        }

        private void InitUI()
        {
            this.Text = "सरकारी फॉर्म सेवा - इंस्टॉलेशन एवं सेटअप";
            this.Size = new Size(580, 560);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.BackColor = Color.FromArgb(15, 23, 42); // Slate-900
            this.ForeColor = Color.White;

            Panel card = new Panel();
            card.Size = new Size(520, 485);
            card.Location = new Point(22, 16);
            card.BackColor = Color.FromArgb(30, 41, 59); // Slate-800
            card.Paint += (s, e) => {
                ControlPaint.DrawBorder(e.Graphics, card.ClientRectangle, Color.FromArgb(51, 65, 85), ButtonBorderStyle.Solid);
            };
            this.Controls.Add(card);

            // Title
            Label lblTitle = new Label();
            lblTitle.Text = "🏛️ सरकारी फॉर्म सेवा";
            lblTitle.Font = new Font("Segoe UI", 18, FontStyle.Bold);
            lblTitle.ForeColor = Color.White;
            lblTitle.TextAlign = ContentAlignment.MiddleCenter;
            lblTitle.Size = new Size(500, 36);
            lblTitle.Location = new Point(10, 18);
            card.Controls.Add(lblTitle);

            Label lblSub = new Label();
            lblSub.Text = "ऑफ़लाइन डेस्कटॉप इंस्टॉलेशन विज़ार्ड (Offline Setup)";
            lblSub.Font = new Font("Segoe UI", 10.5f);
            lblSub.ForeColor = Color.FromArgb(148, 163, 184);
            lblSub.TextAlign = ContentAlignment.MiddleCenter;
            lblSub.Size = new Size(500, 24);
            lblSub.Location = new Point(10, 56);
            card.Controls.Add(lblSub);

            // Hardware Box
            Panel hwBox = new Panel();
            hwBox.Size = new Size(480, 76);
            hwBox.Location = new Point(20, 90);
            hwBox.BackColor = Color.FromArgb(15, 23, 42);
            hwBox.Paint += (s, e) => {
                ControlPaint.DrawBorder(e.Graphics, hwBox.ClientRectangle, Color.FromArgb(2, 132, 199), ButtonBorderStyle.Solid);
            };
            card.Controls.Add(hwBox);

            Label lblHwTitle = new Label();
            lblHwTitle.Text = "🔒 सुरक्षा मोड: हार्डवेयर लॉक (Motherboard + Machine Bound)";
            lblHwTitle.Font = new Font("Segoe UI", 9f, FontStyle.Bold);
            lblHwTitle.ForeColor = Color.FromArgb(186, 230, 253);
            lblHwTitle.Size = new Size(460, 20);
            lblHwTitle.Location = new Point(10, 10);
            hwBox.Controls.Add(lblHwTitle);

            Label lblHwVal = new Label();
            lblHwVal.Text = "सिस्टम हार्डवेयर ID: " + Program.GetShortHardwareId(currentHwHash);
            lblHwVal.Font = new Font("Consolas", 10.5f, FontStyle.Bold);
            lblHwVal.ForeColor = Color.FromArgb(56, 189, 248);
            lblHwVal.Size = new Size(460, 22);
            lblHwVal.Location = new Point(10, 34);
            hwBox.Controls.Add(lblHwVal);

            Label lblHwNote = new Label();
            lblHwNote.Text = "नोट: इंस्टॉलेशन के बाद यह सॉफ्टवेयर केवल इसी कंप्यूटर पर काम करेगा।";
            lblHwNote.Font = new Font("Segoe UI", 7.5f);
            lblHwNote.ForeColor = Color.FromArgb(148, 163, 184);
            lblHwNote.Size = new Size(460, 16);
            lblHwNote.Location = new Point(10, 54);
            hwBox.Controls.Add(lblHwNote);

            // Password Prompt
            Label lblPwdPrompt = new Label();
            lblPwdPrompt.Text = "🔑 इंस्टॉलेशन मास्टर पासवर्ड दर्ज करें:";
            lblPwdPrompt.Font = new Font("Segoe UI", 10.5f, FontStyle.Bold);
            lblPwdPrompt.ForeColor = Color.FromArgb(226, 232, 240);
            lblPwdPrompt.Size = new Size(480, 22);
            lblPwdPrompt.Location = new Point(20, 180);
            card.Controls.Add(lblPwdPrompt);

            txtPassword = new TextBox();
            txtPassword.Size = new Size(480, 32);
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
            lblError.Size = new Size(480, 24);
            lblError.Location = new Point(20, 242);
            card.Controls.Add(lblError);

            prgProgress = new ProgressBar();
            prgProgress.Size = new Size(480, 14);
            prgProgress.Location = new Point(20, 268);
            prgProgress.Style = ProgressBarStyle.Marquee;
            prgProgress.Visible = false;
            card.Controls.Add(prgProgress);

            lblStatus = new Label();
            lblStatus.Text = "";
            lblStatus.Font = new Font("Segoe UI", 8.5f);
            lblStatus.ForeColor = Color.FromArgb(56, 189, 248);
            lblStatus.Size = new Size(480, 20);
            lblStatus.Location = new Point(20, 286);
            lblStatus.Visible = false;
            card.Controls.Add(lblStatus);

            btnInstall = new Button();
            btnInstall.Text = "📦 सॉफ्टवेयर इंस्टॉल एवं एक्टिवेट करें";
            btnInstall.Size = new Size(480, 46);
            btnInstall.Location = new Point(20, 312);
            btnInstall.Font = new Font("Segoe UI", 11.5f, FontStyle.Bold);
            btnInstall.BackColor = Color.FromArgb(2, 132, 199);
            btnInstall.ForeColor = Color.White;
            btnInstall.FlatStyle = FlatStyle.Flat;
            btnInstall.FlatAppearance.BorderSize = 0;
            btnInstall.Cursor = Cursors.Hand;
            btnInstall.Click += BtnInstall_Click;
            card.Controls.Add(btnInstall);

            Label lblFooter = new Label();
            lblFooter.Text = "निर्माता: Niraj Kumar, Section Supervisor, RO, Faridabad\nसपोर्ट: smart.webpage.storage@gmail.com | 8700383426";
            lblFooter.Font = new Font("Segoe UI", 8);
            lblFooter.ForeColor = Color.FromArgb(100, 116, 139);
            lblFooter.TextAlign = ContentAlignment.MiddleCenter;
            lblFooter.Size = new Size(480, 36);
            lblFooter.Location = new Point(20, 420);
            card.Controls.Add(lblFooter);

            this.AcceptButton = btnInstall;
        }

        private void BtnInstall_Click(object sender, EventArgs e)
        {
            string pwd = txtPassword.Text.Trim();
            if (pwd != MASTER_PASSWORD)
            {
                lblError.Text = "❌ अमान्य पासवर्ड! बिना सही मास्टर पासवर्ड के इंस्टॉलेशन संभव नहीं है।";
                txtPassword.Focus();
                txtPassword.SelectAll();
                return;
            }

            lblError.Text = "";
            btnInstall.Enabled = false;
            txtPassword.Enabled = false;
            prgProgress.Visible = true;
            lblStatus.Visible = true;
            lblStatus.Text = "सॉफ्टवेयर फाइलों का निष्कर्षण हो रहा है...";

            Application.DoEvents();

            try
            {
                // Target Directory: %LOCALAPPDATA%\Programs\SarkariFormsSeva
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string installDir = Path.Combine(localAppData, "Programs", "SarkariFormsSeva");

                if (!Directory.Exists(installDir))
                {
                    Directory.CreateDirectory(installDir);
                }

                // 1. Extract embedded payload zip
                Assembly asm = Assembly.GetExecutingAssembly();
                string resourceName = null;
                foreach (string name in asm.GetManifestResourceNames())
                {
                    if (name.EndsWith("payload.zip", StringComparison.OrdinalIgnoreCase))
                    {
                        resourceName = name;
                        break;
                    }
                }

                if (resourceName != null)
                {
                    using (Stream resStream = asm.GetManifestResourceStream(resourceName))
                    using (ZipArchive archive = new ZipArchive(resStream, ZipArchiveMode.Read))
                    {
                        foreach (ZipArchiveEntry entry in archive.Entries)
                        {
                            string destPath = Path.Combine(installDir, entry.FullName);
                            if (string.IsNullOrEmpty(entry.Name))
                            {
                                // Directory
                                Directory.CreateDirectory(destPath);
                            }
                            else
                            {
                                Directory.CreateDirectory(Path.GetDirectoryName(destPath));
                                entry.ExtractToFile(destPath, true);
                            }
                        }
                    }
                }

                lblStatus.Text = "हार्डवेयर लाइसेंस सुरक्षित किया जा रहा है...";
                Application.DoEvents();

                // 2. Generate Hardware License
                Program.GenerateHardwareLicense(currentHwHash);

                lblStatus.Text = "डेस्कटॉप एवं स्टार्ट मेनू शॉर्टकट बनाए जा रहे हैं...";
                Application.DoEvents();

                // 3. Create Desktop Shortcut
                string appExe = Path.Combine(installDir, "SarkariFormsSeva.exe");
                string uninstallerExe = Path.Combine(installDir, "Uninstall.exe");

                string desktopLnk = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),
                    "Sarkari Forms Seva.lnk"
                );
                Program.CreateShortcut(desktopLnk, appExe, "Sarkari Forms Seva - 100% Offline", installDir);

                // 4. Create Start Menu Shortcuts
                string startMenuDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.Programs),
                    "Sarkari Forms Seva"
                );
                if (!Directory.Exists(startMenuDir)) Directory.CreateDirectory(startMenuDir);

                Program.CreateShortcut(Path.Combine(startMenuDir, "Sarkari Forms Seva.lnk"), appExe, "Sarkari Forms Seva", installDir);
                Program.CreateShortcut(Path.Combine(startMenuDir, "Uninstall Sarkari Forms Seva.lnk"), uninstallerExe, "Uninstall", installDir);

                // 5. Register in Windows Add/Remove Programs
                try
                {
                    using (RegistryKey parent = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\SarkariFormsSeva"))
                    {
                        if (parent != null)
                        {
                            parent.SetValue("DisplayName", "सरकारी फॉर्म सेवा (100% ऑफ़लाइन)");
                            parent.SetValue("DisplayVersion", "2.0.0");
                            parent.SetValue("Publisher", "Niraj Kumar (Faridabad)");
                            parent.SetValue("DisplayIcon", appExe + ",0");
                            parent.SetValue("InstallLocation", installDir);
                            parent.SetValue("UninstallString", "\"" + uninstallerExe + "\"");
                            parent.SetValue("NoModify", 1, RegistryValueKind.DWord);
                            parent.SetValue("NoRepair", 1, RegistryValueKind.DWord);
                        }
                    }
                }
                catch { }

                prgProgress.Visible = false;
                lblStatus.Text = "✅ इंस्टॉलेशन पूर्ण!";

                DialogResult res = MessageBox.Show(
                    "बधाई हो! 'सरकारी फॉर्म सेवा' आपके कंप्यूटर पर सफलतापूर्वक इंस्टॉल एवं हार्डवेयर-लॉक कर दी गई है।\n\n" +
                    "डेस्कटॉप पर शॉर्टकट बना दिया गया है। क्या आप इसे अभी चालू करना चाहते हैं?",
                    "इंस्टॉलेशन सफल",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Information
                );

                if (res == DialogResult.Yes)
                {
                    Process.Start(appExe);
                }

                this.Close();
            }
            catch (Exception ex)
            {
                prgProgress.Visible = false;
                lblStatus.Visible = false;
                btnInstall.Enabled = true;
                txtPassword.Enabled = true;
                MessageBox.Show("इंस्टॉलेशन के दौरान त्रुटि आई: " + ex.Message, "त्रुटि", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
