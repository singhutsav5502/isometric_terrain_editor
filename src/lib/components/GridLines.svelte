<script>
	import P5 from 'p5-svelte';

	let sketch = (p5) => {
		let gridWidth = 130;
		let gridHeight = 75;
		let cols, rows;
		let panX = 0;
		let panY = 0;
		let zoom = 1;
		let targetZoom = 1;
		let easing = 0.1;
		let isDragging = false;
		let prevMouseX = 0;
		let prevMouseY = 0;

		p5.setup = () => {
			const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
			canvas.position(0, 0);
			cols = Math.floor(p5.width / gridWidth) + 1;
			rows = Math.floor(p5.height / gridHeight) + 1;
			// cols = gridWidth
			// rows = gridHeight
			// Mouse event handlers
			p5.mousePressed = (e) => {
				if (e.button === 1 || e.button === 4) {
					// Middle mouse button or right mouse button
					isDragging = true;
					prevMouseX = p5.mouseX;
					prevMouseY = p5.mouseY;
				}
			};

			p5.mouseReleased = () => {
				isDragging = false;
			};

			p5.mouseDragged = (e) => {
				if (isDragging) {
					let dx = p5.mouseX - prevMouseX;
					let dy = p5.mouseY - prevMouseY;

					panX += dx / zoom;
					panY += dy / zoom;

					prevMouseX = p5.mouseX;
					prevMouseY = p5.mouseY;
				}
			};

			p5.mouseWheel = (event) => {
				let zoomSensitivity = 0.01;
				targetZoom -= event.delta * zoomSensitivity;
				targetZoom = p5.constrain(targetZoom, 0.5, 4);
				updateZoom();
			};
		};

		p5.draw = () => {
			p5.clear();
			p5.noFill();
			p5.stroke(255);
			p5.strokeWeight(2);

			// Calculate the number of grid cells needed to fill the canvas
			let cols = Math.ceil(p5.width / (gridWidth * zoom)) + 2;
			let rows = Math.ceil(p5.height / (gridHeight * zoom)) + 2;

			// Calculate the offset to center the grid
			let offsetX = (p5.width - cols * gridWidth * zoom) / (2 * zoom);
			let offsetY = (p5.height - rows * gridHeight * zoom) / (2 * zoom);

			for (let i = -1; i < cols + 1; i++) {
				for (let j = -1; j < rows + 1; j++) {
					p5.push();
					let cellX = (i * gridWidth + (panX % gridWidth)) * zoom + offsetX;
					let cellY = (j * gridHeight + (panY % gridHeight)) * zoom + offsetY;
					p5.translate(cellX, cellY);
					p5.scale(zoom);
					p5.beginShape();
					p5.vertex((gridWidth) / 2, 0);
					p5.vertex(0, gridHeight / 2);
					p5.vertex((gridWidth) / 2, gridHeight);
					p5.vertex((gridWidth), gridHeight / 2);
					p5.vertex((gridWidth) / 2, 0);
					p5.endShape(p5.CLOSE);
					p5.pop();
				}
			}
		};

		function updateZoom() {
			zoom += (targetZoom - zoom) * easing;
		}
	};
</script>

<span on:contextmenu|preventDefault style="opacity:0.2;">
	<P5 {sketch} />
</span>
