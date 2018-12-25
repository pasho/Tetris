const blockSize = 25
const playFieldSize = { height: 22, width: 10 }

type Row = number
type Col = number
type Pos = [Row, Col]
type Piece = Pos[]

type Direction = 'left' | 'right' | 'down'

const pieces: Piece[] = [
    [
        [0, -1], [0, 0], [0, 1], [0, 2]
    ],
    [
        [0, 0], [0, 1],
        [1, 0], [1, 1]
    ],
    [
        [0, -1], [0, 0], [0, 1],
        [1, -1]
    ],
    [
        [0, -1], [0, 0], [0, 1],
                         [1, 1]
    ],
    [
        [0, -1], [0, 0], [0, 1],
                 [1, 0]
    ],
    [
        [0, -1], [0, 0], 
                 [1, 0], [1, 1]
    ],
    [
                 [0, 0], [0, 1],
        [1, -1], [1, 0]
    ],
]

interface State {
    playField: boolean[][]
    currentKey?: 'left' | 'right' | 'up' | 'down'
    currentPiece: Piece
    currentPiecePosition: Pos
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
        let playField: boolean[][] = []
        for(let row = 0; row < playFieldSize.height; row++){
            playField[row] = []
            for(let col = 0; col < playFieldSize.width; col++){
                playField[row][col] = false;
            }
        }

        return { playField }
    }

    private initPiece() {
        return {
            currentPiece: this.getNextPiece(),
            currentPiecePosition: [-1, 4] as Pos,
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
                this.rotate()
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

    private showHidePiece(action: 'show' | 'hide'){
        let fill = action == 'show'

        let [currentRow, currentCol] = this.state.currentPiecePosition

        this.state.currentPiece
            .forEach(([blockRow, blockCol]) => {
                let blockPlayFieldRow = blockRow + currentRow
                let blockPlayFieldCol = blockCol + currentCol
                if(blockPlayFieldRow >= 0){
                    this.state.playField[blockPlayFieldRow][blockPlayFieldCol] = fill
                }
            })
    }

    private clearPiece() {
        this.showHidePiece('hide')
    }

    private putPiece() {
        this.showHidePiece('show')
    }

    private getPostions(piece: Piece, [row, col]: Pos){
        let positions = piece
            .map(([blockRow, blockCol]): Pos => [blockRow + row, blockCol + col])
        
        return positions
    }

    private getCurrentPositions(){
        return this.getPostions(this.state.currentPiece, this.state.currentPiecePosition)
    }

    private canMove(direction: Direction) {
        let currentPositions = this.getCurrentPositions()

        let movedPositions = currentPositions
            .map(position => this.getMovedPosition(position, direction))

        return this.validate(movedPositions)
    }

    private validate(transformedPositions: Pos[]){
        let currentPositions = this.getCurrentPositions()

        let newPositionsOnly = transformedPositions
            .filter(([movedRow, movedCol]) => {
                let doesntOverlapsWithCurrent = currentPositions
                    .find(
                        ([currentRow, currentCol]) =>
                            currentRow == movedRow && currentCol == movedCol
                    ) === undefined

                return doesntOverlapsWithCurrent
            })

        let isOutOfBounds = newPositionsOnly.find(
            ([row, col]) =>
                col < 0 // too much left
                || col >= playFieldSize.width // too much right
                || row >= playFieldSize.height // through the bottom
        ) !== undefined

        if (isOutOfBounds) {
            return false
        }

        let isOverlapping = newPositionsOnly
            .find(
                ([row, col]) => this.state.playField[row][col]
            ) !== undefined

        if (isOverlapping) {
            return false
        }

        return true
    }

    private getMovedPosition([row, col]: Pos, direction: Direction): Pos {
        switch (direction) {
            case 'left':
                return [row, col - 1]
            case 'right':
                return [row, col + 1]
            case 'down':
                return [row + 1, col]
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

    private rotate(){
        // 90 degrees clockwise
        let rotationMatrix = [
            [0, 1],
            [-1, 0]
        ]

        let rotatedPiece = this.state.currentPiece.map(
            ([row, col]): Pos => {
                let rotatedRow = row * rotationMatrix[0][0] + col * rotationMatrix[0][1]
                let rotatedCol = row * rotationMatrix[1][0] + col * rotationMatrix[1][1]

                return [rotatedRow, rotatedCol]
            }
        )

        let rotatedPositions = this.getPostions(rotatedPiece, this.state.currentPiecePosition)

        if(this.validate(rotatedPositions)){
            this.clearPiece()

            this.state.currentPiece = rotatedPiece

            this.putPiece()
        }
    }

    private tryClearRows(){
        let playFieldAfterFilledRowsRemoved = this.state.playField
            .filter(row => row.findIndex(filled => filled == false) != -1)

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

