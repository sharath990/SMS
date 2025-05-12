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
  // Debug logging
  console.log('Twilio package available:', !!twilio);
  console.log('TWILIO_ACCOUNT_SID available:', !!accountSid);
  console.log('TWILIO_AUTH_TOKEN available:', !!authToken);
  console.log('TWILIO_PHONE_NUMBER available:', !!twilioPhoneNumber);
  console.log('TWILIO_WHATSAPP_NUMBER available:', !!twilioWhatsAppNumber);

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
      console.warn('IMPORTANT: Messages are not actually being sent. This is a mock implementation.');
      console.warn('To send real messages, please:');
      console.warn('1. Ensure the twilio package is installed: npm install twilio');
      console.warn('2. Set up valid Twilio credentials in your .env file');

      return {
        success: true,
        sid: `MOCK_SMS_${Date.now()}`,
        to,
        body,
        status: 'mock-delivered',
        mock: true,
        message: 'This is a mock message and was not actually sent to the recipient'
      };
    }

    // Format phone number if needed (ensure it has country code)
    const formattedNumber = formatPhoneNumber(to);
    console.log(`Sending SMS to formatted number: ${formattedNumber}`);

    // Validate SMS number format
    if (!formattedNumber.startsWith('+')) {
      console.error('SMS number must start with country code (e.g., +91)');
      return {
        success: false,
        error: 'SMS number must start with country code (e.g., +91)',
        errorDetails: 'The number format is invalid for SMS. It must include the country code with a + prefix.',
        errorCode: 'INVALID_FORMAT',
        to,
        body,
        status: 'failed'
      };
    }

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
      console.warn('IMPORTANT: WhatsApp messages are not actually being sent. This is a mock implementation.');
      console.warn('To send real WhatsApp messages, please:');
      console.warn('1. Ensure the twilio package is installed: npm install twilio');
      console.warn('2. Set up valid Twilio credentials in your .env file');
      console.warn('3. Set up the Twilio WhatsApp sandbox or Business Profile');

      return {
        success: true,
        sid: `MOCK_WHATSAPP_${Date.now()}`,
        to,
        body,
        status: 'mock-delivered',
        mock: true,
        message: 'This is a mock WhatsApp message and was not actually sent to the recipient'
      };
    }

    // Format phone number if needed (ensure it has country code)
    const formattedNumber = formatPhoneNumber(to);
    console.log(`Sending WhatsApp message to formatted number: ${formattedNumber}`);

    // Validate WhatsApp number format
    if (!formattedNumber.startsWith('+')) {
      console.error('WhatsApp number must start with country code (e.g., +91)');
      return {
        success: false,
        error: 'WhatsApp number must start with country code (e.g., +91)',
        errorDetails: 'The number format is invalid for WhatsApp. It must include the country code with a + prefix.',
        errorCode: 'INVALID_FORMAT',
        to,
        body,
        status: 'failed'
      };
    }

    // IMPORTANT: Check if we're using the Twilio Sandbox
    const isSandbox = !process.env.TWILIO_WHATSAPP_BUSINESS_ID;

    if (isSandbox) {
      console.warn('=== TWILIO WHATSAPP SANDBOX MODE ===');
      console.warn('Recipients must opt in to your WhatsApp sandbox before you can send them messages.');
      console.warn(`They need to send the message "join ${process.env.TWILIO_WHATSAPP_SANDBOX_CODE || 'your-sandbox-code'}" to ${twilioWhatsAppNumber}`);
      console.warn('See: https://www.twilio.com/docs/whatsapp/sandbox for more information');
    }

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
      body,
      sandboxMode: isSandbox,
      note: isSandbox ?
        "Using WhatsApp Sandbox: Recipient must have opted in by sending the join message to your Twilio number" :
        "Using WhatsApp Business API"
    };
  } catch (error) {
    console.error(`Error sending WhatsApp message to ${to}:`, error);

    // Provide more helpful error messages for common WhatsApp errors
    let errorMessage = error.message;
    let errorDetails = '';

    if (error.code === 63001) {
      errorMessage = "Recipient has not opted into your WhatsApp sandbox";
      errorDetails = `The recipient must send "join ${process.env.TWILIO_WHATSAPP_SANDBOX_CODE || 'your-sandbox-code'}" to ${twilioWhatsAppNumber} before you can message them`;
    } else if (error.code === 63003) {
      errorMessage = "Message contains non-approved template";
      errorDetails = "In WhatsApp Business API, you can only send approved templates for the first message";
    } else if (error.code === 21211) {
      errorMessage = "Invalid WhatsApp number";
      errorDetails = "The recipient's number is not a valid WhatsApp number";
    } else if (error.code === 21608) {
      errorMessage = "WhatsApp message cannot be sent";
      errorDetails = "The recipient may have opted out or there's an issue with your WhatsApp Business Profile";
    }

    // Return error information instead of throwing
    return {
      success: false,
      error: errorMessage,
      errorDetails: errorDetails,
      errorCode: error.code,
      to,
      body,
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
  sendWhatsApp,
  twilioClient // Export the client so other modules can check if it's initialized
};
