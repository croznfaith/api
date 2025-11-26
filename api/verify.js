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
            const { userid, otp } = req.query;

            if (!userid || !otp) {
                return res.json({ 
                    success: false, 
                    message: 'User ID and OTP are required',
                    error: 'Missing parameters'
                });
            }

            // Verify OTP
            if (otpStorage[userid] && otpStorage[userid] === otp) {
                // OTP matched - remove it
                delete otpStorage[userid];
                return res.json({ 
                    success: true, 
                    message: 'OTP verified successfully!',
                    data: {
                        user_id: userid,
                        verification_status: 'verified',
                        timestamp: new Date().toISOString()
                    }
                });
            } else {
                return res.json({ 
                    success: false, 
                    message: 'Invalid OTP!',
                    error: 'OTP mismatch or expired',
                    data: {
                        user_id: userid,
                        verification_status: 'failed'
                    }
                });
            }

        } catch (error) {
            console.error('Verification error:', error);
            return res.json({
                success: false,
                message: 'Server error during verification',
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
