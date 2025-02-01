const NEIGHBOR_OFFSETS: [number, number][] = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
];


enum maskType {
    "island",
    "humanoid",
    "spaceship"
}


class MapGenerator {
    size: number = 16;
    maskValue = new Map<maskType, number[][]>();
    mask: number[][] = [];
    default_mask() {
        this.maskValue.set(maskType.island,
            [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1],
                [0, 0, 0, 0, 1, 1, 2, 2],
                [0, 0, 0, 0, 1, 1, 2, 2],
                [0, 0, 0, 0, 2, 2, 2, 2],
                [0, 0, 0, 1, 1, 1, 2, 2],
                [0, 0, 0, 2, 0, 0, 1, 1],
                [0, 0, 0, 0, 0, 0, 0, 0],
            ]
        )
        this.maskValue.set(maskType.humanoid, [[]])
        this.maskValue.set(maskType.spaceship, [[]])

    }

    map: boolean[][] = [];


    constructor(size: number, mask?: number[][], type_of_mask?: maskType) {
        this.size = size;

        if (mask) {
            this.mask = mask
            return
        }

        this.default_mask()

        if (type_of_mask) {
            const mask = this.maskValue.get(type_of_mask);
            if (mask === undefined) {
                throw new Error(`Mask not found for type: ${type_of_mask}`);
            }
            this.mask = mask;
            return
        }

        this.mask = this.maskValue.get(maskType.island) as number[][]
    }



    generate_map() {
        if (this.size * 2 < this.maskValue.size) {
            throw new Error(`The Size of sprite should be atleast ${this.size}`);
        }

        this._generate_random()
    }




    _generate_random() {
        for (let index_y = 0; index_y < this.size; index_y++) {
            var row: boolean[] = []

            const cur_index_y = Math.round((index_y * this.mask.length - 1) / this.size)
            for (let index_x = 0; index_x < this.size; index_x++) {
                const cur_index_x = Math.round((index_x * this.mask[0].length - 1) / this.size)
                if (Math.random() < this.mask[cur_index_y][cur_index_x] / 2 && Math.random() > 0.2) {
                    row.push(true)
                } else {
                    row.push(false)
                }
            }

            this.map.push([...row, ...row.reverse()])
        }
    }


    walk(step: number = 4, birthLimit: number = 5, deathLimit: number = 4) {
        for (let index = 0; index < step; index++) {
            this.getNextGeneration(birthLimit, deathLimit)
        }
    }


    getNextGeneration(birthLimit: number, deathLimit: number) {
        const rows = this.map.length;
        if (rows === 0) return [];
        const cols = this.map[0].length;
        const newGrid: boolean[][] = new Array(rows);

        for (let i = 0; i < rows; i++) {
            newGrid[i] = new Array(cols);
            for (let j = 0; j < cols; j++) {
                let liveNeighbors = 0;

                for (const [di, dj] of NEIGHBOR_OFFSETS) {
                    const ni = i + di;
                    const nj = j + dj;
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && this.map[ni][nj]) {
                        liveNeighbors++;
                    }
                }

                const isAlive = this.map[i][j];
                newGrid[i][j] = isAlive
                    ? liveNeighbors > deathLimit
                    : liveNeighbors === birthLimit;
            }
        }

        return newGrid;
    }
}




class Procemon {
    size: number = 16;
    map: MapGenerator;


    constructor(size: number, mask?: number[][], type_of_mask?: maskType) {
        this.size = Math.ceil(size * 0.5);

        this.map = new MapGenerator(this.size, mask, type_of_mask)

        // var a = this.palette(0.2);
        // var b = this.palette(0.4);
        // var c = this.palette(0.6);
        // var d = this.palette(0.8);


        this.map.generate_map()
        this.map.walk()
    }

    palette(t: number): [number, number, number] {
        const [a0, a1, a2, b0, b1, b2, c0, c1, c2, d0, d1, d2] = this.generateRandomPaletteParams();
        const TAU = Math.PI * 2;

        const r = a0 + b0 * Math.cos(TAU * (c0 * t + d0));
        const g = a1 + b1 * Math.cos(TAU * (c1 * t + d1));
        const bColor = a2 + b2 * Math.cos(TAU * (c2 * t + d2));

        return [
            Math.min(1, Math.max(0, r)),
            Math.min(1, Math.max(0, g)),
            Math.min(1, Math.max(0, bColor))
        ];
    }

    getRandomValue(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    generateRandomPaletteParams(): [number, number, number, number, number, number, number, number, number, number, number, number] {
        return [
            this.getRandomValue(0, 1), this.getRandomValue(0, 1), this.getRandomValue(0, 1),
            this.getRandomValue(0, 1), this.getRandomValue(0, 1), this.getRandomValue(0, 1),
            this.getRandomValue(0, 2), this.getRandomValue(0, 2), this.getRandomValue(0, 2),
            this.getRandomValue(0, 1), this.getRandomValue(0, 1), this.getRandomValue(0, 1)
        ];
    }

    gen_mosnter() {
        return this.map.map
    }

    generate_seed() {

    }

    // plot_canvas(canvas: HTMLCanvasElement) {
    //     const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    //     ctx.clearRect(0, 0, canvas.width, canvas.height)

    //     ctx.beginPath();
    //     ctx.fillStyle = 'white';

    //     var pixel_size = canvas.width / (this.size * 2);

    //     this.map.map.forEach((y_element, index_y) => {
    //         y_element.forEach((x_element, index_x) => {
    //             if (x_element) {
    //                 ctx.fillRect(index_x * pixel_size, index_y * pixel_size, pixel_size, pixel_size);
    //                 ctx.stroke();
    //             }
    //         });
    //     });
    // }

    plot_svg(bgcolor: string, color: string): string {
        const buffer = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="256" height="256" >`, `<rect width="100%" height="100%" fill="${bgcolor}"/>`]; // 8x multiplier

        let i = 0;
        this.map.map.forEach((y_element, index_y) => {
            y_element.forEach((x_element, index_x) => {
                if (x_element) {
                    buffer.push(`<rect x="${index_x}" y="${index_y}" width="1" height="1" fill="${color}" />`);
                }
            });
        });
        
        buffer.push('</svg>');
        return buffer.join('');
    }
}

export default Procemon;