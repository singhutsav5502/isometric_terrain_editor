<script>
	import asset_data from '$lib/Assets/assets_imports.js';
	import Menu from '$lib/components/Menu.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import GridLines from '../lib/components/GridLines.svelte';
	let selected_asset = asset_data[0].assets[0]; // 1st block as default selected tile;
</script>

<svelte:head>
	<title>terrain transformer</title>
</svelte:head>

<div class="page-content">
	<Menu bind:selected_asset />
	<GridLines />
	<Canvas bind:selected_asset />
</div>

<style>
	.page-content {
		background-color: rgb(106, 106, 106);
	}
</style>
