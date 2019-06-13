<template>
	<div style="padding:10%;">
		<h1 style="color:white;">Twitch Desktop Miniplayer</h1>

		<form @submit.prevent="setStreamer">
			<b-input-group class="mt-3">
				<b-input-group-prepend>
					<b-button
						style="background-color:unset; border-right:unset; border-right: unset; border-color: #4e3380;"
						disabled
					>
						<font-awesome-icon icon="search"/>
					</b-button>
				</b-input-group-prepend>
				<b-input
					class="b-purple-input"
					v-model="inputUrlOrStreamer"
					placeholder="Search streamer with Name or URL"
				/>
				<b-input-group-append>
					<b-button class="b-purple-primary" type="submit">Search</b-button>
				</b-input-group-append>
			</b-input-group>
		</form>

		<div v-if="selectedStreamer && streamData">
			<br>
			<div v-if="streamInfo" style="color:white;">
				<h5>{{streamInfo.name}}</h5>
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
</template>

<script>
import VideoPlayer from './video-player.vue';
import { ipcRenderer } from 'electron';
const twitch_client_id = '1a6wn2y0bpzxsr5senaoz7llfpyvgc';
const twitch = require('twitch-m3u8')(twitch_client_id);
const axios = require('axios');

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
		inputUrlOrStreamer: 'https://www.twitch.tv/summit1g',
		streamIsPlaying: false,
		streamInfo: null
	}),
	components: {
		VideoPlayer
	},
	mounted() {
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
					this.$data.videoOptions.sources[0].type =
						'application/x-mpegURL';
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
						} else {
							console.log(
								'setStreamer()->name_from_link not valid'
							);
						}
					} else {
						console.log('setStreamer()->Link is not valid');
					}
				} else {
					console.log('setStreamer()->Considered name');
					this.$data.selectedStreamer = this.$data.inputUrlOrStreamer;
					this.getStreams();
				}
			}
		},
		getStreams: function() {
			console.log('getStreams()');
			if (this.$data.selectedStreamer) {
				twitch
					.getStream(this.$data.selectedStreamer)
					.then(stream_data => {
						console.log('getStreams()->available qualities:');
						stream_data.forEach(function(element, index) {
							console.log(`getStreams()-> ${element.quality}`);
							if (element && element.quality == 'audio_only')
								stream_data.splice(index, 1);
						});
						this.$data.streamData = stream_data;
						this.getAndSetStreamInfo();
					})
					.catch(err => console.error(err));
			} else {
				console.log('getStreams()->There is not a selected streamer');
			}
		},
		getAndSetStreamInfo: function() {
			console.log('getAndSetStreamInfo()');
			axios
				.get(
					'https://api.twitch.tv/kraken/streams/' +
						this.$data.selectedStreamer,
					{
						headers: { 'Client-ID': twitch_client_id }
					}
				)
				.then(res => {
					// If stream is online
					if (res.data.stream) {
						let display_name = res.data.stream.channel.display_name;
						let stream_category = res.data.stream.game;
						let stream_viewers = res.data.stream.viewers;
						let stream_preview = res.data.stream.preview.medium;
						this.$data.streamInfo = {
							name: display_name,
							category: stream_category,
							viewers: stream_viewers
						};
					} else {
						this.$data.streamInfo = null;
					}
				})
				.catch(error => {
					console.error(error);
				});
		},
		selectStream: function(stream_data) {
			console.log('selectStream()');
			this.$data.selectedStream = stream_data;
		}
	}
};
</script>