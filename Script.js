 
  const PLAYFAB_TITLE_ID = "4AE9";
        const PLAYFAB_API_URL = "https://4AE9.playfabapi.com";
        const LICENSE_BASE_URL = "https://api.github.com/repos/Revansyabian/Webtopupotomatis/contents/lisensi";
        const ADMIN_PHONE = '6289520418604';
        
        // ==================== VARIABEL GLOBAL ====================
        let authToken = "";
        let cashAmount = 0;
        let accountName = "";
        let facebookName = "";
        let selectedAmount = 0;
        let previousBalance = 0;
        let currentLoginMethod = "";
        let lastTransactionData = null;
        let licenseData = null;
        let deviceId = "";
        let deferredPrompt = null;
        
        // ==================== ELEMEN DOM ====================
        function getElement(id) {
            const element = document.getElementById(id);
            if (!element) console.warn(`Element '${id}' not found`);
            return element;
        }
        
        // Login success popup elements
        const loginSuccessPopup = getElement('loginSuccessPopup');
        const loginSuccessMessage = getElement('loginSuccessMessage');
        const closeLoginSuccessBtn = getElement('closeLoginSuccessBtn');
        
        // License elements
        const licenseStatus = getElement('license-status');
        const licenseDays = getElement('license-days');
        const licenseInfo = getElement('license-info');
        const renewalSection = getElement('renewal-section');
        const renewalMessage = getElement('renewal-message');
        const loginContent = getElement('login-content');
        const licenseNameElement = getElement('license-name');
        
        // Main content elements
        const mainContent = getElement('main-content');
        const accessDenied = getElement('access-denied');
        const deviceIdInput = getElement('device-id-input');
        const xauthInput = getElement('xauth-input');
        const deviceLoginBtn = getElement('device-login-btn');
        const xauthLoginBtn = getElement('xauth-login-btn');
        const loginTabs = document.querySelectorAll('.login-tab');
        const loginForms = document.querySelectorAll('.login-form');
        const cashAmountElement = getElement('cash-amount');
        const accountNameElement = getElement('account-name');
        const facebookNameElement = getElement('facebook-name');
        const loginMethodElement = getElement('login-method');
        const amountInput = getElement('amount-input');
        const addCashBtn = getElement('add-cash-btn');
        const reduceCashBtn = getElement('reduce-cash-btn');
        const refreshBtn = getElement('refresh-btn');
        const logoutBtn = getElement('logout-btn');
        const selectedAmountElement = getElement('selected-amount');
        const statusMessage = getElement('status-message');
        const loadingElement = getElement('loading');
        const amountButtons = document.querySelectorAll('.amount-btn');
        const transactionDetails = getElement('transaction-details');
        const topupSection = getElement('topup-section');
        const loginSection = getElement('login-section');
        const accountInfo = getElement('account-info');
        const accountInfoTitle = getElement('account-info-title');
        const rememberDeviceIdCheckbox = getElement('remember-device-id');
        const printTransactionBtn = getElement('print-transaction-btn');
        const transactionPhotoCanvas = getElement('transaction-photo-canvas');
        
        // Access option buttons
        const accessOptionButtons = document.querySelectorAll('.access-options .access-btn, .renewal-section .access-btn');
        
        // Buyer modal elements
        const buyerModalOverlay = getElement('buyer-modal-overlay');
        const buyerModal = getElement('buyer-modal');
        const whatsappNumberInput = getElement('whatsapp-number-input');
        const additionalMessageInput = getElement('additional-message');
        const messagePreview = getElement('message-preview');
        const closeBuyerModalBtn = getElement('close-buyer-modal');
        const sendWhatsappBtn = getElement('send-whatsapp-btn');
        const sendBuyerBtn = getElement('send-buyer-btn');
        
        // PWA elements
        const pwaPopup = getElement('pwaPopup');
        const pwaInstallBtn = getElement('pwaInstallBtn');
        const pwaCloseBtn = getElement('pwaCloseBtn');
        const pwaInstallFixed = getElement('pwaInstallFixed');
        
        // ==================== FUNGSI UNTUK MENAMPILKAN POPUP LOGIN SUKSES ====================
        
        function showLoginSuccessPopup(loginMethod, accountName) {
            loginSuccessMessage.textContent = `Login dengan ${loginMethod} berhasil!\nSelamat datang ${accountName}!`;
            loginSuccessPopup.style.display = 'flex';
            
            setTimeout(() => {
                loginSuccessPopup.style.display = 'none';
            }, 3000);
        }
        
        // ==================== FUNGSI INGAT DEVICE ID ====================
        
        function saveDeviceId(deviceId) {
            if (rememberDeviceIdCheckbox && rememberDeviceIdCheckbox.checked) {
                localStorage.setItem('bussid_remembered_device_id', deviceId);
                localStorage.setItem('bussid_remember_device_checked', 'true');
            } else {
                localStorage.removeItem('bussid_remember_device_checked');
            }
        }
        
        function loadRememberedDeviceId() {
            const savedDeviceId = localStorage.getItem('bussid_remembered_device_id');
            const isChecked = localStorage.getItem('bussid_remember_device_checked') === 'true';
            
            if (savedDeviceId && deviceIdInput) {
                deviceIdInput.value = savedDeviceId;
            }
            
            if (rememberDeviceIdCheckbox && isChecked) {
                rememberDeviceIdCheckbox.checked = true;
            }
            
            return savedDeviceId && isChecked;
        }
        
        function clearRememberedDeviceId() {
            localStorage.removeItem('bussid_remembered_device_id');
            localStorage.removeItem('bussid_remember_device_checked');
            if (deviceIdInput) deviceIdInput.value = '';
            if (rememberDeviceIdCheckbox) rememberDeviceIdCheckbox.checked = false;
        }
        
        // ==================== FUNGSI KIRIM KE BUYER ====================
        
        function showBuyerModal() {
            if (!lastTransactionData) {
                showStatus('Tidak ada data transaksi untuk dikirim', false);
                return;
            }
            
            // Reset form
            whatsappNumberInput.value = '628';
            additionalMessageInput.value = '';
            
            // Update preview pesan
            updateMessagePreview();
            
            // Tampilkan modal
            buyerModalOverlay.style.display = 'flex';
        }
        
        function hideBuyerModal() {
            buyerModalOverlay.style.display = 'none';
        }
        
        function updateMessagePreview() {
            if (!lastTransactionData) return;
            
            const phoneNumber = whatsappNumberInput.value.trim() || '628XXXXXXXXXX';
            const additionalMsg = additionalMessageInput.value.trim();
            
            let message = `*BUKTI TRANSAKSI TOP UP BUSSID* 🚌\n`;
            message += `═══════════════════\n`;
            message += `👤 *Nama Akun:* ${lastTransactionData.account}\n`;
            message += `📝 *Jenis Transaksi:* ${lastTransactionData.type}\n`;
            message += `💰 *Jumlah UB:* ${lastTransactionData.amount.toLocaleString()} UB\n`;
            message += `📊 *Saldo Sebelum:* ${lastTransactionData.before.toLocaleString()} UB\n`;
            message += `✅ *Saldo Sesudah:* ${lastTransactionData.after.toLocaleString()} UB\n`;
            message += `🔄 *Status:* ${lastTransactionData.status}\n`;
            message += `📅 *Tanggal & Waktu:* ${lastTransactionData.date}\n`;
            message += `🎯 *ID Transaksi:* BUSSID-${Date.now().toString().slice(-8)}\n`;
            message += `═══════════════════\n`;
            
            if (additionalMsg) {
                message += `*Pesan Tambahan:*\n${additionalMsg}\n\n`;
            }
            
            message += `_Transaksi ini dilakukan melalui Web Top Up BUSSID Premium._\n`;
            message += `✅ *TRANSAKSI BERHASIL DAN AMAN* ✅`;
            
            messagePreview.textContent = message;
        }
        
        function sendToWhatsApp() {
            const phoneNumber = whatsappNumberInput.value.trim();
            
            if (!phoneNumber) {
                showStatus('Masukkan nomor WhatsApp buyer!', false);
                return;
            }
            
            if (phoneNumber.length < 10) {
                showStatus('Nomor WhatsApp tidak valid!', false);
                return;
            }
            
            // Hapus karakter non-digit
            const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
            
            // Pastikan nomor diawali dengan 62 (kode Indonesia)
            let finalPhoneNumber = cleanPhoneNumber;
            if (!finalPhoneNumber.startsWith('62')) {
                if (finalPhoneNumber.startsWith('0')) {
                    finalPhoneNumber = '62' + finalPhoneNumber.substring(1);
                } else {
                    finalPhoneNumber = '62' + finalPhoneNumber;
                }
            }
            
            // Ambil pesan dari preview
            const message = encodeURIComponent(messagePreview.textContent);
            
            // Buat URL WhatsApp
            const whatsappUrl = `https://wa.me/${finalPhoneNumber}?text=${message}`;
            
            // Buka WhatsApp di tab baru
            window.open(whatsappUrl, '_blank');
            
            // Tampilkan status sukses
            showStatus(`✅ Link WhatsApp berhasil dibuat untuk ${finalPhoneNumber}`, true);
            
            // Tutup modal
            hideBuyerModal();
        }
        
        // ==================== LICENSE SYSTEM ====================
        
        // Generate permanent license device ID
        function generatePermanentLicenseDeviceId() {
            let deviceId = localStorage.getItem('bussid_license_device_id');
            
            if (!deviceId) {
                const components = [
                    'LIC_',
                    navigator.userAgent,
                    navigator.platform,
                    screen.width + 'x' + screen.height,
                    new Date().getTimezoneOffset(),
                    navigator.language,
                    navigator.hardwareConcurrency || 'unknown'
                ].join('|');
                
                let hash = 0;
                for (let i = 0; i < components.length; i++) {
                    const char = components.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                
                deviceId = 'LIC_' + Math.abs(hash).toString(24).substring(0, 12).toUpperCase();
                localStorage.setItem('bussid_license_device_id', deviceId);
                console.log('Generated PERMANENT License Device ID:', deviceId);
            } else {
                console.log('Using existing PERMANENT License Device ID:', deviceId);
            }
            
            return deviceId;
        }
        
        // Check license from GitHub
        async function checkLicense(deviceId) {
            setLoading(true);
            try {
                const response = await fetch(`${LICENSE_BASE_URL}/${deviceId}.json`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('LICENSE_NOT_FOUND');
                    }
                    throw new Error('Gagal mengambil data license');
                }
                
                const data = await response.json();
                
                if (data.content) {
                    const decodedContent = atob(data.content.replace(/\n/g, ''));
                    licenseData = JSON.parse(decodedContent);
                } else {
                    licenseData = data;
                }
                
                return licenseData;
            } catch (error) {
                if (error.message === 'LICENSE_NOT_FOUND') {
                    return null;
                }
                throw error;
            } finally {
                setLoading(false);
            }
        }
        
        // Calculate days left from expiry date
        function calculateDaysLeft(expiryDate) {
            try {
                const [day, month, year] = expiryDate.split('-').map(Number);
                const expiry = new Date(year, month - 1, day);
                const today = new Date();
                const diff = expiry - today;
                const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                return daysLeft;
            } catch (error) {
                console.error('Error calculating days left:', error);
                return -1;
            }
        }
        
        // Calculate days expired
        function calculateDaysExpired(expiryDate) {
            try {
                const [day, month, year] = expiryDate.split('-').map(Number);
                const expiry = new Date(year, month - 1, day);
                const today = new Date();
                const diff = today - expiry;
                const daysExpired = Math.floor(diff / (1000 * 60 * 60 * 24));
                return daysExpired;
            } catch (error) {
                console.error('Error calculating days expired:', error);
                return -1;
            }
        }
        
        // Update license display
        function updateLicenseDisplay(license) {
            if (!licenseStatus || !licenseDays) return false;
            
            if (!license) {
                licenseStatus.textContent = "❌ 𝗜𝗗 𝗔𝗞𝗦𝗘𝗦 𝗧𝗜𝗗𝗔𝗞 𝗩𝗔𝗟𝗜𝗗";
                licenseStatus.className = "license-status license-expired";
                licenseDays.textContent = "ID tidak terdaftar pada database";
                return false;
            }
            
            const daysLeft = calculateDaysLeft(license.expiry_date);
            
            if (daysLeft > 0) {
                licenseStatus.textContent = "✅ 𝗜𝗗 𝗔𝗞𝗦𝗘𝗦 𝗩𝗔𝗟𝗜𝗗";
                licenseStatus.className = "license-status license-valid";
                licenseDays.textContent = `Masa aktif: ${daysLeft} hari tersisa`;
                
                if (licenseNameElement) licenseNameElement.textContent = license.name;
                if (renewalSection) renewalSection.style.display = 'none';
                if (loginContent) loginContent.style.display = 'block';
                
                return true;
            } else {
                licenseStatus.textContent = "❌ 𝗔𝗞𝗦𝗘𝗦 𝗧𝗘𝗟𝗔𝗛 𝗕𝗘𝗥𝗔𝗞𝗛𝗜𝗥";
                licenseStatus.className = "license-status license-expired";
                const daysExpired = calculateDaysExpired(license.expiry_date);
                licenseDays.textContent = `Masa aktif telah habis ${daysExpired} hari yang lalu`;
                
                if (licenseNameElement) licenseNameElement.textContent = license.name;
                
                if (renewalSection && renewalMessage) {
                    renewalSection.style.display = 'block';
                    renewalMessage.innerHTML = `Akses Anda telah berakhir <strong>${daysExpired} hari</strong> yang lalu.<br>
                                                Silakan perpanjang akses untuk melanjutkan menggunakan layanan top up.`;
                }
                if (loginContent) loginContent.style.display = 'none';
                
                return false;
            }
        }
        
        // Open WhatsApp for license purchase/renewal
        function openWhatsAppForLicense(deviceId, price, duration, isRenewal = false) {
            let message = '';
            
            if (isRenewal) {
                message = `Assalamu'alaikum, saya mau perpanjang akses Web Top Up Bussid ${duration} seharga Rp ${price}.000.\n\nAkses ID: ${deviceId}\nTanggal: ${new Date().toLocaleDateString('id-ID')}`;
            } else {
                message = `Assalamu'alaikum, saya mau beli akses Web Top Up Bussid ${duration} seharga Rp ${price}.000.\n\nAkses ID: ${deviceId}\nTanggal: ${new Date().toLocaleDateString('id-ID')}`;
            }
            
            const whatsappUrl = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
        
        // ==================== TRANSACTION PHOTO ====================
        
        function generateTransactionPhoto() {
            if (!lastTransactionData) {
                showStatus('Tidak ada data transaksi untuk dibuat foto', false);
                return;
            }
            
            // Buat canvas HD
            const canvas = transactionPhotoCanvas;
            const ctx = canvas.getContext('2d');
            
            // Set ukuran canvas HD (1920x1080)
            canvas.width = 1920;
            canvas.height = 1080;
            
            // Background gradien
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#001f3f');
            gradient.addColorStop(1, '#003366');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Header dengan gradien dan emoji
            const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            headerGradient.addColorStop(0, '#0074D9');
            headerGradient.addColorStop(1, '#00BFFF');
            ctx.fillStyle = headerGradient;
            ctx.fillRect(0, 0, canvas.width, 200);
            
            // Judul utama dengan emoji
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 80px "Montserrat", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🎮 BUKTI TRANSAKSI BUSSID 🎮', canvas.width / 2, 100);
            
            // Sub judul dengan emoji
            ctx.font = '35px "Roboto", sans-serif';
            ctx.fillText('💰 Top Up Money Berhasil 💰', canvas.width / 2, 150);
            
            // Container untuk konten
            const contentX = 150;
            const contentY = 300;
            const contentWidth = canvas.width - 300;
            const contentHeight = 600;
            
            // Background konten dengan efek kaca
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(contentX, contentY, contentWidth, contentHeight, 40);
            ctx.fill();
            ctx.stroke();
            
            // Data transaksi dengan emoji yang menarik
            const emojiData = [
                { emoji: '👤', label: 'Nama Akun', value: lastTransactionData.account },
                { emoji: '📝', label: 'Jenis Transaksi', value: lastTransactionData.type },
                { emoji: '💰', label: 'Jumlah UB', value: lastTransactionData.amount.toLocaleString() + ' UB' },
                { emoji: '📊', label: 'Saldo Sebelum', value: lastTransactionData.before.toLocaleString() + ' UB' },
                { emoji: '✅', label: 'Saldo Sesudah', value: lastTransactionData.after.toLocaleString() + ' UB' },
                { emoji: '🔄', label: 'Status', value: lastTransactionData.status },
                { emoji: '📅', label: 'Tanggal & Waktu', value: lastTransactionData.date },
                { emoji: '🎯', label: 'ID Transaksi', value: 'BUSSID-' + Date.now().toString().slice(-8) }
            ];
            
            let yPos = contentY + 100;
            const lineHeight = 70;
            
            emojiData.forEach(item => {
                // Emoji besar
                ctx.font = '45px Arial';
                ctx.fillText(item.emoji, contentX + 50, yPos);
                
                // Label dengan warna berbeda
                ctx.font = 'bold 34px "Roboto", sans-serif';
                ctx.fillStyle = '#00BFFF';
                ctx.fillText(item.label + ':', contentX + 120, yPos);
                
                // Value dengan styling khusus
                ctx.font = 'bold 38px "Roboto", sans-serif';
                if (item.label.includes('Sesudah') || item.label.includes('Status')) {
                    ctx.fillStyle = '#00FF88';
                } else if (item.label.includes('UB')) {
                    ctx.fillStyle = '#FFD700'; // Gold for money amounts
                } else {
                    ctx.fillStyle = '#FFFFFF';
                }
                
                // Align right for values
                ctx.textAlign = 'right';
                ctx.fillText(item.value, contentX + contentWidth - 50, yPos);
                ctx.textAlign = 'left';
                
                // Garis pemisah dengan efek gradien
                if (yPos < contentY + contentHeight - 100) {
                    ctx.strokeStyle = 'rgba(0, 191, 255, 0.3)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(contentX + 50, yPos + 35);
                    ctx.lineTo(contentX + contentWidth - 50, yPos + 35);
                    ctx.stroke();
                }
                
                yPos += lineHeight;
            });
            
            // Footer dengan efek khusus
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, canvas.height - 150, canvas.width, 150);
            
            // Garis pemisah footer
            ctx.strokeStyle = 'rgba(0, 191, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - 150);
            ctx.lineTo(canvas.width, canvas.height - 150);
            ctx.stroke();
            
            // Informasi footer dengan emoji
            ctx.fillStyle = '#CCCCCC';
            ctx.font = '28px "Roboto", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🎮 © BUSSID Money Top Up 🎮', canvas.width / 2, canvas.height - 90);
            ctx.fillText('📱 web by revan store 📱', canvas.width / 2, canvas.height - 50);
            
            // QR Code area (placeholder - bisa ditambahkan QR code asli)
            const qrSize = 100;
            const qrX = canvas.width - qrSize - 50;
            const qrY = canvas.height - qrSize - 40;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.strokeStyle = '#00BFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(qrX, qrY, qrSize, qrSize, 10);
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px "Roboto", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🔒', qrX + qrSize/2, qrY + qrSize/2);
            ctx.font = '12px "Roboto", sans-serif';
            ctx.fillText('SECURE', qrX + qrSize/2, qrY + qrSize/2 + 20);
            
            // Konversi ke data URL dengan kualitas tinggi
            const imageData = canvas.toDataURL('image/jpeg', 0.95);
            
            // Buat link untuk mengunduh gambar
            const downloadLink = document.createElement('a');
            downloadLink.href = imageData;
            downloadLink.download = `bukti-transaksi-bussid-${Date.now()}.jpg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            showStatus('✅ Foto transaksi HD berhasil dibuat dan diunduh!', true);
        }
        
        // ==================== FUNGSI BANTUAN ====================
        
        function showStatus(message, isSuccess) {
            if (!statusMessage) return;
            
            statusMessage.textContent = message;
            statusMessage.className = 'status-message ' + (isSuccess ? 'success' : 'error');
            statusMessage.style.display = 'block';
            
            setTimeout(() => {
                if (statusMessage) statusMessage.style.display = 'none';
            }, 5000);
        }
        
        function setLoading(isLoading) {
            if (!loadingElement) return;
            loadingElement.style.display = isLoading ? 'block' : 'none';
        }
        
        function updateSelectedAmountDisplay() {
            if (!selectedAmountElement) return;
            selectedAmountElement.textContent = `Selected Amount: ${selectedAmount.toLocaleString()}`;
        }
        
        function showTransactionDetails(account, type, amount, before, after, status) {
            const transAccount = getElement('trans-account');
            const transType = getElement('trans-type');
            const transAmount = getElement('trans-amount');
            const transBefore = getElement('trans-before');
            const transAfter = getElement('trans-after');
            const transStatus = getElement('trans-status');
            
            if (transAccount) transAccount.textContent = account;
            if (transType) transType.textContent = type;
            if (transAmount) transAmount.textContent = amount.toLocaleString();
            if (transBefore) transBefore.textContent = before.toLocaleString();
            if (transAfter) transAfter.textContent = after.toLocaleString();
            if (transStatus) transStatus.textContent = status;
            
            // Simpan data transaksi untuk dikirim ke buyer
            lastTransactionData = {
                account: account,
                type: type,
                amount: amount,
                before: before,
                after: after,
                status: status,
                date: new Date().toLocaleString('id-ID')
            };
            
            if (transactionDetails) {
                transactionDetails.style.display = 'block';
                transactionDetails.scrollIntoView({ behavior: 'smooth' });
            }
        }
        
        function showAccountInfo() {
            if (accountInfoTitle && accountInfo) {
                accountInfoTitle.classList.remove('hidden-section');
                accountInfo.classList.remove('hidden-section');
            }
        }
        
        function hideAccountInfo() {
            if (accountInfoTitle && accountInfo) {
                accountInfoTitle.classList.add('hidden-section');
                accountInfo.classList.add('hidden-section');
            }
        }
        
        // ==================== FUNGSI LOGIN & TOPUP ====================
        
        async function loginWithDeviceId(deviceId) {
            if (!deviceId) {
                showStatus('Masukkan Device ID untuk Top Up UB!', false);
                return false;
            }
            
            setLoading(true);
            
            try {
                const loginData = {
                    AndroidDeviceId: deviceId,
                    TitleId: PLAYFAB_TITLE_ID,
                    CreateAccount: true,
                    InfoRequestParameters: {
                        GetUserAccountInfo: true,
                        GetUserVirtualCurrency: true
                    }
                };
                
                console.log('Login data untuk Top Up:', loginData);
                
                const response = await fetch(`${PLAYFAB_API_URL}/Client/LoginWithAndroidDeviceID`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: Login dengan Device ID gagal`);
                }
                
                const data = await response.json();
                
                if (data.data && data.data.SessionTicket) {
                    authToken = data.data.SessionTicket;
                    currentLoginMethod = "Device ID";
                    
                    // Extract user info dari response
                    if (data.data.InfoResultPayload) {
                        const info = data.data.InfoResultPayload;
                        cashAmount = info.UserVirtualCurrency?.RP || 0;
                        accountName = info.AccountInfo?.TitleInfo?.DisplayName || 'Unknown';
                        
                        // AMBIL NAMA FACEBOOK DARI FacebookInfo jika ada
                        if (info.AccountInfo?.FacebookInfo) {
                            facebookName = info.AccountInfo.FacebookInfo.FullName || 'N/A';
                        } else {
                            facebookName = "Tidak terhubung Facebook";
                        }
                        
                        if (cashAmountElement) cashAmountElement.textContent = cashAmount.toLocaleString();
                        if (accountNameElement) accountNameElement.textContent = accountName;
                        if (facebookNameElement) facebookNameElement.textContent = facebookName;
                        if (loginMethodElement) loginMethodElement.textContent = currentLoginMethod;
                    }
                    
                    // Simpan Device ID jika checkbox dicentang
                    saveDeviceId(deviceId);
                    
                    // Tampilkan popup login sukses
                    showLoginSuccessPopup(currentLoginMethod, accountName);
                    
                    showAccountInfo();
                    return true;
                } else {
                    throw new Error('Token session tidak diterima dari PlayFab');
                }
            } catch (error) {
                console.error('Login error:', error);
                showStatus('Login gagal: ' + error.message, false);
                return false;
            } finally {
                setLoading(false);
            }
        }
        
        async function loginWithXAuth(xAuthToken) {
            setLoading(true);
            
            try {
                authToken = xAuthToken;
                currentLoginMethod = "X-Authorization";
                const userInfo = await getUserInfo();
                
                if (userInfo) {
                    // Tampilkan popup login sukses
                    showLoginSuccessPopup(currentLoginMethod, userInfo.name);
                    
                    showAccountInfo();
                    return true;
                } else {
                    throw new Error('token tidak valid');
                }
            } catch (error) {
                showStatus('Login gagal: ' + error.message, false);
                return false;
            } finally {
                setLoading(false);
            }
        }
        
        async function getUserInfo() {
            if (!authToken) return null;
            
            try {
                const data = {
                    InfoRequestParameters: {
                        GetUserAccountInfo: true,
                        GetUserVirtualCurrency: true
                    }
                };
                
                const response = await fetch(`${PLAYFAB_API_URL}/Client/GetPlayerCombinedInfo`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Authorization': authToken
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) throw new Error('Gagal mengambil informasi akun');
                
                const result = await response.json();
                
                if (result.code === 200) {
                    const info = result.data.InfoResultPayload;
                    cashAmount = info.UserVirtualCurrency?.RP || 0;
                    accountName = info.AccountInfo?.TitleInfo?.DisplayName || 'Unknown';
                    
                    // AMBIL NAMA FACEBOOK DARI FacebookInfo jika ada
                    if (info.AccountInfo?.FacebookInfo) {
                        facebookName = info.AccountInfo.FacebookInfo.FullName || 'N/A';
                    } else {
                        facebookName = "Tidak terhubung Facebook";
                    }
                    
                    if (cashAmountElement) cashAmountElement.textContent = cashAmount.toLocaleString();
                    if (accountNameElement) accountNameElement.textContent = accountName;
                    if (facebookNameElement) facebookNameElement.textContent = facebookName;
                    if (loginMethodElement) loginMethodElement.textContent = currentLoginMethod;
                    
                    return { name: accountName, balance: cashAmount };
                } else {
                    throw new Error(result.errorMessage || 'Error mengambil data');
                }
            } catch (error) {
                showStatus('Gagal mengambil info: ' + error.message, false);
                return null;
            }
        }
        
        async function modifyCash(amount) {
            if (!authToken) {
                showStatus('Silakan login terlebih dahulu', false);
                return false;
            }
            
            if (amount === 0) {
                showStatus('Jumlah tidak boleh 0', false);
                return false;
            }
            
            setLoading(true);
            
            try {
                previousBalance = cashAmount;
                
                const data = {
                    FunctionName: "AddRp",
                    FunctionParameter: { addValue: amount },
                    RevisionSelection: "Live",
                    GeneratePlayStreamEvent: false
                };
                
                const response = await fetch(`${PLAYFAB_API_URL}/Client/ExecuteCloudScript`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Authorization': authToken
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) throw new Error('HTTP Error: ' + response.status);
                
                const result = await response.json();
                
                if (result.data && result.data.FunctionName === 'AddRp') {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await getUserInfo();
                    
                    const action = amount > 0 ? 'ditambahkan' : 'dikurangi';
                    const absAmount = Math.abs(amount);
                    
                    showTransactionDetails(
                        accountName,
                        amount > 0 ? 'TOP UP' : 'REDUCE',
                        absAmount,
                        previousBalance,
                        cashAmount,
                        'SUCCESS'
                    );
                    
                    showStatus(`Berhasil ${action} ${absAmount.toLocaleString()} cash!`, true);
                    
                    selectedAmount = 0;
                    if (amountInput) amountInput.value = '';
                    updateSelectedAmountDisplay();
                    
                    return true;
                } else {
                    const errorMsg = result.data?.Error?.Message || 'Gagal memproses';
                    throw new Error(errorMsg);
                }
            } catch (error) {
                showStatus('Gagal: ' + error.message, false);
                return false;
            } finally {
                setLoading(false);
            }
        }
        
        function logout() {
            authToken = "";
            cashAmount = 0;
            accountName = "";
            facebookName = ""; // RESET NAMA FB
            selectedAmount = 0;
            currentLoginMethod = "";
            lastTransactionData = null;
            
            if (topupSection) topupSection.style.display = 'none';
            if (loginSection) loginSection.style.display = 'block';
            if (transactionDetails) transactionDetails.style.display = 'none';
            if (cashAmountElement) cashAmountElement.textContent = '-';
            if (accountNameElement) accountNameElement.textContent = '-';
            if (facebookNameElement) facebookNameElement.textContent = '-'; // RESET NAMA FB DI UI
            if (loginMethodElement) loginMethodElement.textContent = '-';
            if (deviceIdInput) deviceIdInput.value = '';
            if (xauthInput) xauthInput.value = '';
            
            hideAccountInfo();
            showStatus('Logout berhasil!', true);
        }
        
        // ==================== PWA FUNCTIONS ====================
        
        function showPwaPopup() {
            if (deferredPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
                pwaPopup.style.display = 'block';
                pwaInstallFixed.style.display = 'flex';
            }
        }
        
        function hidePwaPopup() {
            pwaPopup.style.display = 'none';
            pwaInstallFixed.style.display = 'none';
        }
        
        async function installPWA() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    console.log('PWA installed');
                } else {
                    console.log('PWA installation declined');
                }
                
                deferredPrompt = null;
                hidePwaPopup();
            }
        }
        
        // ==================== EVENT LISTENERS ====================
        
        document.addEventListener('DOMContentLoaded', async function() {
            // Generate device ID untuk license
            deviceId = generatePermanentLicenseDeviceId();
            
            // Check license
            const license = await checkLicense(deviceId);
            
            // Update license display
            const isValid = updateLicenseDisplay(license);
            
            // Load remembered device ID saat halaman dimuat
            loadRememberedDeviceId();
            
            // Setup access option buttons
            accessOptionButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const price = this.getAttribute('data-price');
                    const duration = this.getAttribute('data-duration');
                    const isRenewal = this.closest('.renewal-section') !== null;
                    openWhatsAppForLicense(deviceId, price, duration, isRenewal);
                });
            });
            
            // Langsung tampilkan aplikasi tanpa popup welcome
            if (license && isValid) {
                if (mainContent) mainContent.style.display = 'block';
                if (accessDenied) accessDenied.style.display = 'none';
            } else {
                if (mainContent) mainContent.style.display = 'none';
                if (accessDenied) accessDenied.style.display = 'block';
            }
            
            // Print transaction button
            if (printTransactionBtn) {
                printTransactionBtn.addEventListener('click', generateTransactionPhoto);
            }
            
            // Login tab switcher
            if (loginTabs && loginTabs.length > 0) {
                loginTabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        loginTabs.forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        loginForms.forEach(form => form.classList.remove('active'));
                        document.getElementById(`${tab.dataset.tab}-login-form`).classList.add('active');
                    });
                });
            }
            
            // Close login success popup
            if (closeLoginSuccessBtn) {
                closeLoginSuccessBtn.addEventListener('click', () => {
                    loginSuccessPopup.style.display = 'none';
                });
            }
            
            // Device ID login
            if (deviceLoginBtn) {
                deviceLoginBtn.addEventListener('click', async () => {
                    const inputDeviceId = deviceIdInput ? deviceIdInput.value.trim() : '';
                    const loginSuccess = await loginWithDeviceId(inputDeviceId);
                    if (loginSuccess) {
                        if (topupSection) topupSection.style.display = 'block';
                        if (loginSection) loginSection.style.display = 'none';
                    }
                });
            }
            
            // X-Auth login
            if (xauthLoginBtn) {
                xauthLoginBtn.addEventListener('click', async () => {
                    const xAuthToken = xauthInput ? xauthInput.value.trim() : '';
                    if (!xAuthToken) {
                        showStatus('Masukkan X-Authorization Token!', false);
                        return;
                    }
                    
                    const loginSuccess = await loginWithXAuth(xAuthToken);
                    if (loginSuccess) {
                        if (topupSection) topupSection.style.display = 'block';
                        if (loginSection) loginSection.style.display = 'none';
                    }
                });
            }
            
            // Amount buttons
            if (amountButtons && amountButtons.length > 0) {
                amountButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        amountButtons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');
                        
                        selectedAmount = parseInt(this.dataset.amount);
                        if (amountInput) amountInput.value = selectedAmount;
                        updateSelectedAmountDisplay();
                    });
                });
            }
            
            // Amount input change
            if (amountInput) {
                amountInput.addEventListener('input', function() {
                    let value = parseInt(this.value) || 0;
                    
                    if (value > 2147483647) {
                        value = 2147483647;
                        this.value = value;
                    }
                    
                    selectedAmount = value;
                    
                    if (amountButtons && amountButtons.length > 0) {
                        amountButtons.forEach(btn => {
                            if (parseInt(btn.dataset.amount) === value) {
                                btn.classList.add('active');
                            } else {
                                btn.classList.remove('active');
                            }
                        });
                    }
                    
                    updateSelectedAmountDisplay();
                });
            }
            
            // Add cash button
            if (addCashBtn) {
                addCashBtn.addEventListener('click', async () => {
                    if (selectedAmount <= 0) {
                        showStatus('Pilih jumlah terlebih dahulu!', false);
                        return;
                    }
                    
                    if (selectedAmount > 2147483647) {
                        showStatus('Jumlah melebihi batas maksimal!', false);
                        return;
                    }
                    
                    await modifyCash(selectedAmount);
                });
            }
            
            // Reduce cash button
            if (reduceCashBtn) {
                reduceCashBtn.addEventListener('click', async () => {
                    if (selectedAmount <= 0) {
                        showStatus('Pilih jumlah terlebih dahulu!', false);
                        return;
                    }
                    
                    if (selectedAmount > cashAmount) {
                        showStatus('Saldo tidak cukup!', false);
                        return;
                    }
                    
                    await modifyCash(-selectedAmount);
                });
            }
            
            // Refresh balance button
            if (refreshBtn) {
                refreshBtn.addEventListener('click', async () => {
                    await getUserInfo();
                    showStatus('Saldo berhasil di-refresh!', true);
                });
            }
            
            // Logout button
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    clearRememberedDeviceId();
                    logout();
                });
            }
            
            // ==================== EVENT LISTENERS UNTUK FITUR KIRIM KE BUYER ====================
            
            // Event listener untuk tombol "Kirim ke Buyer"
            if (sendBuyerBtn) {
                sendBuyerBtn.addEventListener('click', showBuyerModal);
            }
            
            // Event listener untuk tombol close modal
            if (closeBuyerModalBtn) {
                closeBuyerModalBtn.addEventListener('click', hideBuyerModal);
            }
            
            // Event listener untuk tombol kirim WhatsApp
            if (sendWhatsappBtn) {
                sendWhatsappBtn.addEventListener('click', sendToWhatsApp);
            }
            
            // Event listener untuk update preview saat input berubah
            if (whatsappNumberInput) {
                whatsappNumberInput.addEventListener('input', updateMessagePreview);
            }
            
            if (additionalMessageInput) {
                additionalMessageInput.addEventListener('input', updateMessagePreview);
            }
            
            // Tutup modal saat klik di luar modal
            if (buyerModalOverlay) {
                buyerModalOverlay.addEventListener('click', function(e) {
                    if (e.target === buyerModalOverlay) {
                        hideBuyerModal();
                    }
                });
            }
            
            // ==================== PWA EVENT LISTENERS ====================
            
            // PWA install button
            if (pwaInstallBtn) {
                pwaInstallBtn.addEventListener('click', installPWA);
            }
            
            // PWA close button
            if (pwaCloseBtn) {
                pwaCloseBtn.addEventListener('click', hidePwaPopup);
            }
            
            // PWA floating install button
            if (pwaInstallFixed) {
                pwaInstallFixed.addEventListener('click', installPWA);
            }
            
            // PWA beforeinstallprompt event
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                setTimeout(showPwaPopup, 3000);
            });
            
            // Add roundRect if not exists
            if (!CanvasRenderingContext2D.prototype.roundRect) {
                CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
                    if (w < 2 * r) r = w / 2;
                    if (h < 2 * r) r = h / 2;
                    this.beginPath();
                    this.moveTo(x + r, y);
                    this.arcTo(x + w, y, x + w, y + h, r);
                    this.arcTo(x + w, y + h, x, y + h, r);
                    this.arcTo(x, y + h, x, y, r);
                    this.arcTo(x, y, x + w, y, r);
                    this.closePath();
                    return this;
                }
            }
            
            // Check if app is already installed
            if (window.matchMedia('(display-mode: standalone)').matches) {
                hidePwaPopup();
            }
        });
