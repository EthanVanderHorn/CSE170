exports.view = function(req, res){
	var nametoshow = req.params.userName;
	res.render('index', {
		'messageToShow': "Goodbye, " + nametoshow,
	})
};