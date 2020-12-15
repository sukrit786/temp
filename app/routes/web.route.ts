import express from "express";
import paypal from "paypal-rest-sdk";
import { Request, Response, NextFunction } from "express";
import { HomeController } from "../controllers/home.controller";

const route: express.Router = express.Router();
const homeController: HomeController = new HomeController();
const middleware = require("./dist/middleware");

route.get("/register", registerTemplate);
route.get("/login", loginTemplate);
route.get("/plan", planTemplate);

route.get("/dashboard", dashboardTemplate);
route.get("/account", accountTemplate);
route.get("/logout", logoutAction);

route.get("/create", paymentAction);
route.get("/cancel", (req, res) => res.redirect("/plan"));
route.get("/success", (req, res) => res.redirect("/plan"));

route.post("/register", registerRequest);
route.post("/login", loginRequest);

route.get("/", (req, res) => {
  res.redirect("/login");
});

route.get("/investors", middleware.readXlsx, investorsTemplate);
route.get("/option-sweeps", optionSweeps);

function investorsTemplate(req: Request, res: Response) {
  console.log(req.body.longTermData, req.body.shortTermData, req.body.pieChartData);
  res.render("dashboard/investors", {
    title: "Midas Circle",
    success: req.flash("success"),
    error: req.flash("error"),
  });
}

function registerTemplate(req: Request, res: Response) {
  res.render("home/register", {
    title: "Midas Circle",
    success: req.flash("success"),
    error: req.flash("error"),
  });
}
function loginTemplate(req: Request, res: Response) {
  res.render("home/login", {
    title: "Midas Circle",
    success: req.flash("success"),
    error: req.flash("error"),
  });
}
function planTemplate(req: Request, res: Response) {
  res.render("home/plan", {
    title: "",
    success: req.flash("success"),
    error: req.flash("error"),
  });
}

function registerRequest(req: Request, res: Response, next: NextFunction) {
  homeController
    .signUp(req.body)
    .then((data) => {
      req.flash("success", "Account Created Successfully") &&
        res.redirect("/register");
    })
    .catch(next);
}

function loginRequest(req: Request, res: Response, next: NextFunction) {
  homeController
    .signIn(req.body)
    .then((user) => {
      res.redirect("/dashboard");
    })
    .catch(next);
}

function logoutAction(req: Request, res: Response, next: NextFunction) {
  res.redirect("/login");
}
function optionSweeps(req: Request, res: Response, next: NextFunction) {
  setTimeout(function () {
    homeController
      .optionSweeps()
      .then((data) => {
        optionSweepsData: data;
        // res.redirect("/dashboard");
      })
      .catch(next);
  }, 100);
}
function dashboardTemplate(req: Request, res: Response, next: NextFunction) {
  // setInterval(function () {
  homeController
    .optionSweeps()
    .then((data) => {
      res.render("dashboard/index", {
        title: "Midas Circle",
        optionSweepsData: data,
        success: req.flash("success"),
        error: req.flash("error"),
      });
      // console.log(data);
      // res.redirect("/dashboard");
    })
    .catch(next);
  // }, 100000)
}
function accountTemplate(req: Request, res: Response, next: NextFunction) {
  res.render("dashboard/account", {
    title: "Midas Circle",
    success: req.flash("success"),
    error: req.flash("error"),
  });
}
function paymentAction(req: Request, res: Response, next: NextFunction) {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "https://midas-circle.herokuapp.com/success",
      cancel_url: "https://midas-circle.herokuapp.com/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red Sox Hat",
              sku: "001",
              price: "25.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "25.00",
        },
        description: "Hat for the best team ever",
      },
    ],
  };
  paypal.payment.create(create_payment_json, function (error, payment: any) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
}

export default route;
