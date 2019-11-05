const express = require("express");
const nodemailer = require('nodemailer');
const app = express();
const session = require("express-session");
const db = require('./db')
const methodOverride = require('method-override');
app.set("view engine", "hbs");
app.use(methodOverride('_method'));

/////////////////////////////////////////////////////////////////////
//                      Persistance login part                     //
var MySQLStore = require('express-mysql-session')(session);

var options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'session_test'
};

var sessionStore = new MySQLStore(options);

app.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}));
//                             end                                //
////////////////////////////////////////////////////////////////////

var OTP = 0;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const loggedInOnly = (failure = "/login") => (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect(failure);
  }
};

app.get("/", loggedInOnly(), (req, res) => {
  db.getAllBands(req.session.user.email)
    .then((bands) => {
      res.render("index", {
        name: req.session.user.username,
        bands
      })
    })
    .catch((err) => {
      res.send(err)
    })
})

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("login");
  }
});

app.delete('/delete', (req, res) => {
  let id = req.body.bandDelete;
  db.removeBand(id)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      res.send(err)
    })
})

app.post("/signup", (req, res) => {
  const { username, college, date, email, password } = req.body;
  db.createCredentials(username, college, date, email, password)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      res.send(err)
    });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.checkCredentials(email, password).then((check) => {
    if (check.length > 0) {
      req.session.user = {
        username: check[0].username,
        email: check[0].email
      };
      res.redirect("/");
    }
    else {
      res.sendStatus(401);
    }
  });
});

app.get('/forgot', (req, res) => {
  res.render('forgot')
})

app.post('/add', (req, res) => {
  let band = req.body.band;
  let email = req.session.user.email;

  db.addNewBand(band, email)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      res.send(err)
    })
})

app.post('/OTP', (req, res) => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your_mail@gmail.com',
      pass: 'your_password'
    }
  });

  OTP = Math.floor(1000 + Math.random() * 9000);
  var mailOptions = {
    from: 'mayank.mcs17.du@gmail.com',
    to: req.body.email,
    subject: 'Sending Email using Node.js',
    text: OTP.toString()
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.render('OTP', {
    email: req.body.email
  })
})

app.post('/checkotp', (req, res) => {
  if (req.body.otp === OTP.toString())
    res.render('newpassword', {
      email: req.body.email
    })
  else
    res.redirect('/')
})

app.put('/updatepswd', (req, res) => {
  db.updateUserPswd(req.body.email, req.body.password)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      res.send(err)
    });
})

app.post('/update', (req, res) => {
  db.updateBand(req.body.id, req.body.bandname)
    .then(() => {
      res.redirect("/")
    })
    .catch((err) => {
      console.log(err);
      res.send(err)
    })
})

app.get('/update/:id', (req, res) => {
  res.render('edit', {
    id: req.params.id
  })
})

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

app.listen(9000, () => console.log("running"));
