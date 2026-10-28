const fs = require('fs');
const img = fs.readFileSync('frontend/images/logo.jpg');
const b64 = img.toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <filter id="purple-tint">
    <feColorMatrix type="hueRotate" values="65"/>
    <feColorMatrix type="saturate" values="1.2"/>
  </filter>
  <image href="data:image/jpeg;base64,${b64}" width="512" height="512" filter="url(#purple-tint)"/>
</svg>`;
fs.writeFileSync('frontend/images/logo-purple.svg', svg);
