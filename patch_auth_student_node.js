const fs = require('fs');
let content = fs.readFileSync('frontend/js/student-dashboard.js', 'utf8');

// Replace 1
content = content.replace(
  /if \(user\.twoFactorEnabled\) \{\s*authBtn\.textContent = 'Authenticated';\s*authBtn\.disabled = true;\s*\} else \{/g,
  `if (user.twoFactorEnabled) {
          authBtn.style.display = 'none';
          const tick = document.getElementById('student-verified-tick');
          if (tick) tick.style.display = 'inline-flex';
        } else {`
);

// Replace 2
content = content.replace(
  /const authBtn = document\.getElementById\('btn-authenticator-setup'\);\s*if \(authBtn\) \{\s*authBtn\.textContent = 'Authenticated';\s*authBtn\.disabled = true;\s*\}/g,
  `const authBtn = document.getElementById('btn-authenticator-setup');
      if (authBtn) {
        authBtn.style.display = 'none';
        const tick = document.getElementById('student-verified-tick');
        if (tick) tick.style.display = 'inline-flex';
      }`
);

fs.writeFileSync('frontend/js/student-dashboard.js', content);
