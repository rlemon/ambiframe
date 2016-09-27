const fileInput = document.getElementById('input-image');
// virtual
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
// input preview
const icanvas = document.getElementById('input');
const icontext = icanvas.getContext('2d');
// output
const ocanvas = document.getElementById('output');
const ocontext = ocanvas.getContext('2d');

fileInput.addEventListener('change', event => readImage(fileInput.files[0]));

function readImage(file) {
	const reader = new FileReader();
	reader.onload = _ => {
		const img = new Image();
		img.onload = processImage;
		img.src = reader.result;
	};
	reader.readAsDataURL(file);
}

function processImage() {
	canvas.width = icanvas.width = ocanvas.width = this.width;
	canvas.height = icanvas.height = ocanvas.height = this.height;
	icontext.drawImage(this, 0, 0);
	context.drawImage(this, 0, 0);
	const idata = context.getImageData(0, 0, canvas.width, canvas.height);
	getEdgeData(idata);
}

function getEdgeData(idata) {
	const grid = [];
	const yResolution = idata.height / 6;
	const xResolution = idata.width / 6;
	for( let y = 0; y < idata.height; y += yResolution) {
		const yIndex = y / yResolution;
		grid[yIndex] = [];
		for( let x = 0; x < idata.width; x += (y === 0 || Math.round(y) === Math.round(idata.height - yResolution) ) ? xResolution : idata.width - xResolution ) {
			const xIndex = x / xResolution;
			grid[yIndex][xIndex] = getAverageColor(idata, x + xResolution, y + yResolution, xResolution, yResolution);
		}
	}
	superTemporayRenderFunction(grid, xResolution, yResolution);
}

function getAverageColor(idata, x1, y1, width, height) {
	let [r,g,b] = [0,0,0];
	let count = 0;
	for( let x2 = x1; x2 < x1 + width; x2++ ) {
		for( let y2 = y1; y2 < y1 + height; y2++ ) {
			const index = Math.floor( (x2 - width) + Math.floor( ( y2 - height ) * idata.width) ) * 4;
			count++;
			r += idata.data[index];
			g += idata.data[index + 1];
			b += idata.data[index + 2];
		}
	}
	[r,g,b] = [r,g,b].map(x=>Math.floor(x/count));
	return {r,g,b};
}

function superTemporayRenderFunction(grid, xResolution, yResolution) {
	console.log(grid);
	for( let y = 0; y < grid.length; y++ ) {
		for( let x = 0; x < grid[y].length; x++ ) {
			if( !grid[y][x] ) continue;
			const rgb = grid[y][x];
			ocontext.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
			ocontext.fillRect( x * xResolution, y * yResolution, xResolution, yResolution);
		}
	}
}