<script>
	import { onMount } from 'svelte';
	import asset_data from '../Assets/assets_imports.js';
	let GRID_WIDTH = 10;
	let GRID_HEIGHT = 10;
	let focused_category = asset_data[0].type; // default type is Grass
	function keydownHandler(event) {
		event.stopPropagation();
	}

	onMount(() => {
        const assetContainer = document.querySelector('.asset-container');
    const scrollLeftButton = document.getElementById('scroll-left');
    const scrollRightButton = document.getElementById('scroll-right');
    const itemWidth = assetContainer.querySelector('button').offsetWidth;
    
    let isDown = false;
    let startX;
    let scrollLeft;

    assetContainer.addEventListener('mousedown', (e) => {
      isDown = true;
      assetContainer.classList.add('active');
      startX = e.pageX - assetContainer.offsetLeft;
      scrollLeft = assetContainer.scrollLeft;
    });

    assetContainer.addEventListener('mouseleave', () => {
      isDown = false;
      assetContainer.classList.remove('active');
    });

    assetContainer.addEventListener('mouseup', () => {
      isDown = false;
      assetContainer.classList.remove('active');
    });

    assetContainer.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - assetContainer.offsetLeft;
      const walk = (x - startX) * 1.5; // scroll-speed
      assetContainer.scrollLeft = scrollLeft - walk;
    });

    scrollLeftButton.addEventListener('click', () => {
      assetContainer.scrollBy({ left: -itemWidth, behavior: 'smooth' });
    });

    scrollRightButton.addEventListener('click', () => {
      assetContainer.scrollBy({ left: itemWidth, behavior: 'smooth' });
    });
	});
</script>

<div
	class="bottom-container"
	on:click|stopPropagation
	on:keydown={keydownHandler}
	role="menu"
	tabindex=""
>
	<div class="bottom-inner-container">
		<!-- <label>
			<input type="range" min="0" max="1000" bind:value={GRID_WIDTH} />
			<input type="range" min="0" max="1000" bind:value={GRID_HEIGHT} />
		</label> -->
		<div class="category-container">
			{#each asset_data as category}
				<button
					class={focused_category === category.type ? 'focused' : ''}
					on:click={() => {
						focused_category = category.type;
					}}
				>
					<span
						style="display:flex; align-items:center; justify-content:flex-start;flex:1; width:auto;gap:0.2rem"
						><span style="font-size:32px;width:auto;">&#x2022;</span>
						{category.type}</span
					></button
				>
			{/each}
		</div>
		<div class="scroll-buttons">
			<button id="scroll-left" class="scroll-button">‹</button>
			<div class="asset-container">
				{#each asset_data as category}
					{#if focused_category === category.type}
						{#each category.assets as asset}
							<button style=" aspect-ratio:1/1;">
								<img src={asset.src} alt={asset.name} />
							</button>
						{/each}
					{/if}
				{/each}
			</div>
			<button id="scroll-right" class="scroll-button">›</button>
		</div>
	</div>
</div>

<style>
	.bottom-container {
		width: 100%;
		height: 20vh;
		z-index: 100;
		position: absolute;
		transform-origin: center bottom;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #2a2a40;
	}
	.bottom-inner-container {
		position: relative;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: start;
	}

	button {
		width: 15vw;
		font-size: 18px;
		padding: 24px;
		background-color: #1e1e2f;
		color: #ffffff;
		border: 1px solid rgba(255, 255, 255, 0.5);
	}
	button:first-child {
		border-left: none;
	}
	button:hover {
		cursor: pointer;
	}
	.focused {
		background-color: #2a2a40;
		border-bottom: none;
		color: #ffd700;
	}
	input {
		width: 10vw;
	}

	.scroll-buttons {
		display: flex;
		align-items: center;
	}

	.scroll-button {
		background-color: #2a2a40;
		border: none;
		padding: 10px;
		cursor: pointer;
		user-select: none;
        width: 40px;
        height: 100%;

	}

	.asset-container {
		display: flex;
		flex-wrap: nowrap;
		padding-left: 2vw;
		user-select: none;
		overflow-x: auto;
		white-space: nowrap;
		cursor: grab;
		gap: 50px;
	}
	.asset-container button {
		flex: 0 0 auto; /* Prevent buttons from shrinking */
		width: 150px;
		border: none;
		background-color: #2a2a40;
		transition: 0.1s all ease-in-out;
	}
	.asset-container::-webkit-scrollbar {
		display: none;
	}
	.asset-container button:hover {
		cursor: pointer;
		background-color: #1e1e2f;
	}
</style>
