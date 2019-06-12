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
			<h5 style="color:white;">Pick Quality:</h5>
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
		inputUrlOrStreamer: 'https://www.twitch.tv/summit1g',
		streamIsPlaying: false
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