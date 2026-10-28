const fs = require('fs');
let content = fs.readFileSync('frontend/js/admin-dashboard.js', 'utf8');

// Replace 1: inside verifyAuthenticator
content = content.replace(
  /const authBtn = document\.getElementById\('btn-admin-authenticator'\);\s*if \(authBtn\) \{\s*authBtn\.textContent = 'Authenticated';\s*authBtn\.disabled = true;\s*\}/g,
  \const authBtn = document.getElementById('btn-admin-authenticator');
    if (authBtn) {
      authBtn.style.display = 'none';
      const tick = document.getElementById('admin-verified-tick');
      if (tick) tick.style.display = 'inline-block';
    }\
);

// Replace 2: inside init
content = content.replace(
  /if \(user\.twoFactorEnabled\) \{\s*const authBtn = document\.getElementById\('btn-admin-authenticator'\);\s*if \(authBtn\) \{\s*authBtn\.textContent = 'Authenticated';\s*authBtn\.disabled = true;\s*\}\s*\}/g,
  \if (user.twoFactorEnabled) {
        const authBtn = document.getElementById('btn-admin-authenticator');
        if (authBtn) {
          authBtn.style.display = 'none';
          const tick = document.getElementById('admin-verified-tick');
          if (tick) tick.style.display = 'inline-block';
        }
      }\
);

fs.writeFileSync('frontend/js/admin-dashboard.js', content);
