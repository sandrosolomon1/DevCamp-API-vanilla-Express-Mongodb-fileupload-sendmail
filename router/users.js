const { Router } = require('express');
const express = require('express');

const {
    register,
    login,
    getme,
    forgotpassword,
    resetPassword,
    updateDetails,
    updatePassword
} = require('../controller/users');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/register')
      .post(register);

router.route('/login')
      .post(login);
      
router.route('/updatedetails')
      .put(protect,updateDetails);

router.route('/updatepassword')
      .put(protect,updatePassword);

router.route('/me')
      .get(protect,getme);

router.route('/forgotpassword/:resetpasswordtoken')
      .put(resetPassword);

router.post('/forgotpassword',forgotpassword);

module.exports = router;

