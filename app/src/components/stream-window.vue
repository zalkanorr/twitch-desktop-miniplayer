<template>
	<div style="height:100%; width:100%;">
		<video-player v-if="streamData" :options="videoOptions"/>
		<div id="action-buttons">
			<b-button class="b-purple-primary" id="close-button" @click="close()">close</b-button>
			<b-button class="b-purple-primary" id="drag-button">drag</b-button>
		</div>
	</div>
</template>

<script>
import VideoPlayer from './video-player.vue';
var ipcRenderer = require('electron').ipcRenderer;

export default {
	name: 'stream-window',
	data: () => ({
		streamData: null,
		videoOptions: {
			autoplay: true,
			controls: true,
			controlBar: {
				fullscreenToggle: false
			},
			sources: [
				{
					src: 'stream_url',
					type: 'application/x-mpegURL'
				}
			]
		}
	}),
	components: {
		VideoPlayer
	},
	mounted() {
		console.log('mounted');
		ipcRenderer.on('streamData', (event, data) => {
			this.$data.streamData = data;
			this.$data.videoOptions.sources[0].src = this.$data.streamData.selectedStream.url;
			this.$data.videoOptions.sources[0].type = 'application/x-mpegURL';
		});
		ipcRenderer.send('streamWindowSendMeData');

		setInterval(() => {
			this.checkControlBarActive();
		}, 500);
	},
	methods: {
		close() {
			ipcRenderer.send('streamWindowClose');
		},
		showActionButtons() {
			if (!$('#action-buttons').hasClass('action-buttons-fadeIn')) {
				$('#action-buttons')
					.removeClass('action-buttons-fadeOut')
					.addClass('action-buttons-fadeIn');
			}
		},
		hideActionButtons() {
			if (!$('#action-buttons').hasClass('action-buttons-fadeOut')) {
				$('#action-buttons')
					.removeClass('action-buttons-fadeIn')
					.addClass('action-buttons-fadeOut');
			}
		},
		checkControlBarActive() {
			if ($('#vjs_video_3').hasClass('vjs-user-active')) {
				this.showActionButtons();
			} else {
				this.hideActionButtons();
			}
		}
	}
};
</script>
<style>
#drag-button {
	-webkit-app-region: drag;
	position: absolute;
	height: 30px;
	width: 50px;
	left: 0%;
	bottom: 0px;
	z-index: 1;
	padding: unset;
}
#close-button {
	position: absolute;
	height: 30px;
	width: 50px;
	right: 0%;
	bottom: 0px;
	z-index: 1;
	padding: unset;
}
.action-buttons-fadeOut {
	visibility: hidden;
	opacity: 0;
	transition: visibility 0s linear 1500ms, opacity 1500ms;
}
.action-buttons-fadeIn {
	visibility: visible;
	opacity: 1;
	transition: visibility 0s linear 0s, opacity 200ms;
}
</style>
