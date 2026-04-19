const fs = require('fs');
const path = require('path');

// Target files and their corresponding secret variable names
const fileSecrets = [
  {
    name: 'google-services.json',
    secret: process.env.GOOGLE_SERVICES_JSON_BASE64
  },
  {
    name: 'attendance-app-4245e-firebase-adminsdk-yuh0e-481eabde94.json',
    secret: process.env.FIREBASE_ADMIN_SDK_BASE64
  }
];

console.log('--- Checking for file secrets ---');

fileSecrets.forEach(({ name, secret }) => {
  if (secret) {
    try {
      const filePath = path.join(process.cwd(), name);
      const decodedContent = Buffer.from(secret, 'base64').toString('utf-8');
      fs.writeFileSync(filePath, decodedContent);
      console.log(`Successfully created ${name} from secret.`);
    } catch (error) {
      console.error(`Error creating ${name}:`, error.message);
    }
  } else {
    console.log(`Secret for ${name} not found. Skipping.`);
  }
});

console.log('--- Finished file secret processing ---');
