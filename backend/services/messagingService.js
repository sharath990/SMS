// Check if twilio is installed
let twilio;
try {
  twilio = require('twilio');
} catch (error) {
  console.error('Twilio package not found. Please install it using: npm install twilio');
  console.error('Using mock implementation instead.');
}

// Load environment variables
try {
  require('dotenv').config();
} catch (error) {
  console.error('dotenv package not found. Please install it using: npm install dotenv');
  console.error('Environment variables may not be loaded correctly.');
}

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Initialize Twilio client
let twilioClient;
try {
  if (twilio && accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
  } else {
    if (!twilio) {
      console.warn('Twilio package not available');
    }
    if (!accountSid || !authToken) {
      console.warn('Twilio credentials not found in environment variables');
    }
    console.warn('Using mock implementation for messaging');
  }
} catch (error) {
  console.error('Error initializing Twilio client:', error);
  console.warn('Using mock implementation for messaging');
}

/**
 * Send SMS message
 * @param {string} to - Recipient phone number (with country code)
 * @param {string} body - Message content
 * @returns {Promise} - Promise with message details or error
 */
const sendSMS = async (to, body) => {
  try {
    // Validate input parameters
    if (!to) {
      throw new Error('Recipient phone number is required');
    }

    if (!body) {
      throw new Error('Message body is required');
    }

    // Check if Twilio is configured
    if (!twilioClient) {
      console.warn('Twilio client not initialized. Using mock implementation.');
      return {
        success: true,
        sid: `MOCK_SMS_${Date.now()}`,
        to,
        body,
        status: 'mock-delivered',
        mock: true
      };
    }

    // Format phone number if needed (ensure it has country code)
    const formattedNumber = formatPhoneNumber(to);
    console.log(`Sending SMS to formatted number: ${formattedNumber}`);

    // Send SMS via Twilio
    const message = await twilioClient.messages.create({
      body,
      from: twilioPhoneNumber,
      to: formattedNumber
    });

    console.log(`SMS sent successfully to ${to}, SID: ${message.sid}`);
    return {
      success: true,
      sid: message.sid,
      status: message.status,
      to: formattedNumber,
      body
    };
  } catch (error) {
    console.error(`Error sending SMS to ${to}:`, error);
    // Return error information instead of throwing
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      to,
      body,
      mock: true,
      status: 'failed'
    };
  }
};

/**
 * Send WhatsApp message
 * @param {string} to - Recipient phone number (with country code)
 * @param {string} body - Message content
 * @returns {Promise} - Promise with message details or error
 */
const sendWhatsApp = async (to, body) => {
  try {
    // Validate input parameters
    if (!to) {
      throw new Error('Recipient phone number is required');
    }

    if (!body) {
      throw new Error('Message body is required');
    }

    // Check if Twilio is configured
    if (!twilioClient) {
      console.warn('Twilio client not initialized. Using mock implementation.');
      return {
        success: true,
        sid: `MOCK_WHATSAPP_${Date.now()}`,
        to,
        body,
        status: 'mock-delivered',
        mock: true
      };
    }

    // Format phone number if needed (ensure it has country code)
    const formattedNumber = formatPhoneNumber(to);
    console.log(`Sending WhatsApp message to formatted number: ${formattedNumber}`);

    // Send WhatsApp message via Twilio
    const message = await twilioClient.messages.create({
      body,
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to: `whatsapp:${formattedNumber}`
    });

    console.log(`WhatsApp message sent successfully to ${to}, SID: ${message.sid}`);
    return {
      success: true,
      sid: message.sid,
      status: message.status,
      to: formattedNumber,
      body
    };
  } catch (error) {
    console.error(`Error sending WhatsApp message to ${to}:`, error);
    // Return error information instead of throwing
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      to,
      body,
      mock: true,
      status: 'failed'
    };
  }
};

/**
 * Format phone number to ensure it has country code
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} - Formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) {
    return '';
  }

  try {
    // Remove any non-digit characters except the leading '+'
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // If the number doesn't start with a '+', add the default country code (India: +91)
    if (!cleaned.startsWith('+')) {
      // If the number is 10 digits (Indian mobile without country code)
      if (cleaned.length === 10) {
        return `+91${cleaned}`;
      }
    }

    // If it already has a country code, return as is
    return cleaned;
  } catch (error) {
    console.error('Error formatting phone number:', error);
    return phoneNumber; // Return original if there's an error
  }
};

module.exports = {
  sendSMS,
  sendWhatsApp
};
