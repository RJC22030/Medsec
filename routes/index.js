var express = require("express");

var router = express.Router();
var User = require("../models/user");

router.get("/", function (req, res, next) {
  return res.render("index1.ejs");
});

router.post("/sign", function (req, res, next) {
  console.log(req.body);
  var personInfo = req.body;

  if (
    !personInfo.email ||
    !personInfo.username ||
    !personInfo.password ||
    !personInfo.passwordConf
  ) {
    res.redirect("/login");
  } else {
    if (personInfo.password == personInfo.passwordConf) {
      User.findOne({ email: personInfo.email }, function (err, data) {
        if (!data) {
          var c;
          User.findOne({}, function (err, data) {
            if (data) {
              console.log("if");
              c = data.unique_id + 1;
            } else {
              c = 1;
            }

            var newPerson = new User({
              unique_id: c,
              email: personInfo.email,
              username: personInfo.username,
              password: personInfo.password,
              passwordConf: personInfo.passwordConf,
            });

            newPerson.save(function (err, Person) {
              if (err) console.log(err);
              else {
                console.log("Success");
                res.redirect("/login");
              }
            });
          })
            .sort({ _id: -1 })
            .limit(1);
        } else {
          res.redirect("/login");
        }
      });
    } else {
      res.send(
        "<script>alert('Password is not matched'); window.location='/login';</script>"
      );
    }
  }
});

router.get("/sign", function (req, res, next) {
  return res.render("index.ejs");
});
router.get("/login", function (req, res, next) {
  return res.render("login.ejs");
});

router.post("/login", function (req, res, next) {
  User.findOne({ email: req.body.email }, function (err, data) {
    if (data) {
      if (data.password == req.body.password) {
        req.session.userId = data.unique_id;
        res.send({ Success: "Success!" });
      } else {
        res.send({ Success: "Wrong password!" });
      }
    } else {
      res.send({ Success: "This Email Is not registered!" });
    }
  });
});

router.get("/profile", function (req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  User.findOne({ unique_id: req.session.userId }, function (err, data) {
    if (!data) {
      res.redirect("/login");
    } else {
      return res.render("data.ejs", { name: data.username, email: data.email });
    }
  });
});

router.get("/logout", function (req, res, next) {
  if (req.session) {
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/");
      }
    });
  }
});

router.get("/forgetpass", function (req, res, next) {
  res.render("forget.ejs");
});

router.post("/forgetpass", function (req, res, next) {
  User.findOne({ email: req.body.email }, function (err, data) {
    if (!data) {
      res.send({ Success: "This Email Is not registered!" });
    } else {
      if (req.body.password == req.body.passwordConf) {
        data.password = req.body.password;
        data.passwordConf = req.body.passwordConf;

        data.save(function (err, Person) {
          if (err) console.log(err);
          else console.log("Success");
          res.send({ Success: "Password changed!" });
        });
      } else {
        res.send({
          Success:
            "Password does not match! Both Passwords should be the same.",
        });
      }
    }
  });
});

module.exports = router;
