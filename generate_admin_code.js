const otplib = require('otplib');

const secret = 'T7KSUXV22J5QYD47DV2AOB7FSDAYXGSG'; // Admin TOTP secret

async function generate() {
  const code = await otplib.generate({ secret });
  console.log('----------------------------------------');
  console.log(`Your current authenticator code is: ${code}`);
  console.log('----------------------------------------');
  console.log('This code is valid for 30 seconds.');
}

generate().catch(console.error);
