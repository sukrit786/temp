import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import UserModel from "../models/user.model";
const opts: any = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
opts.secretOrKey = process.env.SECRET_KEY;
export class PassportLocal {
  static passportHandler(passport: any) {
    passport.use(
      new JwtStrategy(opts, (jwt_payload, done) => {
        UserModel.findById(jwt_payload._id)
          .then((data: any) => {
            if (data) {
              console.log(data);
              return done(null, data);
            }
            return done(null, false);
          })
          .catch((err) => console.log(err));
      })
    );
  }
  static checkIfLogin() {
    return passport.authenticate("jwt", { session: false });
  }
}
