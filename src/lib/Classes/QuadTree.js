class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(tile) {
        const tileX = tile.x - tile.y;
        const tileY = tile.x + tile.y;
        const tileWidth = 1;
        const tileHeight = 1;
    
        const tileLeft = tileX - tileWidth / 2;
        const tileRight = tileX + tileWidth / 2;
        const tileTop = tileY - tileHeight / 2;
        const tileBottom = tileY + tileHeight / 2;
    
        return (
            tileLeft >= this.x &&
            tileRight < this.x + this.w &&
            tileTop >= this.y &&
            tileBottom < this.y + this.h
        );
    }

    intersects(range) {
        return !(
            range.x > this.x + this.w ||
            range.x + range.w < this.x ||
            range.y > this.y + this.h ||
            range.y + range.h < this.y
        );
    }

    static merge(boundary1, boundary2) {
        const x = Math.min(boundary1.x, boundary2.x);
        const y = Math.min(boundary1.y, boundary2.y);
        const w = Math.max(boundary1.x + boundary1.w, boundary2.x + boundary2.w) - x;
        const h = Math.max(boundary1.y + boundary1.h, boundary2.y + boundary2.h) - y;
        return new Rectangle(x, y, w, h);
    }
}
class QuadTree {
    constructor(boundary, capacity) {
        this.boundary = boundary;  // Boundary of the current node
        this.capacity = capacity;  // Max number of objects in this node
        this.tiles = [];  // Tiles stored in this node
        this.divided = false;  // Whether this node is divided
    }

    subdivide() {
        const { x, y, w, h } = this.boundary;
        const nw = new Rectangle(x, y, w / 2, h / 2);
        const ne = new Rectangle(x + w / 2, y, w / 2, h / 2);
        const sw = new Rectangle(x, y + h / 2, w / 2, h / 2);
        const se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);

        this.northwest = new QuadTree(nw, this.capacity);
        this.northeast = new QuadTree(ne, this.capacity);
        this.southwest = new QuadTree(sw, this.capacity);
        this.southeast = new QuadTree(se, this.capacity);

        this.divided = true;
    }

    insert(tile, checkedForRootBounds = false) {
        if (!this.boundary.contains(tile) && !checkedForRootBounds) {
            this.expandAndInsert(tile);
            return true;
        }
    
        if (this.tiles.length < this.capacity) {
            this.tiles.push(tile);
        } else {
            if (!this.divided) {
                this.subdivide();
            }
    
            const { x, y, w, h } = this.boundary;
            const centerX = x + w / 2;
            const centerY = y + h / 2;
    
            // Insert the tile into all relevant quadrants
            if (tile.x < centerX) {
                if (tile.y < centerY) {
                    this.northwest.insert(tile, true);
                } else {
                    if (!this.southwest.divided) {
                        this.southwest.subdivide();
                    }
                    this.southwest.insert(tile, true);
                }
            } else {
                if (tile.y < centerY) {
                    if (!this.northeast.divided) {
                        this.northeast.subdivide();
                    }
                    this.northeast.insert(tile, true);
                } else {
                    if (!this.southeast.divided) {
                        this.southeast.subdivide();
                    }
                    this.southeast.insert(tile, true);
                }
            }
        }
    
        return true;
    }query(range, found = []) {
        if (!this.boundary.intersects(range)) {
            return found;
        }
    
        for (let tile of this.tiles) {
            if (range.contains(tile)) {
                found.push(tile);
            }
        }
    
        if (this.divided) {
            if (this.northwest.boundary.intersects(range)) {
                this.northwest.query(range, found);
            }
            if (this.northeast.boundary.intersects(range)) {
                this.northeast.query(range, found);
            }
            if (this.southwest.boundary.intersects(range)) {
                this.southwest.query(range, found);
            }
            if (this.southeast.boundary.intersects(range)) {
                this.southeast.query(range, found);
            }
        }
    
        return found;
    }
    expandAndInsert(tile) {
        // Create a new boundary that includes the tile
        const newBoundary = Rectangle.merge(this.boundary, new Rectangle(tile.x, tile.y, 1, 1));

        // Create a new root node with the new boundary
        const newRoot = new QuadTree(newBoundary, this.capacity);

        // Insert the current tiles into the new root
        for (let existingTile of this.tiles) {
            newRoot.insert(existingTile, true);
        }

        // Insert the new tile into the new root
        newRoot.insert(tile, true);

        // Copy the quadrant information from the current tree to the new root
        if (this.divided) {
            newRoot.subdivide();
            newRoot.northwest = this.northwest;
            newRoot.northeast = this.northeast;
            newRoot.southwest = this.southwest;
            newRoot.southeast = this.southeast;
        }

        // Replace the current tree's attributes with the new root's
        this.boundary = newRoot.boundary;
        this.tiles = newRoot.tiles;
        this.divided = newRoot.divided;
        this.northwest = newRoot.northwest;
        this.northeast = newRoot.northeast;
        this.southwest = newRoot.southwest;
        this.southeast = newRoot.southeast;
    }

    insertInto(targetQuadTree, sourceQuadTree) {
        for (let tile of sourceQuadTree.tiles) {
            targetQuadTree.insert(tile, true);
        }

        if (sourceQuadTree.divided) {
            targetQuadTree.subdivide();
            targetQuadTree.northwest = sourceQuadTree.northwest;
            targetQuadTree.northeast = sourceQuadTree.northeast;
            targetQuadTree.southwest = sourceQuadTree.southwest;
            targetQuadTree.southeast = sourceQuadTree.southeast;
        }
    }
}




export { QuadTree, Rectangle }