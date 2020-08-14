const express = require("express");
const Story = require("../models/Story");
const router = express.Router();
const moment =  require('moment')
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//@desc Login/Landing page
//@route GET /

router.get("/", ensureGuest, (req, res) => {
  res.render("login", {
    layout: "login",
  });
});

//@desc dashboard
//@route GET /dashboard

router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    let user = req.user
    let date = moment()
    const stories = await Story.find({ user: req.user.id }).sort({createdAt:'desc'}).lean();
    
    res.render("dashboard", { user: {
      name:user.firstName,
      image: user.image
    }, stories:stories });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
