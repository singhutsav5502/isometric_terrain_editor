<script>
	import P5 from 'p5-svelte';
	import data from '../Assets/assets_imports';
	export let GRID_WIDTH;
	export let GRID_HEIGHT;
	export let selected_asset = {};
	const MAP_GLOBAL = new Map();
	const MAP_HEIGHT_TILES = new Map();
	const ASSET_INFO = new Map();
	const TILE_WIDTH = 130;
	const TILE_HEIGHT = 75;
	const MAX_TILE_HEIGHT = 100;
	const BACKGROUND_COLOR = `#1E1E2F`;
	let terrain;
	let renderer;
	class Tile {
		constructor(tileType, x, y, height = 0) {
			this.tileType = tileType;
			this.width = TILE_WIDTH;
			this.height = TILE_HEIGHT;
			this.x = x;
			this.y = y;
			this.tile_height = height;
		}
	}

	class Terrain {
		constructor(width, height) {
			this.width = width;
			this.height = height;
			this.tiles = this.generateTerrain();
		}

		generateTerrain() {
			const tiles = [];
			for (let x = 0; x < this.width; x++) {
				for (let y = 0; y < this.height; y++) {
					const terrainType = this.determineTerrainType(x, y);
					const tile = new Tile(terrainType, x, y);
					tiles.push(tile);
					MAP_GLOBAL.set(`${x} ${y}`, tile);
				}
			}
			return tiles;
		}

		determineTerrainType(x, y) {
			// place holder
			return (x + y) % 2 === 0 ? 'grass1' : 'stone1';
		}

		getTile(x, y) {
			const tile = MAP_GLOBAL.get(`${x} ${y}`);
			return tile ? tile : null;
		}
		getHeightTile(x, y) {
			const tile = MAP_HEIGHT_TILES.get(`${x} ${y}`);
			return tile ? tile : null;
		}
		updateTile(x, y, newTerrainType, height = 0) {
			if (height == 0) {
				let tile = this.getTile(x, y);
				if (!tile) {
					tile = new Tile(newTerrainType, x, y, height);
					MAP_GLOBAL.set(`${x} ${y}`, tile);
					return tile;
				} else {
					MAP_GLOBAL.get(`${x} ${y}`).tileType = newTerrainType;
					MAP_GLOBAL.get(`${x} ${y}`).tile_height = height;
					return tile;
				}
			} else {
				let tile = this.getHeightTile(x, y);
				if (!tile) {
					tile = new Tile(newTerrainType, x, y, height);
					MAP_HEIGHT_TILES.set(`${x} ${y}`, tile);
					return tile;
				} else {
					MAP_HEIGHT_TILES.get(`${x} ${y}`).tileType = newTerrainType;
					MAP_HEIGHT_TILES.get(`${x} ${y}`).tile_height = height;
					return tile;
				}
			}
		}
	}

	class TerrainRenderer {
		constructor(width, height, terrain, p5) {
			this.terrain = terrain;
			this.p5 = p5;
			this.width = width;
			this.height = height;
			this.x_start = this.width / 2 - TILE_WIDTH / 2;
			this.y_start = -TILE_HEIGHT / 2;

			this.panX = 0;
			this.panY = 0;
			this.zoom = 1;
			this.targetZoom = 1;
			this.easing = 0.1;

			this.isDragging = false;
			this.prevMouseX = 0;
			this.prevMouseY = 0;

			// P5 setup for mouse events
			this.p5.mousePressed = (e) => {
				if (e.which == 2 || e.button == 4) {
					// middle mouse button
					this.isDragging = true;
					this.prevMouseX = this.p5.mouseX;
					this.prevMouseY = this.p5.mouseY;
				} else if (e.button == 2) {
					// right click
					// delete tile
					e.preventDefault();
					const { grid_x, grid_y } = this.getGridCoords(e.clientX, e.clientY);
					let tile = MAP_GLOBAL.get(`${grid_x}${grid_y}`);
					let HeightTile = MAP_HEIGHT_TILES.get(`${grid_x}${grid_y}`);
					if (HeightTile) {
						this.deleteHeightTile(`${grid_x}${grid_y}`);
						return;
					}
					if (tile) this.deleteTile(`${grid_x}${grid_y}`);
				}
			};

			this.p5.mouseReleased = () => {
				this.isDragging = false;
			};

			this.p5.mouseDragged = (e) => {
				if (this.isDragging && (e.which == 2 || e.button == 4)) {
					let dx = this.p5.mouseX - this.prevMouseX;
					let dy = this.p5.mouseY - this.prevMouseY;

					this.panX += dx / this.zoom;
					this.panY += dy / this.zoom;

					this.prevMouseX = this.p5.mouseX;
					this.prevMouseY = this.p5.mouseY;

					this.render();
				}
			};
			this.p5.mouseWheel = (event) => {
				let zoomSensitivity = 0.01;
				this.targetZoom -= event.delta * zoomSensitivity;
				this.targetZoom = this.p5.constrain(this.targetZoom, 0.2, 1.5);
				this.updateZoom();
			};
		}
		updateZoom() {
			// Interpolate zoom level
			// while (this.zoom != this.targetZoom) {
			this.zoom += (this.targetZoom - this.zoom) * this.easing;
			this.render();
			// }
		}
		drawTile(tile) {
			let x_screen = this.x_start + ((tile.x - tile.y) * TILE_WIDTH) / 2;
			let y_screen = this.y_start + ((tile.x + tile.y) * TILE_HEIGHT) / 2;
			let z_offset = MAX_TILE_HEIGHT - tile.tile_height;

			// pan and zoom
			x_screen = (x_screen + this.panX) * this.zoom;
			y_screen = (y_screen + this.panY) * this.zoom;
			let tileWidth = TILE_WIDTH * this.zoom;
			let tileHeight = TILE_HEIGHT * this.zoom;

			this.p5.image(
				ASSET_INFO.get(tile.tileType).img,
				x_screen,
				y_screen - z_offset,
				tileWidth,
				tileHeight
			);
		}
		deleteTile(key) {
			MAP_GLOBAL.delete(key);
			this.render();
		}
		deleteHeightTile(key) {
			MAP_HEIGHT_TILES.delete(key);
			this.render();
		}

		getGridCoords(x_screen, y_screen) {
			// Undo zoom and pan
			let adjustedX = x_screen / this.zoom - this.panX;
			let adjustedY = y_screen / this.zoom - this.panY;

			// Reverse isometric transformation
			let x1 = adjustedX - this.x_start;
			let y1 = adjustedY + MAX_TILE_HEIGHT - this.y_start;

			let a = (2 * x1) / TILE_WIDTH;
			let b = (2 * y1) / TILE_HEIGHT;

			let grid_x = Math.floor((a + b) / 2);
			grid_x--; // account float point approximation errors from observation
			let grid_y = Math.floor((b - a) / 2);

			// error adjustments
			if (this.zoom <= 0.6) {
				grid_x += 2;
				grid_y += 2;
			} else if (this.zoom <= 1) {
				grid_x += 1;
				grid_y += 1;
			}
			return { grid_x, grid_y };
		}
		onClick(event) {
			const { grid_x, grid_y } = this.getGridCoords(event.clientX, event.clientY);

			const updated_tile = this.terrain.updateTile(
				grid_x,
				grid_y,
				selected_asset.name,
				selected_asset.height
			);

			this.render();
		}

		render() {
			this.p5.clear();
			this.p5.background(BACKGROUND_COLOR);

			for (let [key, tile] of MAP_GLOBAL) {
				this.drawTile(tile);
			}
			for (let [key, tile] of MAP_HEIGHT_TILES) {
				this.drawTile(tile);
			}
		}
	}
	let sketch = (p5) => {
		p5.preload = () => {
			for (let category of data) {
				for (let asset of category.assets) {
					let img = p5.loadImage(asset.src);
					img.resize(TILE_WIDTH, TILE_HEIGHT);
					ASSET_INFO.set(asset.name, { img: img, height: asset.height });
				}
			}
		};
		p5.setup = () => {
				const WIDTH = window.innerWidth;
				const HEIGHT = window.innerHeight;
				p5.createCanvas(WIDTH, HEIGHT);
				terrain = new Terrain(GRID_WIDTH, GRID_HEIGHT);
				renderer = new TerrainRenderer(WIDTH, HEIGHT, terrain, p5);
				renderer.render();
			};
			p5.draw = () => {
				// renderer.render(); // Continuously call render
			};
			p5.mouseClicked = (event) => {
				renderer.onClick(event);
			};
		};
</script>

<span on:contextmenu|preventDefault>
	<P5 {sketch}/>
</span>

<style></style>
