

<script>
	import Menu from '$lib/components/Menu.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
</script>

<svelte:head>
	<title>terrain transformer</title>
</svelte:head>

<div class="page-content">
	<Canvas />
	<Menu />
</div>

<style>
	.page-content {
		background-color: rgb(106, 106, 106);
	}
</style>
