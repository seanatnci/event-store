
/* GET home page. */
exports.index = function(req, res) {
    res.render('error', {
        message: "Invalid Route Requested",
        error: {}
    });
};
exports.events = function(req, res) {
    res.render('listallevents', {title: 'All My Events'});
};
exports.event = function(req, res) {
    var eventId = req.params.id;
    console.log("show event id");
    console.log(req.params);
    res.render('index', {title: 'Event Store',id: req.params.id});
};

/*router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});
router.get('/events', function(req, res) {
    res.render('listallevents', { title: 'Express' });
});

module.exports = router;
*/
