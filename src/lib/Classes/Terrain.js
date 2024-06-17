import { QuadTree, Rectangle } from './QuadTree.js'
class Tile {
    constructor(terrainType, x, y, height = 0) {
        this.terrainType = terrainType;
        this.x = x;
        this.y = y;
        this.isoX = (x - y) * this.tileSize;
        this.isoY = (x + y)/2 * this.tileSize;
        this.height = height;
    }
}

class Terrain {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.quadTree = new QuadTree(new Rectangle(0, 0, -width*this.tileSize, -height*this.tileSize), 4);
        this.tiles = this.generateTerrain();
    }

    generateTerrain() {
        const tiles = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const terrainType = this.determineTerrainType(x, y);
                // const isoX = (x - y) * this.tileSize;
                // const isoY = (x + y)/2 * this.tileSize;

                const tile = new Tile(terrainType, x, y);
                tiles.push(tile);
                this.quadTree.insert(tile);
            }
        }
        return tiles;
    }

    determineTerrainType(x, y) {
        return (x + y) % 2 === 0 ? 'grass' : 'stone'; // place holder
    }

    getTile(x, y) {
        const range = new Rectangle(x, y, 1, 1);
        const found = this.quadTree.query(range);
        return found.length > 0 ? found[0] : null;
    }

    updateTile(x, y, newTerrainType) {
        let tile = this.getTile(x, y);
        if (!tile) {
            tile = new Tile(newTerrainType, x, y);
            this.quadTree.insert(tile);
        } else {
            tile[0].terrainType = newTerrainType;
        }
    }
}

class TerrainRenderer {
    constructor(canvas, terrain) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.terrain = terrain;
        this.tileSize = terrain.tileSize;

        canvas.addEventListener('click', this.onClick.bind(this));
    }
    drawTile(tile, canvasDrawScale = 1) {
        const gridOriginX = 0;
        const gridOriginY = 0;

        const isoX = tile.x;
        const isoY = tile.y;

        const screenX = gridOriginX + isoX * this.tileSize * canvasDrawScale / 2;
        const screenY = gridOriginY + isoY * this.tileSize * canvasDrawScale / 4;

        switch (tile.terrainType) {
            case 'grass':
                this.ctx.fillStyle = 'green';
                break;
            case 'water':
                this.ctx.fillStyle = 'blue';
                break;
            default:
                this.ctx.fillStyle = 'grey';
        }
        this.ctx.beginPath();
        this.ctx.moveTo(screenX, screenY);
        this.ctx.lineTo(screenX + this.tileSize * canvasDrawScale / 2, screenY + this.tileSize * canvasDrawScale / 4);
        this.ctx.lineTo(screenX, screenY + this.tileSize * canvasDrawScale / 2);
        this.ctx.lineTo(screenX - this.tileSize * canvasDrawScale / 2, screenY + this.tileSize * canvasDrawScale / 4);
        this.ctx.closePath();
        this.ctx.fill();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const range = new Rectangle(0, 0, this.canvas.width, this.canvas.height);
        const visibleTiles = this.terrain.quadTree.query(range);
        for (let tile of visibleTiles) {
            this.drawTile(tile);
        }
    }

    onClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const isoX = (mouseX / this.tileSize) + (mouseY / (this.tileSize / 2));
        const isoY = (mouseY / (this.tileSize / 2)) - (mouseX / this.tileSize);

        const x = Math.floor(isoX / 2 + isoY / 2);
        const y = Math.floor(isoY);

        this.terrain.updateTile(x, y, 'grass');
        this.render();
    }
}
export { Terrain, TerrainRenderer };