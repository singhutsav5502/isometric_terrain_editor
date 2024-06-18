<script>
	import asset_data from '$lib/Assets/assets_imports.js';
	import Menu from '$lib/components/Menu.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import GridLines from '../lib/components/GridLines.svelte';
	let selected_asset = asset_data[0].assets[0]; // 1st block as default selected tile;
	let GRID_VISIBLE = true;
	let GRID_WIDTH = 10;
	let GRID_HEIGHT = 10;
</script>

<svelte:head>
	<title>terrain transformer</title>
</svelte:head>

<div class="page-content">
	<Menu bind:selected_asset bind:GRID_VISIBLE bind:GRID_WIDTH bind:GRID_HEIGHT />
	{#if GRID_VISIBLE}
		<GridLines />
	{/if}
	{#key GRID_WIDTH+GRID_HEIGHT}
	<Canvas bind:selected_asset bind:GRID_HEIGHT bind:GRID_WIDTH />
	{/key}
</div>

<style>
	.page-content {
		background-color: rgb(106, 106, 106);
	}
</style>
