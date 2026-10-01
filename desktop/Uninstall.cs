using System;
using System.IO;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;
using Microsoft.Win32;

namespace SarkariFormsSevaUninstall
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            bool isSilent = (args.Length > 0 && args[0] == "/quiet");

            if (!isSilent)
            {
                DialogResult dr = MessageBox.Show(
                    "क्या आप वाकई अपने कंप्यूटर से 'सरकारी फॉर्म सेवा' को अनइंस्टॉल करना चाहते हैं?",
                    "सरकारी फॉर्म सेवा - अनइंस्टॉल की पुष्टि",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Question
                );

                if (dr != DialogResult.Yes)
                {
                    return;
                }
            }

            try
            {
                // 1. Kill running instances of SarkariFormsSeva
                foreach (var proc in Process.GetProcessesByName("SarkariFormsSeva"))
                {
                    try { proc.Kill(); proc.WaitForExit(2000); } catch { }
                }

                // 2. Remove Shortcuts
                string[] desktopShortcuts = new string[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "Sarkari Forms Seva.lnk"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "सरकारी फॉर्म सेवा.lnk")
                };
                foreach (string sc in desktopShortcuts)
                {
                    if (File.Exists(sc)) { try { File.Delete(sc); } catch { } }
                }

                string[] startMenuFolders = new string[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "Sarkari Forms Seva"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "सरकारी फॉर्म सेवा")
                };
                foreach (string sm in startMenuFolders)
                {
                    if (Directory.Exists(sm)) { try { Directory.Delete(sm, true); } catch { } }
                }

                // 3. Remove Registry Entry from Windows Add/Remove Programs
                try
                {
                    using (RegistryKey parent = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall", true))
                    {
                        if (parent != null)
                        {
                            parent.DeleteSubKeyTree("SarkariFormsSeva", false);
                        }
                    }
                }
                catch { }

                // 4. Remove License & User Settings
                string appDataDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                    "SarkariFormsSeva"
                );
                if (Directory.Exists(appDataDir))
                {
                    try { Directory.Delete(appDataDir, true); } catch { }
                }

                // 5. Schedule directory deletion upon exit
                string installDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\');
                string tempBat = Path.Combine(Path.GetTempPath(), "remove_sarkariformsseva.bat");
                string batCommands = string.Format(
                    "@echo off\r\n" +
                    "ping 127.0.0.1 -n 2 > nul\r\n" +
                    ":retry\r\n" +
                    "rmdir /s /q \"{0}\"\r\n" +
                    "if exist \"{0}\" (\r\n" +
                    "  ping 127.0.0.1 -n 2 > nul\r\n" +
                    "  goto retry\r\n" +
                    ")\r\n" +
                    "del \"%~f0\"\r\n",
                    installDir
                );
                File.WriteAllText(tempBat, batCommands);

                ProcessStartInfo psi = new ProcessStartInfo("cmd.exe", "/c \"" + tempBat + "\"")
                {
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    WindowStyle = ProcessWindowStyle.Hidden
                };
                Process.Start(psi);

                if (!isSilent)
                {
                    MessageBox.Show(
                        "'सरकारी फॉर्म सेवा' आपके सिस्टम से सफलतापूर्वक अनइंस्टॉल कर दी गई है।",
                        "अनइंस्टॉल पूरा हुआ",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Information
                    );
                }
            }
            catch (Exception ex)
            {
                if (!isSilent)
                {
                    MessageBox.Show(
                        "अनइंस्टॉल के दौरान त्रुटि: " + ex.Message,
                        "त्रुटि",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                }
            }
        }
    }
}
