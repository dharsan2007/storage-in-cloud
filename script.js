/* =========================================
   1. GLOBAL VARIABLES
   ========================================= */
let uploadedProfilePic = ""; // Stores the base64 image data during registration
let generatedOTP = null;     // Stores the generated OTP for verification
let foundUsername = null;    // Stores the username being reset

/* =========================================
   2. INITIALIZATION & EVENT LISTENERS
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
    
    // --- A. Handle Registration Photo Upload ---
    const regFileInput = document.getElementById("faceUpload");
    const regPreview = document.getElementById("facePreview");
    const regStatus = document.getElementById("uploadStatus");
    const regVerifiedInput = document.getElementById("faceVerified");

    if (regFileInput) {
        regFileInput.addEventListener("change", function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Show preview
                    regPreview.src = e.target.result;
                    regPreview.classList.remove("hidden");
                    if(regStatus) regStatus.classList.add("hidden");
                    
                    // Mark as valid and store data
                    if(regVerifiedInput) regVerifiedInput.value = "true";
                    uploadedProfilePic = e.target.result; 
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // --- B. Handle Forgot Password Photo Upload ---
    const resetFileInput = document.getElementById("resetFaceUpload");
    const resetPreview = document.getElementById("resetFacePreview");
    const resetStatus = document.getElementById("resetUploadStatus");

    if (resetFileInput) {
        resetFileInput.addEventListener("change", function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    resetPreview.src = e.target.result;
                    resetPreview.classList.remove("hidden");
                    if(resetStatus) resetStatus.classList.add("hidden");
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // --- C. Load Dashboard Data (If on Dashboard) ---
    if (document.body.classList.contains("dashboard")) {
        loadDashboardProfile();
    }
});

/* =========================================
   3. AUTHENTICATION (Login & Register)
   ========================================= */

// --- Real-Time Password Strength Meter ---
function checkPasswordStrength() {
    const pass = document.getElementById("regPass").value;
    const fill = document.getElementById("strength-fill");
    let width = "0%", color = "transparent";

    if (pass.length > 0) { width = "30%"; color = "#ef4444"; } // Weak
    if (pass.length > 6) { width = "65%"; color = "#f59e0b"; } // Medium
    if (pass.length > 10) { width = "100%"; color = "#10b981"; } // Strong

    if (fill) {
        fill.style.width = width;
        fill.style.backgroundColor = color;
    }
}

// --- Register User ---
function register() {
    const user = document.getElementById("regUser").value.trim();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const pass = document.getElementById("regPass").value;
    const confirm = document.getElementById("regConfirmPass").value;
    const isVerified = document.getElementById("faceVerified").value;
    const agreed = document.getElementById("termsAgree").checked;

    if (!user || !name || !email || !pass) {
        alert("Please fill in all required fields.");
        return;
    }
    if (pass !== confirm) {
        alert("Passwords do not match.");
        return;
    }
    if (isVerified !== "true") {
        alert("Please upload a photo for biometric verification.");
        return;
    }
    if (!agreed) {
        alert("You must agree to the Terms of Service.");
        return;
    }

    // Save Data to LocalStorage
    localStorage.setItem("user", user);
    localStorage.setItem("pass", pass);
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    
    // Save Profile Picture
    if (uploadedProfilePic) {
        localStorage.setItem("profilePic", uploadedProfilePic);
    }

    alert("Account created successfully! Redirecting to Login...");
    window.location.href = "login.html";
}

// --- Login User ---
function login() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value;

    if (!user || !pass) {
        alert("Enter both username and password.");
        return;
    }

    const storedUser = localStorage.getItem("user");
    const storedPass = localStorage.getItem("pass");

    if (!storedUser) {
        alert("No account found. Please register first.");
        window.location.href = "register.html";
        return;
    }
    if (user === storedUser && pass === storedPass) {
        // Set a session flag
        sessionStorage.setItem("isLoggedIn", "true");
        alert("Login successful!");
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid username or password.");
    }
}

/* =========================================
   4. FORGOT PASSWORD LOGIC
   ========================================= */

// --- Step 1: Find User ---
function findUser() {
    const inputUser = document.getElementById("resetUser").value.trim();
    const storedUser = localStorage.getItem("user");

    if (!inputUser) {
        alert("Please enter a username.");
        return;
    }

    if (inputUser === storedUser) {
        foundUsername = storedUser;
        document.getElementById("step-find").classList.add("hidden");
        document.getElementById("step-method").classList.remove("hidden");
    } else {
        alert("User not found in local database.");
    }
}

// --- Step 2A: OTP Flow ---
function startOTP() {
    document.getElementById("step-method").classList.add("hidden");
    document.getElementById("step-otp").classList.remove("hidden");

    // Simulate Email OTP
    generatedOTP = Math.floor(1000 + Math.random() * 9000); 
    alert(`[SIMULATION] Email sent to ${localStorage.getItem("email") || "your email"}.\n\nYour OTP is: ${generatedOTP}`);
}

function verifyOTP() {
    const inputOTP = document.getElementById("otpInput").value;
    if (parseInt(inputOTP) === generatedOTP) {
        alert("OTP Verified Successfully!");
        showResetScreen();
    } else {
        alert("Invalid OTP. Please try again.");
    }
}

// --- Step 2B: Face ID Flow ---
function startFaceID() {
    document.getElementById("step-method").classList.add("hidden");
    document.getElementById("step-face").classList.remove("hidden");
}

function verifyFaceID() {
    const fileInput = document.getElementById("resetFaceUpload");
    
    if (fileInput.files.length === 0) {
        alert("Please upload an image for verification.");
        return;
    }

    // Simulation: Compare uploaded image with stored 'profilePic'
    // In a real app, this would use an API.
    setTimeout(() => {
        alert("Scanning biometrics...\n\nIdentity Match: 99.8%\nVerification Successful.");
        showResetScreen();
    }, 1000);
}

// --- Step 3: Reset Password ---
function showResetScreen() {
    document.getElementById("step-otp").classList.add("hidden");
    document.getElementById("step-face").classList.add("hidden");
    document.getElementById("step-reset").classList.remove("hidden");
}

function saveNewPassword() {
    const newPass = document.getElementById("newPass").value;
    const confirmPass = document.getElementById("confirmNewPass").value;

    if (!newPass || !confirmPass) {
        alert("Please fill in all fields.");
        return;
    }
    if (newPass !== confirmPass) {
        alert("Passwords do not match.");
        return;
    }

    localStorage.setItem("pass", newPass);
    alert("Password updated successfully! Redirecting to Login...");
    window.location.href = "login.html";
}

/* =========================================
   5. DASHBOARD LOGIC
   ========================================= */

function loadDashboardProfile() {
    const nameDisplay = document.getElementById("adminName");
    const emailDisplay = document.getElementById("adminEmail");
    const adminIcon = document.querySelector(".admin-icon");

    const storedName = localStorage.getItem("name");
    const storedEmail = localStorage.getItem("email");
    const storedPic = localStorage.getItem("profilePic");

    if (storedName && nameDisplay) nameDisplay.textContent = storedName;
    if (storedEmail && emailDisplay) emailDisplay.textContent = storedEmail;

    // If user has a profile pic, show it in the navbar instead of the icon
    if (storedPic && adminIcon) {
        adminIcon.innerHTML = `<img src="${storedPic}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    }
}

/* =========================================
   6. NAVIGATION & UTILITIES
   ========================================= */

function goLogin() { window.location.href = "login.html"; }
function goRegister() { window.location.href = "register.html"; }
function goDashboard() { window.location.href = "dashboard.html"; }

// Toggle Profile Dropdown
function toggleProfile() {
    const profileBox = document.getElementById("profileBox");
    if (profileBox) {
        profileBox.classList.toggle("hidden");
    }
}

// Close Dropdown on Outside Click
window.addEventListener('click', function(event) {
    const profileBox = document.getElementById("profileBox");
    const adminIcon = document.querySelector(".admin-icon");
    if (profileBox && adminIcon) {
        if (!profileBox.classList.contains("hidden") &&
            !event.target.closest(".profile-box") &&
            !event.target.closest(".admin-icon")) {
            profileBox.classList.add("hidden");
        }
    }
});