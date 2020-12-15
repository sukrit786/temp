"use strict";
exports.__esModule = true;
var express_1 = require("express");
var paypal_rest_sdk_1 = require("paypal-rest-sdk");
var home_controller_1 = require("../controllers/home.controller");
var route = express_1["default"].Router();
var homeController = new home_controller_1.HomeController();
route.get("/register", registerTemplate);
route.get("/login", loginTemplate);
route.get("/plan", planTemplate);
route.get("/dashboard", dashboardTemplate);
route.get("/account", accountTemplate);
route.get("/logout", logoutAction);
route.get("/create", paymentAction);
route.get("/cancel", function (req, res) { return res.redirect("/plan"); });
route.get("/success", function (req, res) { return res.redirect("/plan"); });
route.post("/register", registerRequest);
route.post("/login", loginRequest);
route.get("/", function (req, res) {
    res.redirect("/login");
});
function registerTemplate(req, res) {
    res.render("home/register", {
        title: "Midas Circle",
        success: req.flash("success"),
        error: req.flash("error")
    });
}
function loginTemplate(req, res) {
    res.render("home/login", {
        title: "Midas Circle",
        success: req.flash("success"),
        error: req.flash("error")
    });
}
function planTemplate(req, res) {
    res.render("home/plan", {
        title: "",
        success: req.flash("success"),
        error: req.flash("error")
    });
}
function registerRequest(req, res, next) {
    homeController
        .signUp(req.body)
        .then(function (data) {
        req.flash("success", "Account Created Successfully") &&
            res.redirect("/register");
    })["catch"](next);
}
function loginRequest(req, res, next) {
    homeController
        .signIn(req.body)
        .then(function (user) {
        res.redirect("/dashboard");
    })["catch"](next);
}
function logoutAction(req, res, next) {
    res.redirect("/login");
}
function dashboardTemplate(req, res, next) {
    res.render("dashboard/index", {
        title: "Midas Circle",
        success: req.flash("success"),
        error: req.flash("error")
    });
}
function accountTemplate(req, res, next) {
    res.render("dashboard/account", {
        title: "Midas Circle",
        success: req.flash("success"),
        error: req.flash("error")
    });
}
function paymentAction(req, res, next) {
    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: "https://midas-circle.herokuapp.com/success",
            cancel_url: "https://midas-circle.herokuapp.com/cancel"
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
                            quantity: 1
                        },
                    ]
                },
                amount: {
                    currency: "USD",
                    total: "25.00"
                },
                description: "Hat for the best team ever"
            },
        ]
    };
    paypal_rest_sdk_1["default"].payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        }
        else {
            for (var i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === "approval_url") {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
}
exports["default"] = route;
