<template>
	<div style="padding:10%;">
		<h1>Twitch Desktop Miniplayer</h1>

		<form @submit.prevent="setStreamer">
			<z-input v-model="inputUrlOrStreamer" label="Twitch Url Or Streamer Name"/>
			<z-button color="primary" type="submit">Set</z-button>
		</form>

		<div v-if="selectedStreamer && streamData">
			<br>
			<h5>Pick Quality:</h5>
			<z-button
				v-for="stream_data in streamData"
				:key="stream_data.quality"
				@click="selectStream(stream_data)"
				:class="{active: selectedStream && stream_data == selectedStream ? true : false}"
			>{{stream_data.quality}}</z-button>
		</div>

		<br>
		<z-button color="primary" v-if="selectedStreamer && selectedStream" @click="playStream">Play</z-button>
	</div>
</template>

<script>
import VideoPlayer from './video-player.vue';
var ipcRenderer = require('electron').ipcRenderer;

const twitch = require('twitch-m3u8')('1a6wn2y0bpzxsr5senaoz7llfpyvgc');

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
		inputUrlOrStreamer: 'https://www.twitch.tv/summit1g'
	}),
	components: {
		VideoPlayer
	},
	methods: {
		playStream: function() {
			console.log('playStream()');
			if (this.$data.selectedStream) {
				this.$data.videoOptions.sources[0].src = this.$data.selectedStream.url;
				this.$data.videoOptions.sources[0].type =
					'application/x-mpegURL';
			}
			ipcRenderer.send('streamWindowOpen', this.$data);
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
						stream_data.forEach(element => {
							console.log(`getStreams()-> ${element.quality}`);
						});
						this.$data.streamData = stream_data;
					})
					.catch(err => console.error(err));
			} else {
				console.log('getStreams()->There is not a selected streamer');
			}
		},
		selectStream: function(stream_data) {
			console.log('selectStream()');
			this.$data.selectedStream = stream_data;
		}
	}
};
</script>

<style>
html {
	height: 100%;
}
body {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	margin: auto;
}
body > div {
	height: 100%;
	width: 100%;
}
.logo {
	width: auto;
	height: 100px;
}
</style>
