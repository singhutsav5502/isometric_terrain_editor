<script>
	import { onMount } from 'svelte';
	import asset_data from '../Assets/assets_imports.js';
	export let GRID_WIDTH;
	export let GRID_HEIGHT;
	export let GRID_VISIBLE;
	export let selected_asset = {};
	let focused_category = asset_data[0].type; // default type is Grass
	let settingsVisible = false;

	function keydownHandler(event) {
		event.stopPropagation();
	}

	onMount(() => {
		const assetContainer = document.querySelector('.asset-container');
		const scrollLeftButton = document.getElementById('scroll-left');
		const scrollRightButton = document.getElementById('scroll-right');
		const itemWidth = assetContainer.querySelector('button').offsetWidth;
		const categoryButtons = document.querySelectorAll('.category-container button');

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
		categoryButtons.pop;
		// Scroll to the correct category when a category button is clicked
		categoryButtons.forEach((button, index) => {
			if (index == categoryButtons.length - 1) return;
			button.addEventListener('click', () => {
				// const categoryIndex = Array.from(categoryButtons).indexOf(button);
				let scrollPosition = 0;
				for (let i = 0; i < index; i++) {
					scrollPosition += asset_data[i].assets.length * itemWidth;
				}
				assetContainer.scrollTo({ left: scrollPosition, behavior: 'smooth' });
				focused_category = asset_data[index].type;
				settingsVisible = false;
			});
		});

		// Update focused_category when scrolling
		assetContainer.addEventListener('scroll', () => {
			let scrollPosition = assetContainer.scrollLeft;
			let accumulatedWidth = 0;

			for (let category of asset_data) {
				accumulatedWidth += category.assets.length * itemWidth;
				if (scrollPosition < accumulatedWidth) {
					focused_category = category.type;
					break;
				}
			}
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
		<div class="category-container">
			{#each asset_data as category}
				<button class={focused_category === category.type ? 'focused' : ''}>
					<span
						style="display:flex; align-items:center; justify-content:flex-start;flex:1; width:auto;gap:0.2rem"
					>
						<span style="font-size:32px;width:auto;">&#x2022;</span>
						{category.type}
					</span>
				</button>
			{/each}
			<button
				class={focused_category === 'Misc' ? 'focused' : ''}
				on:click={() => {
					focused_category = 'Misc';
					settingsVisible = true;
				}}
			>
				<span
					style="display:flex; align-items:center; justify-content:flex-start;flex:1; width:auto;gap:0.2rem;border-left:none;"
				>
					<span style="font-size:32px;width:auto;">&#x2022;</span>Misc</span
				>
			</button>
		</div>
		{#if !settingsVisible}
			<div class="scroll-buttons">
				<button id="scroll-left" class="scroll-button">‹</button>
				<div class="asset-container">
					{#each asset_data as category}
						{#each category.assets as asset}
							<button
								on:click={() => {
									selected_asset = Object.create(asset);
								}}
								style="aspect-ratio:1/1; background-color:{asset.name == selected_asset.name
									? `${category.accent}`
									: ''}"
							>
								<img src={asset.src} alt={asset.name} />
							</button>
						{/each}
					{/each}
				</div>
				<button id="scroll-right" class="scroll-button">›</button>
			</div>
		{:else}
			<div class="misc-container">
				<div class="misc-section">
					<span>
						<input type="text" bind:value={GRID_WIDTH}>
						<input
							type="range"
							min="10"
							max="100"
							bind:value={GRID_WIDTH}
							id="GRID_WIDTH"
							name="GRID_WIDTH"
						/>
						<label for="GRID_WIDTH">Generated Terrain Width</label>
					</span>
					<span>
						<input type="text" bind:value={GRID_HEIGHT}>
						<input
							type="range"
							min="10"
							max="100"
							bind:value={GRID_HEIGHT}
							id="GRID_HEIGHT"
							name="GRID_HEIGHT"
						/>
						<label for="GRID_HEIGHT">Generated Terrain Height</label>
					</span>
					<span>
						<input type="checkbox" bind:checked={GRID_VISIBLE} id="GRID_VISIBLE"/>
						<label for="GRID_VISIBLE">Grid Visible?</label>
					</span>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.bottom-container {
		width: 100%;
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
		border-top: none;
	}
	.category-container button:first-child {
		border-left: none;
	}
	button:hover {
		cursor: pointer;
	}
	.focused {
		border-top: 1px solid rgba(255, 255, 255, 0.5);
		background-color: #2a2a40;
		border-bottom: none;
		color: #ffd700;
		border-radius: 16px 16px 0 0;
	}
	.category-container button:has(+ .focused) {
		border-right: none;
	}
	.focused + button {
		border-left: none;
	}
	/* .category-container button:last-of-type:after {
		content: '';
		width: 100%;
		position: absolute;
		left: 45.4%;
		top: 86px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.5);
	}

	.category-container button:last-of-type.focused:after {
		top: 0%;
		left:45.6%;
		opacity: 1;
	} */

	.category-container button:last-of-type.focused {
		border-top: 0px solid rgba(255, 255, 255, 0.5);
		border-top-right-radius: 0px;
		border-top-right-radius: 0px;
		border-right: none;
	}
	.category-container button:first-of-type.focused {
		border-top-left-radius: 0px;
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
	.scroll-button:hover {
		background-color: #1e1e2f;
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
		width: 120px;
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

	.misc-container {
		width: 100%;
		display: flex;
		gap: 0;
	}
	.misc-section:nth-of-type(1){
		width: 30%;
		padding: clamp(40px, 5vh, 50px);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 15px;
	}
	.misc-section span{
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap:10px;
	}
	label{
		text-align: right;
	}
	input[type='range'] {
		width: 90%;
	}
	input[type='checkbox'] {
		width: auto;
	}
	input[type='checkbox']+label{
		width: auto;
	}
	input[type='text']{
		display: inline-block;
		width: 20%;
		padding:10px 5px 10px 5px;
		text-align: center;
		background-color: rgba(42, 42, 64,0);
		border: 1px solid grey;
	}
</style>
