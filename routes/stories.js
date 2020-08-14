const express = require("express");
const Story = require("../models/Story");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const { storySchema } = require("../validation");
const multer = require("multer");
const path = require("path");

//set storage engine
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname+"-"+Date.now()+path.extname(file.originalname)
    );
  },
});

// init upload
const multerConfig = multer({
  limits: { fileSize: 1000000 },
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

// chech file type
checkFileType = (file, cb) => {
  // allowed extensions
  const fileTypes = /jpeg|jpg|png|gif/;

  //check extensions
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

  //check mimetype
  const mimetype = fileTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only");
  }
};

var upload = multerConfig.single("image");

//@desc  Process add form
//@route POST  /stories/dashboard
router.post(
  "/",
  function (req, res, next) {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.

        res.render("stories/add", {
          multermessage: { vmessage: err },
        });
      } else if (err) {
        res.render("stories/add", {
          message: { vmessage: err.message },
        });
        // An unknown error occurred when uploading.
      }
      // Everything went fine.
      return next();
    });
  },
  ensureAuth,
  async (req, res) => {
    try {
      let story = new Story({
        title: req.body.title,
        body: req.body.body,
        status: req.body.status,
        image: req.file.filename || "",
        user: req.user.id,
      });
      req.body.user = req.user.id;
      await story.save();
      res.redirect("/dashboard");
    } catch (error) {
      const validation = storySchema.validate(req.body);
      if (validation.error) {
        res.render("stories/add", {
          message: { vmessage: validation.error.details[0].message },
        });
      }
    }
  }
);

//@desc show specific story

router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById({ _id: req.params.id })
      .populate("user")
      .lean();
    if (!story) {
      res.render("error/404");
    } else {
      res.render("stories/show", { story });
    }
  } catch (error) {
    console.error(error);
    res.render("error/500");
  }
});

//@desc show add page
//@route GET  /stories/add/view
router.get("/add/view", ensureAuth, async (req, res) => {
  let user = req.user;
  res.render("stories/add", { name: user.firstName });
});

//@desc show edit page
router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id }).lean();
    if (!story) {
      res.render("error/404");
    } else {
      res.render("stories/edit", { story });
    }
  } catch (error) {
    console.error(error);
    return res.render("error/404");
  }
});

//@desc Update story
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById({ _id: req.params.id }).lean();
    if (!story) {
      res.render("error/404");
    } else {
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      res.redirect("/dashboard");
    }
  } catch (error) {
    console.error(error);
    return res.render("error/500");
  }
});

//@desc delete story
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    await Story.remove({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    return res.render("error/500");
  }
});

module.exports = router;
