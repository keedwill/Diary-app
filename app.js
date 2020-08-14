const express = require("express");
const path = require("path");
const morgan = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const Story = require("./models/Story");

const dotenv = require("dotenv");
const exphbs = require("express-handlebars");
const session = require("express-session");



// pass session as an argument
const mongoStore = require("connect-mongo")(session);
const connectDB = require("./config/db");

//load config
dotenv.config({ path: "./config/config.env" });

//passport config
//pass passport as an argument to the passport config file
require("./config/passport")(passport);

connectDB();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// method override
app.use(
  methodOverride((req, res) => {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//handlebars helpers

const { formatDate, truncate, select, stripTags } = require("./helpers/hbs");

// handlebars
app.engine(
  ".hbs",
  exphbs({
    helpers: { formatDate, truncate, select, stripTags },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

//sessions
app.use(
  session({
    secret: "Keyboard cat",
    resave: false,
    saveUninitialized: false,
    // save session of a logged in user to the db
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//passport middlware
app.use(passport.initialize());
app.use(passport.session());

//static folder
app.use(express.static(path.join(__dirname, "public")));

//routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `server running in ${process.env.NODE_ENV} mode on port ${PORT} `
  );
});


