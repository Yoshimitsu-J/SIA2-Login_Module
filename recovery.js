const ACCOUNT_STORAGE_KEY = 'grc_account';
const OTP_LENGTH = 6;
const DEFAULT_ACCOUNT = { email: 'jayiscotton@gmail.com', password: 'HelloWorld@123' };

function getRandomOtp() {
  return Math.floor(Math.random() * 900000 + 100000).toString();
}

function getStoredAccount() {
  const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  if (!raw) {
    // Do not initialize storage here; return runtime defaults.
    return { ...DEFAULT_ACCOUNT };
  }
  try {
    const parsed = JSON.parse(raw);
    console.log('recovery.getStoredAccount - raw:', raw);
    return { ...DEFAULT_ACCOUNT, ...parsed };
  } catch (err) {
    console.warn('recovery.getStoredAccount - parse error, using default', err);
    return { ...DEFAULT_ACCOUNT };
  }
}

function saveStoredAccount(account) {
  try {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
    localStorage.setItem(ACCOUNT_STORAGE_KEY + '_updated_at', String(Date.now()));
    console.log('recovery.saveStoredAccount - saved', account);
  } catch (err) {
    console.error('recovery.saveStoredAccount - failed', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const otpModal = document.getElementById('otp-modal');
  const passwordModal = document.getElementById('password-modal');
  const successModal = document.getElementById('success-modal');
  const getOtpBtn = document.getElementById('get-otp');
  const otpInput = document.getElementById('otp-input');
  const verifyOtpBtn = document.getElementById('verify-otp');
  const otpError = document.getElementById('otp-error');
  const passwordError = document.getElementById('password-error');
  const changePasswordBtn = document.getElementById('change-password');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const modalCloses = document.querySelectorAll('.modal-close');
  const inputRecoveryEmail = document.getElementById('input-recovery-email');
  const emailError = document.getElementById('email-error');

  let generatedOtp = null;
  let account = getStoredAccount();
  let recoveryEmail = '';

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  modalCloses.forEach((button) => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal-overlay');
      closeModal(modal);
    });
  });

  [otpModal, passwordModal, successModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  function syncRecoveryEmail() {
    recoveryEmail = inputRecoveryEmail ? inputRecoveryEmail.value.trim() : '';
    if (emailError) emailError.textContent = '';
  }

  syncRecoveryEmail();

  inputRecoveryEmail.addEventListener('input', () => {
    if (emailError) emailError.textContent = '';
  });

  getOtpBtn.addEventListener('click', () => {
    syncRecoveryEmail();
    if (!recoveryEmail || !/^\S+@\S+\.\S+$/.test(recoveryEmail)) {
      if (emailError) emailError.textContent = 'Please enter a valid email address.';
      return;
    }
    if (recoveryEmail !== account.email) {
      if (emailError) emailError.textContent = 'This email is not registered.';
      return;
    }
    generatedOtp = getRandomOtp();
    alert(`From GRCme: Hello user ${recoveryEmail}, your OTP Verification Code is ${generatedOtp}.`);
    otpError.textContent = '';
    if (otpInput) otpInput.value = '';
    openModal(otpModal);
  });

  verifyOtpBtn.addEventListener('click', () => {
    if (!otpInput) return;
    const entered = otpInput.value.trim();
    if (entered.length !== OTP_LENGTH || !/^[0-9]{6}$/.test(entered)) {
      otpError.textContent = 'Please enter a valid 6-digit OTP.';
      return;
    }
    if (entered !== generatedOtp) {
      otpError.textContent = 'Incorrect OTP. Please try again.';
      return;
    }
    otpError.textContent = '';
    closeModal(otpModal);
    openModal(passwordModal);
  });

  function validatePassword(password, email) {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasMinimumLength = password.length >= 8;
    const emailPrefix = email ? email.split('@')[0].toLowerCase() : '';
    const containsEmailPrefix = emailPrefix && password.toLowerCase().includes(emailPrefix);
    const messages = [];

    if (!hasMinimumLength) messages.push('At least 8 characters long.');
    if (!hasUpper) messages.push('Include at least one uppercase letter.');
    if (!hasLower) messages.push('Include at least one lowercase letter.');
    if (!hasNumber) messages.push('Include at least one number.');
    if (!hasSpecial) messages.push('Include at least one special character.');
    if (containsEmailPrefix) messages.push('Do not include your email username.');
    if (password === account.password) messages.push('New password must differ from the current password.');

    return {
      valid: messages.length === 0,
      messages,
    };
  }

  changePasswordBtn.addEventListener('click', () => {
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!newPassword || !confirmPassword) {
      passwordError.textContent = 'Please fill both password fields.';
      return;
    }
    if (newPassword !== confirmPassword) {
      passwordError.textContent = 'Passwords do not match.';
      return;
    }

    const validation = validatePassword(newPassword, account.email);
    if (!validation.valid) {
      passwordError.innerHTML = validation.messages.map((msg) => `• ${msg}`).join('<br>');
      return;
    }

    account.password = newPassword;
    saveStoredAccount(account);
    passwordError.textContent = '';
    closeModal(passwordModal);
    openModal(successModal);
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    generatedOtp = null;
  });
});