const fetch = require('node-fetch');

// Your Telegram Bot Token
const BOT_TOKEN = '8488314208:AAEpn00TUMudtmGO4RgrFEtfxeLB235m6Qg';

// In-memory OTP storage
let otpStorage = {};

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            const { userid } = req.query;

            if (!userid) {
                return res.json({ 
                    success: false, 
                    message: 'User ID/Username is required',
                    error: 'Missing userid parameter'
                });
            }

            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            
            // First, try to get user info from Telegram
            let userInfo = {};
            try {
                const userResponse = await fetch(
                    `https://api.telegram.org/bot${BOT_TOKEN}/getChat`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat_id: userid
                        })
                    }
                );

                const userResult = await userResponse.json();
                
                if (userResult.ok) {
                    const chat = userResult.result;
                    userInfo = {
                        user_id: chat.id,
                        first_name: chat.first_name || 'Unknown',
                        last_name: chat.last_name || '',
                        username: chat.username || 'No username',
                        full_name: `${chat.first_name || ''} ${chat.last_name || ''}`.trim()
                    };
                    
                    // Store OTP with user ID
                    otpStorage[chat.id] = otp;
                } else {
                    return res.json({
                        success: false,
                        message: 'Telegram user not found or bot not started',
                        error: userResult.description,
                        data: {
                            input_userid: userid,
                            telegram_status: 'user_not_found'
                        }
                    });
                }
            } catch (userError) {
                console.error('User info error:', userError);
                return res.json({
                    success: false,
                    message: 'Error fetching user info from Telegram',
                    error: userError.message
                });
            }

            // Send OTP via Telegram
            const telegramMessage = `🔐 *OTP Verification*\n\n✅ Your OTP Code: *${otp}*\n👤 User: ${userInfo.full_name}\n🔗 Username: @${userInfo.username}\n\n⏰ This OTP is valid for 10 minutes`;

            try {
                const telegramResponse = await fetch(
                    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat_id: userInfo.user_id,
                            text: telegramMessage,
                            parse_mode: 'Markdown'
                        })
                    }
                );

                const telegramResult = await telegramResponse.json();

                if (telegramResult.ok) {
                    return res.json({
                        success: true,
                        message: 'OTP sent successfully to Telegram!',
                        data: {
                            user_id: userInfo.user_id,
                            first_name: userInfo.first_name,
                            last_name: userInfo.last_name,
                            full_name: userInfo.full_name,
                            username: userInfo.username,
                            otp_generated: otp,
                            telegram_status: 'message_sent',
                            timestamp: new Date().toISOString()
                        }
                    });
                } else {
                    console.error('Telegram API error:', telegramResult);
                    return res.json({
                        success: false,
                        message: 'Failed to send OTP via Telegram',
                        error: telegramResult.description || 'Telegram API error',
                        data: {
                            user_id: userInfo.user_id,
                            telegram_status: 'failed'
                        }
                    });
                }
            } catch (telegramError) {
                console.error('Telegram network error:', telegramError);
                return res.json({
                    success: false,
                    message: 'Network error while sending Telegram message',
                    error: telegramError.message
                });
            }

        } catch (error) {
            console.error('Server error:', error);
            return res.json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    } else {
        return res.json({
            success: false,
            message: 'Method not allowed. Use GET request.',
            error: 'Invalid HTTP method'
        });
    }
};
