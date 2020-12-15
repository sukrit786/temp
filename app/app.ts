import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import logger from "morgan";
import path from "path";
import web from "./routes/web.route";
import passport from "passport";
import paypal from "paypal-rest-sdk";
import flash from "connect-flash";
import session from "express-session";
import { PassportLocal } from "./middleware/passport";
import { errorHandler } from "./middleware/errorHandler";

class App {
  public app: express.Application = express();
  public mongoUrl: any = process.env.MONGOURL;
  public passport: any = passport;

  constructor() {
    this.config();
    this.mongoSetup();
    this.paypalSetup();
    this.passportSetup();
    this.initRoutes();
  }

  private config(): void {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(passport.initialize());
    this.app.use(express.static("public"));
    this.app.use(logger("dev"));
    this.app.use(
      session({
        secret: process.env.SECRET_KEY || "",
        resave: false,
        cookie: { maxAge: 800000 },
        saveUninitialized: true,
      })
    );
    this.app.use(flash());
    this.app.set("views", path.join(__dirname, "../views"));
    this.app.set("view engine", "ejs");
    this.app.set("port", process.env.PORT || 8000);
  }
  private passportSetup(): void {
    this.app.use(passport.initialize());
    this.app.use(passport.session());
    this.app.use(express.static("public"));
    PassportLocal.passportHandler(passport);
  }

  private initRoutes(): void {
    this.app.use("/", web);
    this.app.use(errorHandler);
  }
  private paypalSetup(): void {
    paypal.configure({
      mode: "sandbox",
      client_id: process.env.PAYPAL_CLIENT_ID || "",
      client_secret: process.env.PAYPAL_CLIENT_SECRET || "",
    });
    var create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://return.url",
        cancel_url: "http://cancel.url",
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
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: "1.00",
          },
          description: "This is the payment description.",
        },
      ],
    };
  }

  private mongoSetup(): void {
    mongoose.Promise = global.Promise;
    mongoose.set("useNewUrlParser", true);
    mongoose.set("useFindAndModify", false);
    mongoose.set("useCreateIndex", true);
    mongoose
      .connect(this.mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("Successfully connected to the database");
      })
      .catch((err) => {
        console.log("Could not connect to the database. Exiting now...", err);
        process.exit();
      });
  }
}

export default new App().app;
