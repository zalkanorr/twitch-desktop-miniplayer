<template>
	<div style="height:100%; width:100%;">
		<video ref="videoPlayer" :height="window.height" :width="window.width" class="video-js"></video>
	</div>
</template>

<script>
import videojs from 'video.js';

export default {
	name: 'video-player',
	props: {
		options: {}
	},
	data() {
		return {
			player: null,
			window: {
				width: 0,
				height: 0
			}
		};
	},
	mounted() {
		this.player = videojs(
			this.$refs.videoPlayer,
			this.options,
			function onPlayerReady() {
				console.log('onPlayerReady', this);
				this.tech_.off('dblclick');
			}
		);
		window.addEventListener('resize', this.handleResize);
		this.handleResize();
	},
	destroyed() {
		window.removeEventListener('resize', this.handleResize);
	},
	beforeDestroy() {
		if (this.player) {
			this.player.dispose();
		}
	},
	methods: {
		handleResize() {
			this.window.width = window.innerWidth;
			this.window.height = window.innerHeight;
		}
	}
};
</script>

<style>
#vjs_video_3 {
	height: 100%;
	width: 100%;
}
.video-js.vjs-playing .vjs-tech {
	pointer-events: none;
}
</style>
