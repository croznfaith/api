const fetch = require('node-fetch');

// Your Telegram Bot Token
const BOT_TOKEN = '8488314208:AAEpn00TUMudtmGO4RgrFEtfxeLB235m6Qg';

// User database
const usersDB = {
    "5730398152": {
        "name": "XThrlen", 
        "email": "XThrlen@gmail.com", 
        "phone": "+116259298292"
    },
    "654321": {
        "name": "Jane Smith", 
        "email": "jane@example.com", 
        "phone": "+0987654321"
    },
    "112233": {
        "name": "Raj Sharma", 
        "email": "raj@example.com", 
        "phone": "+919876543210"
    }
};

// In-memory OTP storage (for demo)
let otpStorage = {};

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const { uid } = req.body;

            if (!uid) {
                return res.json({ success: false, message: 'UID is required' });
            }

            // Check if user exists
            if (!usersDB[uid]) {
                return res.json({ success: false, message: 'User ID not found!' });
            }

            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            otpStorage[uid] = otp;

            const userProfile = usersDB[uid];

            // Send OTP via Telegram
            const telegramMessage = `🔐 *OTP Verification*\n\n✅ Your OTP Code: *${otp}*\n👤 User: ${userProfile.name}\n📧 Email: ${userProfile.email}\n📱 Phone: ${userProfile.phone}\n\n⏰ This OTP is valid for 10 minutes`;

            try {
                const telegramResponse = await fetch(
                    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat_id: uid,
                            text: telegramMessage,
                            parse_mode: 'Markdown'
                        })
                    }
                );

                const telegramResult = await telegramResponse.json();

                if (telegramResult.ok) {
                    return res.json({
                        success: true,
                        message: 'OTP sent successfully to your Telegram!',
                        profile: userProfile
                    });
                } else {
                    console.error('Telegram error:', telegramResult);
                    return res.json({
                        success: false,
                        message: 'Failed to send OTP via Telegram. Please check if you have started the bot.'
                    });
                }
            } catch (telegramError) {
                console.error('Telegram API error:', telegramError);
                return res.json({
                    success: false,
                    message: 'Telegram service error. Please try again.'
                });
            }

        } catch (error) {
            console.error('Server error:', error);
            return res.json({
                success: false,
                message: 'Server error: ' + error.message
            });
        }
    } else {
        res.json({ success: false, message: 'Method not allowed' });
    }
};
