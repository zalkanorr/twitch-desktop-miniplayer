<template>
	<div>
		<div class="background_image"></div>
		<div style="padding:10%;">
			<h1 style="color:white;">Twitch Desktop Miniplayer</h1>
			<search-form
				v-on:setStreamer="setStreamer"
				v-on:setInputUrlOrStreamer="setInputUrlOrStreamer"
				v-on:emptyError="emptyError"
			/>
			<div v-if="selectedStreamer && streamData">
				<br>
				<div v-if="streamInfo" style="color:white;">
					<h5>
						{{streamInfo.name}}
						<b-button class="b-purple-primary" size="sm" type="submit" @click="toggleFavouriteStreamer()">
							<div v-if="this.$data.selectedStreamerIsFavourite">Unfavourite</div>
							<div v-else>Favourite</div>
						</b-button>
					</h5>
					<h6>Category: {{streamInfo.category}}</h6>
					<h6>Viewers: {{streamInfo.viewers}}</h6>
				</div>
				<br>
				<h6 style="color:white;">Pick Quality:</h6>
				<b-button
					class="b-purple-secondary"
					v-for="stream_data in streamData"
					:key="stream_data.quality"
					@click="selectStream(stream_data)"
					:class="{active: selectedStream && stream_data == selectedStream ? true : false}"
				>{{stream_data.quality}}</b-button>
			</div>

			<br v-if="error">
			<b-alert v-if="error" show variant="danger">{{error}}</b-alert>

			<br>
			<b-button
				class="b-purple-primary"
				v-if="selectedStreamer && selectedStream"
				@click="playStream"
				:disabled="this.$data.streamIsPlaying"
			>
				<div v-if="!this.$data.streamIsPlaying">Play</div>
				<div v-else>Playing</div>
			</b-button>
		</div>
	</div>
</template>

<script>
import SearchForm from './search-form.vue';
import { ipcRenderer, remote } from 'electron';

const twitch = require('twitch-m3u8')(remote.getGlobal('config').twitch_client_id);
const twitch_api_lib = require('../../../libs/twitch_api_lib');
const db_lib = require('../../../libs/db_lib');

export default {
	name: 'home',
	data: () => ({
		streamData: null,
		selectedStream: null,
		videoOptions: {
			autoplay: true,
			controls: true,
			sources: [
				{
					src: 'stream_url',
					type: 'application/x-mpegURL'
				}
			]
		},
		selectedStreamer: null,
		inputUrlOrStreamer: '',
		streamIsPlaying: false,
		streamInfo: null,
		selectedStreamerIsFavourite: false,
		error: null
	}),
	components: {
		SearchForm
	},
	mounted() {
		db_lib.initialize();
		ipcRenderer.on('stopPlaying', (event, data) => {
			this.$data.streamIsPlaying = false;
		});
	},
	methods: {
		playStream: function() {
			console.log('playStream()');
			if (!this.$data.streamIsPlaying) {
				if (this.$data.selectedStream) {
					this.$data.videoOptions.sources[0].src = this.$data.selectedStream.url;
					this.$data.videoOptions.sources[0].type = 'application/x-mpegURL';
				}
				ipcRenderer.send('streamWindowOpen', this.$data);
				this.$data.streamIsPlaying = true;
			}
		},
		setStreamer: function() {
			if (this.$data.inputUrlOrStreamer) {
				if (this.$data.inputUrlOrStreamer.includes('.tv')) {
					console.log('setStreamer()->Considered url');
					let url_parts = this.$data.inputUrlOrStreamer.split('.tv/');
					if (url_parts.length > 1) {
						let name_from_link = url_parts[1];
						if (name_from_link) {
							this.$data.selectedStreamer = name_from_link;
							this.getStreams();
							this.setIsFavouriteStreamer();
						} else {
							this.setError('Link is not valid');
							console.log('setStreamer()->name_from_link not valid');
						}
					} else {
						this.setError('Link is not valid');
						console.log('setStreamer()->Link is not valid');
					}
				} else {
					console.log('setStreamer()->Considered name');
					if (this.$data.inputUrlOrStreamer.match(/^[a-zA-Z0-9_]{4,25}$/)) {
						this.$data.selectedStreamer = this.$data.inputUrlOrStreamer;
						this.getStreams();
						this.setIsFavouriteStreamer();
					} else {
						this.setError('Name is not valid');
						console.log('setStreamer()->Invalid name');
					}
				}
			}
		},
		getStreams: function() {
			console.log('getStreams()');
			if (this.$data.selectedStreamer) {
				twitch_api_lib.isStreamerOnline(this.$data.selectedStreamer).then(is_streamer_online => {
					if (is_streamer_online) {
						twitch
							.getStream(this.$data.selectedStreamer)
							.then(stream_data => {
								console.log('getStreams()->available qualities:');
								stream_data.forEach(function(element, index) {
									console.log(`getStreams()-> ${element.quality}`);
									if (element && element.quality == 'audio_only') stream_data.splice(index, 1);
								});
								this.$data.streamData = stream_data;
								this.getStreamInfo();
							})
							.catch(err => {
								this.setError(err.message);
								console.error(err);
							});
					} else {
						this.setError('Stream is offline');
						console.error('Stream is offline');
					}
				});
			} else {
				console.log('getStreams()->There is not a selected streamer');
			}
		},
		getStreamInfo: function() {
			console.log('getStreamInfo()');
			twitch_api_lib.getStreamerInfo(this.$data.selectedStreamer).then(
				stream_info => {
					if (stream_info) {
						this.$data.streamInfo = {
							name: stream_info.name,
							category: stream_info.category,
							viewers: stream_info.viewers,
							preview: stream_info.preview
						};
						this.setBackgroundImage();
					}
				},
				error => {
					console.log(error);
				}
			);
		},
		selectStream: function(stream_data) {
			console.log('selectStream()');
			this.$data.selectedStream = stream_data;
		},
		setBackgroundImage: function() {
			$('.background_image').css('background-image', `url(${this.$data.streamInfo.preview})`);
			$('.background_image').css('opacity', 0.3);
		},
		setIsFavouriteStreamer: function() {
			if (db_lib.isFavouriteStreamer(this.$data.selectedStreamer)) {
				this.$data.selectedStreamerIsFavourite = true;
			} else {
				this.$data.selectedStreamerIsFavourite = false;
			}
		},
		toggleFavouriteStreamer: function() {
			if (db_lib.isFavouriteStreamer(this.$data.selectedStreamer)) {
				db_lib.removeStreamerFromFavourites(this.$data.selectedStreamer);
			} else {
				db_lib.addStreamerToFavourites(this.$data.selectedStreamer);
			}
			this.setIsFavouriteStreamer();
		},
		setError: function(error_message) {
			this.$data.error = error_message;
			setTimeout(() => {
				this.emptyError();
			}, 3000);
		},
		emptyError: function() {
			this.$data.error = null;
		},
		setInputUrlOrStreamer: function(value) {
			this.$data.inputUrlOrStreamer = value;
		}
	}
};
</script>