const express = require("express");
const router = express.Router();
const passport = require("passport");

//@desc auth with google
//@route GET /auth/google

router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

//@desc google auth callback
//@route GET /auth/google/callback

router.get("/google/callback", passport.authenticate('google',{failureRedirect:'/'}),(req,res)=>{
    // if successfull redirect to the dashboard
    res.redirect('/dashboard')

});

//@desc Logout User
//@route GET /auth/logout
router.get('/logout',(req,res)=>{
    req.logout()
    res.redirect('/')
})

module.exports = router;
