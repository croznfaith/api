// In-memory OTP storage (same as send-otp.js)
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
            const { uid, otp } = req.body;

            if (!uid || !otp) {
                return res.json({ success: false, message: 'UID and OTP are required' });
            }

            // Verify OTP
            if (otpStorage[uid] && otpStorage[uid] === otp) {
                // OTP matched - remove it
                delete otpStorage[uid];
                return res.json({ 
                    success: true, 
                    message: 'OTP verified successfully! ✅' 
                });
            } else {
                return res.json({ 
                    success: false, 
                    message: 'Invalid OTP! ❌ Please check and try again.' 
                });
            }

        } catch (error) {
            console.error('Verification error:', error);
            return res.json({
                success: false,
                message: 'Server error: ' + error.message
            });
        }
    } else {
        res.json({ success: false, message: 'Method not allowed' });
    }
};
