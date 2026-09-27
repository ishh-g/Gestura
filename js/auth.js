/**
 * AI-Based Sign Language Recognition and Learning System
 * Authentication & User Profile Manager
 */

const AuthModule = (() => {
  const STORAGE_KEY = 'signai_user_session';

  const defaultUsers = {
    'student@example.com': {
      name: 'Alex Johnson',
      email: 'student@example.com',
      role: 'student',
      avatar: 'AJ',
      level: 'Intermediate (Level 4)',
      completedLessons: 18,
      totalLessons: 26,
      accuracyAvg: 94.2,
      streakDays: 7
    },
    'admin@example.com': {
      name: 'Dr. Sarah Mitchell',
      email: 'admin@example.com',
      role: 'admin',
      avatar: 'SM',
      level: 'System Administrator',
      completedLessons: 26,
      totalLessons: 26,
      accuracyAvg: 99.5,
      streakDays: 45
    }
  };

  let currentUser = null;

  const init = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        currentUser = JSON.parse(saved);
      } catch (e) {
        currentUser = defaultUsers['student@example.com'];
      }
    } else {
      currentUser = defaultUsers['student@example.com'];
      saveSession();
    }
    updateUI();
  };

  const saveSession = () => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = (email, password, role) => {
    let user = defaultUsers[email];
    if (!user) {
      user = {
        name: email.split('@')[0].toUpperCase(),
        email: email,
        role: role || 'student',
        avatar: email.substring(0, 2).toUpperCase(),
        level: role === 'admin' ? 'System Administrator' : 'Beginner (Level 1)',
        completedLessons: role === 'admin' ? 26 : 4,
        totalLessons: 26,
        accuracyAvg: 88.0,
        streakDays: 1
      };
    } else if (role) {
      user.role = role;
    }

    currentUser = user;
    saveSession();
    updateUI();
    AppModule.showToast('Login Successful', `Welcome back, ${currentUser.name}!`, 'success');
    
    if (currentUser.role === 'admin') {
      window.location.hash = 'admin';
    } else {
      window.location.hash = 'dashboard';
    }
    closeAuthModal();
  };

  const logout = () => {
    currentUser = null;
    saveSession();
    updateUI();
    AppModule.showToast('Logged Out', 'You have been safely signed out.', 'info');
    window.location.hash = 'home';
  };

  const updateUI = () => {
    const userBtn = document.getElementById('nav-user-btn');
    const loginBtn = document.getElementById('nav-login-btn');
    const userNameEl = document.getElementById('nav-user-name');
    const userAvatarEl = document.getElementById('nav-user-avatar');
    const userRoleEl = document.getElementById('nav-user-role');
    const adminNav = document.getElementById('nav-item-admin');
    const dashboardNav = document.getElementById('nav-item-dashboard');

    if (currentUser) {
      if (userBtn) userBtn.style.display = 'flex';
      if (loginBtn) loginBtn.style.display = 'none';
      if (userNameEl) userNameEl.textContent = currentUser.name.split(' ')[0];
      if (userAvatarEl) userAvatarEl.textContent = currentUser.avatar;
      if (userRoleEl) userRoleEl.textContent = currentUser.role;

      if (adminNav) {
        adminNav.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
      }
      if (dashboardNav) {
        dashboardNav.style.display = 'inline-block';
      }
    } else {
      if (userBtn) userBtn.style.display = 'none';
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (adminNav) adminNav.style.display = 'none';
      if (dashboardNav) dashboardNav.style.display = 'none';
    }
  };

  const openAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('modal-open');
  };

  const closeAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('modal-open');
  };

  const getUser = () => currentUser;

  const persist = () => saveSession();

  return {
    init,
    login,
    logout,
    getUser,
    persist,
    openAuthModal,
    closeAuthModal
  };
})();
