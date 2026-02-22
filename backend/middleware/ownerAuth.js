exports.requireVerifiedOwner = async (req, res, next) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ 
        success: false, 
        message: 'Owner access required' 
      });
    }

    if (!req.user.ownerProfile?.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your owner account is pending admin approval',
        redirect: '/owner/pending'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};