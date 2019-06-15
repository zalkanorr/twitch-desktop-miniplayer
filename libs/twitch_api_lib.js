const { remote } = require('electron');
const axios = require('axios');

module.exports = {
	getStreamer: function (username) {
		return new Promise((resolve, reject) => {
			axios
				.get('https://api.twitch.tv/kraken/streams/' + username, {
					headers: { 'Client-ID': remote.getGlobal('config').twitch_client_id }
				})
				.then(response => {
					return resolve(response.data);
				})
				.catch(error => {
					return reject(error);
				});
		});
	},
	getStreamerInfo: function (username) {
		return new Promise((resolve, reject) => {
			this.getStreamer(username).then(
				stream_data => {
					// If stream is online
					if (stream_data.stream) {
						return resolve({
							name: stream_data.stream.channel.display_name,
							category: stream_data.stream.game,
							viewers: stream_data.stream.viewers,
							preview: stream_data.stream.preview.medium
						});
					} else {
						return reject(null);
					}
				},
				error => {
					console.error(error);
					return reject(null);
				}
			);
		});
	}
};
