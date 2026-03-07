module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.savedRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}
module.exports.isAccountOwner = async (req, res, next) => {
    const { id } = req.params;
    if (!req.user || !req.user._id.equals(id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/users/${id}`);
    }
    next();
};

