const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

module.exports = {
	initialize: function () {
		if (!db.has('favorite_streamers').value()) {
			db.set('favorite_streamers', []).write();
		}
	},
	getFavouriteStreamers: function () {
		return db
			.get('favorite_streamers')
			.map('username')
			.value();
	},
	isFavouriteStreamer: function (username) {
		return db
			.get('favorite_streamers')
			.find({ username: username })
			.value();
	},
	addStreamerToFavourites: function (username) {
		if (!db.get('favorite_streamers').find({ username: username }).value()) {
			db.get('favorite_streamers')
				.push({ username: username })
				.write();
		}
	},
	removeStreamerFromFavourites: function (username) {
		if (db.get('favorite_streamers').find({ username: username }).value()) {
			db.get('favorite_streamers')
				.remove({ username: username })
				.write();
		}
	}
};
