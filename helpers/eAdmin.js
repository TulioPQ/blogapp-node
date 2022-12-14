module.exports = {
    eAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.eAdmin === true) {
            return next()
        }
        req.flash("error_msg", "Você precisa ser admin!")
        res.redirect("/")
    }
}