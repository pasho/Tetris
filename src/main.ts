import * as _ from 'lodash'

const blockSize = 25
const playFieldSize = { height: 22, width: 10 }

type Position = [number, number]
type Piece = Position[]

type Direction = 'left' | 'right' | 'down'

const pieces: Piece[] = [
    [
        [0, 0], [1, 0]
    ],
    [
        [0, 0],
        [0, 1]
    ]
]

interface State {
    playField: boolean[][]
    currentKey?: 'left' | 'right' | 'up' | 'down'
    currentPiece: Piece
    currentPiecePosition: Position
    ticksCounter: number
}

class Game {
    private playField: HTMLCanvasElement
    private state: State

    constructor() {
        //capture playfield
        this.playField = document.getElementById('playField') as HTMLCanvasElement
        this.playField.width = window.innerWidth
        this.playField.height = window.innerHeight

        //init state
        this.state = Object.assign(
            {
                ticksCounter: 0
            },
            this.initPlayField(),
            this.initPiece())
    }

    private initPlayField(){
        return {
            playField: _.range(0, playFieldSize.height)
                    .map(r => _.range(0, playFieldSize.width).map(c => false))
        }
    }

    private initPiece() {
        return {
            currentPiece: this.getNextPiece(),
            currentPiecePosition: [4, -1] as Position,
        }
    }

    public start() {
        console.log('start')
        //subscribe to keys
        window.onkeydown = (e) => {
            if (e.keyCode == 37) {
                this.state.currentKey = 'left'
                e.preventDefault()
            }
            if (e.keyCode == 38) {
                this.state.currentKey = 'up'
                e.preventDefault()
            }
            if (e.keyCode == 39) {
                this.state.currentKey = 'right'
                e.preventDefault()
            }
            if (e.keyCode == 40) {
                this.state.currentKey = 'down'
                e.preventDefault()
            }
        }

        window.onkeyup = () => {
            this.state.currentKey = undefined
        }

        window.setInterval(
            () => {
                if (this.state.currentKey && this.state.currentPiecePosition[0] != -1) {
                    if (this.state.currentKey == "left") {
                        this.move("left")
                    }
                    if (this.state.currentKey == "right") {
                        this.move('right')
                    }
                }
                if (this.state.ticksCounter % 10 == 0 || this.state.currentKey == 'down') {
                    this.move('down')
                }
                this.state.ticksCounter++

                this.clear()
                this.render()
            },
            100
        )
    }

    private getNextPiece(): Piece {
        let pieceIndex = Math.floor(Math.random() * pieces.length)
        return pieces[pieceIndex]
    }

    private clear() {
        let ctx = this.playField.getContext('2d')
        ctx.clearRect(0, 0, playFieldSize.width * blockSize + 1, playFieldSize.height * blockSize + 1)
    }

    private render() {
        let ctx = this.playField.getContext('2d')

        //draw playfield
        ctx.moveTo(0, 0)
        ctx.lineTo(0, playFieldSize.height * blockSize + 1)
        ctx.lineTo(playFieldSize.width * blockSize + 1, playFieldSize.height * blockSize + 1)
        ctx.lineTo(playFieldSize.width * blockSize + 1, 0)
        ctx.stroke()

        //render blocks
        for (let row = 0; row < playFieldSize.height; row++) {
            for (let col = 0; col < playFieldSize.width; col++) {
                if (this.state.playField[row][col]) {
                    ctx.fillRect(1 + col * blockSize, row * blockSize, blockSize, blockSize)
                }
            }
        }
    }

    private clearPiece() {
        let [currentX, currentY] = this.state.currentPiecePosition

        this.state.currentPiece
            .forEach(([blockX, blockY]) => {
                let blockPlayFieldX = blockX + currentX
                let blockPlayFieldY = blockY + currentY
                this.state.playField[blockPlayFieldX][blockPlayFieldY] = false
            })
    }

    private putPiece() {
        let [currentX, currentY] = this.state.currentPiecePosition

        this.state.currentPiece
            .forEach(([blockX, blockY]) => {
                let blockPlayFieldX = blockX + currentX
                let blockPlayFieldY = blockY + currentY
                if (blockPlayFieldY >= 0) {
                    this.state.playField[blockPlayFieldX][blockPlayFieldY] = true
                }
            })
    }

    private canMove(direction: Direction) {
        let [currentX, currentY] = this.state.currentPiecePosition

        let currentPositions = this.state.currentPiece
            .map(([blockX, blockY]): Position => [blockX + currentX, blockY + currentY])

        let movedPositions = currentPositions
            .map(position => this.getMovedPosition(position, direction))

        let newPositionsOnly = movedPositions
            .filter(([movedX, movedY]) => {
                let doesntOverlapsWithCurrent = currentPositions
                    .find(
                        ([currentX, currentY]) =>
                            currentX == movedX && currentY == movedY
                    ) === undefined

                return doesntOverlapsWithCurrent
            })

        let isOutOfBounds = newPositionsOnly.find(
            ([x, y]) =>
                x < 0 // too much left
                || x >= playFieldSize.width // too much right
                || y >= playFieldSize.height // through the bottom
        ) !== undefined

        if (isOutOfBounds) {
            return false
        }

        let isOverlapping = newPositionsOnly
            .find(
                ([x, y]) => this.state.playField[x][y]
            ) !== undefined

        if (isOverlapping) {
            return false
        }

        return true
    }

    private getMovedPosition([x, y]: Position, direction: Direction): Position {
        switch (direction) {
            case 'left':
                return [x - 1, y]
            case 'right':
                return [x + 1, y]
            case 'down':
                return [x, y + 1]
        }
    }

    private move(direction: Direction) {
        console.log(direction)
        if (this.canMove(direction)) {
            this.clearPiece()

            this.state.currentPiecePosition = this.getMovedPosition(this.state.currentPiecePosition, direction)

            this.putPiece()
        }
        else {
            if (direction == 'down') {
                this.tryClearRows()
                this.initNextPiece()
            }
        }
    }

    private tryClearRows(){
        let playFieldAfterFilledRowsRemoved = this.state.playField
            .filter(row => row.findIndex(x => x == false) != -1)

        let removedRowsCount = playFieldSize.height - playFieldAfterFilledRowsRemoved.length
        if (removedRowsCount > 0) {
            let blankRows = []
            for (let row = 0; row < removedRowsCount; row++) {
                blankRows[row] = []
                for (let col = 0; col < playFieldSize.width; col++) {
                    playFieldAfterFilledRowsRemoved[row][col] = false
                }
            }
            this.state.playField = blankRows.concat(playFieldAfterFilledRowsRemoved)
        }
    }

    private initNextPiece(){
        this.state = Object.assign(
            this.state,
            this.initPiece()
        )
    }
}

window.onload = () => {
    let game = new Game()
    game.start()
}

