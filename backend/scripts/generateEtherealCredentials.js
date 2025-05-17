const nodemailer = require('nodemailer');

/**
 * Generate Ethereal email credentials for testing
 * 
 * This script creates a test account on Ethereal and logs the credentials
 * that can be used in the .env file for testing email functionality.
 */
async function generateEtherealCredentials() {
  try {
    // Create a test account on Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('Ethereal Email Credentials:');
    console.log('---------------------------');
    console.log(`EMAIL_HOST=${testAccount.smtp.host}`);
    console.log(`EMAIL_PORT=${testAccount.smtp.port}`);
    console.log(`EMAIL_SECURE=${testAccount.smtp.secure}`);
    console.log(`EMAIL_USER=${testAccount.user}`);
    console.log(`EMAIL_PASSWORD=${testAccount.pass}`);
    console.log('\nCopy these values to your .env file');
    console.log('\nTo view sent emails, go to:');
    console.log('https://ethereal.email/login');
    console.log(`Username: ${testAccount.user}`);
    console.log(`Password: ${testAccount.pass}`);
  } catch (error) {
    console.error('Error generating Ethereal credentials:', error);
  }
}

// Run the function
generateEtherealCredentials();
