<template>
	<form @submit.prevent="formSubmit">
		<b-input-group class="mt-3">
			<b-input-group-prepend>
				<b-button
					style="background-color:#0f0e11; border-right:unset; border-right: unset; border-color: #4e3380;"
					disabled
				>
					<font-awesome-icon icon="search"/>
				</b-button>
			</b-input-group-prepend>

			<b-form-input
				v-model="searchInput"
				placeholder="Search streamer with Name or URL"
				class="b-purple-input"
				list="favourite-streamers-input-list"
				@click="searchInput ? getinputFavouriteStreamersData(searchInput) : getinputFavouriteStreamersData()"
				@keydown.tab="autocompleteInput()"
			/>

			<div
				id="favourite-streamers-input-list"
				@mouseleave="hideInputList()"
				style="position:absolute; width:88.5%; z-index:3; top:100%;"
			>
				<a
					v-for="streamer in inputFavouriteStreamersData"
					:id="`a-${streamer.username}`"
					href="#"
					class="list-group-item list-group-item-action"
					:key="streamer.username"
					@mouseenter="addActive(`#a-${streamer.username}`)"
					@mouseleave="removeActive(`#a-${streamer.username}`)"
					@click="selectStreamer(streamer.username)"
				>
					{{ streamer.username }}
					{{ streamer.status }}
				</a>
			</div>
			<b-input-group-append>
				<b-button class="b-purple-primary" type="submit">Search</b-button>
			</b-input-group-append>
		</b-input-group>
	</form>
</template>

<script>
const db_lib = require('../../../libs/db_lib');
const twitch_api_lib = require('../../../libs/twitch_api_lib');

export default {
	name: 'search-form',
	data: () => ({
		searchInput: '',
		inputFavouriteStreamersData: [],
		favouriteStreamersData: []
	}),
	mounted() {
		db_lib.initialize();
		// Get initial favourite streamers data
		this.getFavouriteStreamersData();
		// Update favourite streamers data every minute
		setInterval(() => {
			this.getFavouriteStreamersData();
		}, 60000);
	},
	methods: {
		setStreamer: function() {
			this.$emit('setInputUrlOrStreamer', this.$data.searchInput);
			this.$emit('setStreamer');
		},
		getFavouriteStreamersData: async function(input = null) {
			let favourite_streamers_data = [];
			let favourite_streamers = db_lib.getAllFavouriteStreamers();
			for await (let [index, streamer] of favourite_streamers.entries()) {
				let is_streamer_online = await twitch_api_lib.isStreamerOnline(streamer);
				favourite_streamers_data.push({ username: streamer, status: is_streamer_online ? 'Online' : 'Offline' });
			}
			this.$data.favouriteStreamersData = favourite_streamers_data;
		},
		getinputFavouriteStreamersData: async function(input = null) {
			let favourite_streamers_data;
			if (input) {
				favourite_streamers_data = this.$data.favouriteStreamersData.filter(streamer => streamer.username.startsWith(input));
			} else {
				favourite_streamers_data = this.$data.favouriteStreamersData;
			}
			this.$data.inputFavouriteStreamersData = favourite_streamers_data;
			if (!input || input != this.$data.inputFavouriteStreamersData[0].username) $('#favourite-streamers-input-list').show();
		},
		addActive: function(selector) {
			$(selector).addClass('active');
		},
		removeActive: function(selector) {
			$(selector).removeClass('active');
		},
		selectStreamer: function(username) {
			this.$data.searchInput = username;
			this.hideInputList();
		},
		hideInputList: function() {
			$('#favourite-streamers-input-list').hide();
		},
		formSubmit: function() {
			this.$emit('emptyError');
			let active_list_item = $('.list-group-item.active');
			if (active_list_item[0]) {
				let username = active_list_item[0].attr('id').split('-')[1];
				this.selectStreamer(username);
			} else {
				this.hideInputList();
				this.setStreamer();
			}
		},
		autocompleteInput: function() {
			if (this.$data.inputFavouriteStreamersData[0]) {
				this.hideInputList();
				this.$data.searchInput = this.$data.inputFavouriteStreamersData[0].username;
			}
		}
	},
	watch: {
		searchInput: function(newInput, oldInput) {
			if (newInput.length == 0) this.getinputFavouriteStreamersData();
			if (newInput.length > 0) this.getinputFavouriteStreamersData(newInput);
		}
	}
};
</script>