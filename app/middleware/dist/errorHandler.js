"use strict";
exports.__esModule = true;
exports.errorHandler = void 0;
function errorHandler(err, req, res, next) {
    console.error(err);
    switch (true) {
        case typeof err === "string":
            var is404 = err.toLowerCase().endsWith("not found");
            var statusCode = is404 ? 404 : 400;
            return req.flash("error", err) && res.redirect("back");
        case err.name === "ValidationError":
            return req.flash("error", err.message) && res.redirect("back");
        case err.name === "UnauthorizedError":
            return req.flash("error", err.message) && res.redirect("back");
        default:
            return req.flash("error", err.message) && res.redirect("back");
    }
}
exports.errorHandler = errorHandler;
