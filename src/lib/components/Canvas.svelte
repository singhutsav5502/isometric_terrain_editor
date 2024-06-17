<script>
	import P5 from 'p5-svelte';

	const MAP_GLOBAL = new Map();
	const TILE_WIDTH = 130;
	const TILE_HEIGHT = 75;
	const MAX_TILE_HEIGHT = 100;
	class Tile {
		constructor(terrainType, x, y, height = 0) {
			this.terrainType = terrainType;
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
					MAP_GLOBAL.set(x * this.width + y, tile);
				}
			}
			return tiles;
		}

		determineTerrainType(x, y) {
			// place holder
			return (x + y) % 2 === 0 ? 'grass' : 'water';
		}

		getTile(x, y) {
			const tile = MAP_GLOBAL.get(x * this.width + y);
			return tile ? tile : null;
		}

		updateTile(x, y, newTerrainType) {
			let tile = this.getTile(x, y);
			if (!tile) {
				tile = new Tile(newTerrainType, x, y);
				MAP_GLOBAL[x * this.width + y] = tile;
				return tile;
			} else {
				MAP_GLOBAL.get(x * this.width + y).terrainType = newTerrainType;
				return tile;
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
			this.p5.mousePressed = () => {
				this.isDragging = true;
				this.prevMouseX = this.p5.mouseX;
				this.prevMouseY = this.p5.mouseY;
			};

			this.p5.mouseReleased = () => {
				this.isDragging = false;
			};

			this.p5.mouseDragged = () => {
				if (this.isDragging) {
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
				this.targetZoom = this.p5.constrain(this.targetZoom, 0.5, 4);
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
				// tile_images[Math.floor(Math.random() * 2)],
				tile_images[tile.terrainType === 'grass' ? 0 : 1],
				x_screen,
				y_screen - z_offset,
				tileWidth,
				tileHeight
			);
		}
		render() {
			this.p5.clear();
			this.p5.background(`rgba(0,255,255,0.5)`);
			for (let [key, tile] of MAP_GLOBAL) {
				// key grid node number
				// tile class instance
				this.drawTile(tile);
			}
		}
		onClick(event) {

			const x_screen = event.clientX;
			const y_screen = event.clientY;

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

			console.log(grid_x,grid_y)

			const updated_tile = this.terrain.updateTile(grid_x, grid_y, 'grass');
			// this.drawTile(updated_tile);
			this.render();
		}
	}
	let terrain;
	let renderer;
	let tile_images = [];
	const sketch = (p5) => {
		p5.preload = () => {
			let img = p5.loadImage('../src/lib/Assets/grass1.png');
			img.resize(TILE_WIDTH, TILE_HEIGHT);
			tile_images.push(img);
			img = p5.loadImage('../src/lib/Assets/stone1.png');
			img.resize(TILE_WIDTH, TILE_HEIGHT);
			tile_images.push(img);
		};
		p5.setup = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;
			p5.createCanvas(width, height);
			terrain = new Terrain(10, 10);
			renderer = new TerrainRenderer(width, height, terrain, p5);
			renderer.render();
		};
		// p5.draw = () => {
		// 	renderer.render(); // Continuously call render
		// };
		p5.mouseClicked = (event) => {
			renderer.onClick(event);
		};
	};
</script>

<P5 {sketch} />

<style></style>
