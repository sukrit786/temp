"use strict";
exports.__esModule = true;
var express_1 = require("express");
var body_parser_1 = require("body-parser");
var mongoose_1 = require("mongoose");
var morgan_1 = require("morgan");
var path_1 = require("path");
var web_route_1 = require("./routes/web.route");
var passport_1 = require("passport");
var paypal_rest_sdk_1 = require("paypal-rest-sdk");
var connect_flash_1 = require("connect-flash");
var express_session_1 = require("express-session");
var passport_2 = require("./middleware/passport");
var errorHandler_1 = require("./middleware/errorHandler");
var App = /** @class */ (function () {
    function App() {
        this.app = express_1["default"]();
        this.mongoUrl = process.env.MONGOURL;
        this.passport = passport_1["default"];
        this.config();
        this.mongoSetup();
        this.paypalSetup();
        this.passportSetup();
        this.initRoutes();
    }
    App.prototype.config = function () {
        this.app.use(body_parser_1["default"].json());
        this.app.use(body_parser_1["default"].urlencoded({ extended: false }));
        this.app.use(passport_1["default"].initialize());
        this.app.use(express_1["default"].static("public"));
        this.app.use(morgan_1["default"]("dev"));
        this.app.use(express_session_1["default"]({
            secret: process.env.SECRET_KEY || "",
            resave: false,
            cookie: { maxAge: 800000 },
            saveUninitialized: true
        }));
        this.app.use(connect_flash_1["default"]());
        this.app.set("views", path_1["default"].join(__dirname, "../views"));
        this.app.set("view engine", "ejs");
        this.app.set("port", process.env.PORT || 8000);
    };
    App.prototype.passportSetup = function () {
        this.app.use(passport_1["default"].initialize());
        this.app.use(passport_1["default"].session());
        this.app.use(express_1["default"].static("public"));
        passport_2.PassportLocal.passportHandler(passport_1["default"]);
    };
    App.prototype.initRoutes = function () {
        this.app.use("/", web_route_1["default"]);
        this.app.use(errorHandler_1.errorHandler);
    };
    App.prototype.paypalSetup = function () {
        paypal_rest_sdk_1["default"].configure({
            mode: "sandbox",
            client_id: process.env.PAYPAL_CLIENT_ID || "",
            client_secret: process.env.PAYPAL_CLIENT_SECRET || ""
        });
        var create_payment_json = {
            intent: "sale",
            payer: {
                payment_method: "paypal"
            },
            redirect_urls: {
                return_url: "http://return.url",
                cancel_url: "http://cancel.url"
            },
            transactions: [
                {
                    item_list: {
                        items: [
                            {
                                name: "item",
                                sku: "item",
                                price: "1.00",
                                currency: "USD",
                                quantity: 1
                            },
                        ]
                    },
                    amount: {
                        currency: "USD",
                        total: "1.00"
                    },
                    description: "This is the payment description."
                },
            ]
        };
    };
    App.prototype.mongoSetup = function () {
        mongoose_1["default"].Promise = global.Promise;
        mongoose_1["default"].set("useNewUrlParser", true);
        mongoose_1["default"].set("useFindAndModify", false);
        mongoose_1["default"].set("useCreateIndex", true);
        mongoose_1["default"]
            .connect(this.mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
            .then(function () {
            console.log("Successfully connected to the database");
        })["catch"](function (err) {
            console.log("Could not connect to the database. Exiting now...", err);
            process.exit();
        });
    };
    return App;
}());
exports["default"] = new App().app;
