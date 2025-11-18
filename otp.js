export default function handler(req, res) {
  if (req.method === 'POST') {
    const { uid, otp } = req.body;
    
    // User database
    const users = {
      "123456": { name: "John Doe", email: "john@example.com", phone: "+1234567890" },
      "654321": { name: "Jane Smith", email: "jane@example.com", phone: "+0987654321" }
    };
    
    // OTP storage (in memory)
    let otpStore = {};
    
    if (req.query.action === 'send') {
      const user = users[uid];
      if (!user) {
        return res.json({ success: false, message: "User not found!" });
      }
      
      // Generate OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000);
      otpStore[uid] = generatedOtp;
      
      return res.json({ 
        success: true, 
        message: `OTP sent: ${generatedOtp}`, 
        profile: user 
      });
    }
    
    if (req.query.action === 'verify') {
      if (otpStore[uid] == otp) {
        return res.json({ success: true, message: "OTP Verified! ✅" });
      } else {
        return res.json({ success: false, message: "Invalid OTP! ❌" });
      }
    }
  }
}
