

window.onload = () => {
    let playField = document.getElementById('playField') as HTMLCanvasElement

    playField.width = window.innerWidth
    playField.height = window.innerHeight

    let blockSize = 25
    let playFieldSize = { height: 22, width: 10 }

    let playFieldState: boolean[][] = [];

    for(let row = 0; row < playFieldSize.height; row++){
        playFieldState[row] = []
        for(let col = 0; col < playFieldSize.width; col++){
            playFieldState[row][col] = false            
        }
    }

    function clear(){
        let ctx = playField.getContext('2d')
        ctx.clearRect(0, 0, playFieldSize.width * blockSize + 1, playFieldSize.height * blockSize + 1)
    }

    function render(){
        let ctx = playField.getContext('2d')
        ctx.moveTo(0, 0)
        ctx.lineTo(0, playFieldSize.height * blockSize + 1)
        ctx.lineTo(playFieldSize.width * blockSize + 1, playFieldSize.height * blockSize + 1)
        ctx.lineTo(playFieldSize.width * blockSize + 1, 0)           
        ctx.stroke()            

        //render state        
        for(let row = 0; row < playFieldSize.height; row++){                        
            for(let col = 0; col < playFieldSize.width; col++){
                if(playFieldState[row][col]){                                   
                    ctx.fillRect(1 + col * blockSize, row * blockSize, blockSize, blockSize)                                                          
                }
            }
        }
    }

    let currentKey: 'left' | 'right' | 'up' | 'down' | undefined = undefined

    window.onkeydown = (e) => {
        if(e.keyCode == 37) {
            currentKey = 'left'
            e.preventDefault()
        }
        if(e.keyCode == 38) {
            currentKey = 'up'
            e.preventDefault()
        }
        if(e.keyCode == 39) {
            currentKey = 'right'
            e.preventDefault()
        }
        if(e.keyCode == 40) {
            currentKey = 'down'
            e.preventDefault()
        }        
    }
    window.onkeyup = () => {
        currentKey = undefined
    }

    const pieces = [
        [
            [true, true]
        ],
        [
            [true],
            [true]
        ]
    ]

    function getNextPiece(){
        let pieceIndex = Math.floor(Math.random() * pieces.length)        
        return pieces[pieceIndex]        
    }

    let currentPiece = getNextPiece()
    let currentPieceHeight = currentPiece.length
    let currentPieceWidth = currentPiece.map(cols => cols.length).reduce((a, b) => a > b ? a : b)
    let currentPieceCol = Math.floor((playFieldSize.width - currentPieceWidth) / 2)    
    let currentPieceRow = -1            

    function clearPiece(){
        for(let rowOffset = 0; rowOffset < currentPieceHeight; rowOffset++){
            for(let colOffset = 0; colOffset < currentPieceWidth; colOffset++){
                let row = currentPieceRow - rowOffset
                if(row >= 0){
                    playFieldState[row][currentPieceCol + colOffset] = false
                }
            }
        }
    }

    function putPiece(){
        for(let rowOffset = 0; rowOffset < currentPieceHeight; rowOffset++){           
            for(let colOffset = 0; colOffset < currentPieceWidth; colOffset++){                     
                let row = currentPieceRow - rowOffset                    
                if(row >= 0){                        
                    playFieldState[row][currentPieceCol + colOffset] = true
                }
            }       
        }
    }

    function moveDown(){        
        //can move?       
        let notBottom = currentPieceRow != playFieldSize.height - 1        
        let nothingBelow = notBottom && !currentPiece
            .map((_, offset) => playFieldState[currentPieceRow + 1][currentPieceCol + offset])
            .reduce((a, b) => a || b)

        if(notBottom && nothingBelow){
            //is visible?
            if(currentPieceRow >= 0){
                clearPiece()
            }

            currentPieceRow++       

            putPiece()
        }
        else{
            let afterRowsCleared = playFieldState.filter(row => row.findIndex(x => x == false) != -1)
            let removedRows = playFieldSize.height - afterRowsCleared.length
            if(removedRows > 0){                  
                let blankRows = []           
                for(let row = 0; row < removedRows; row++){
                    blankRows[row] = []
                    for(let col = 0; col < playFieldSize.width; col++){
                        afterRowsCleared[row][col] = false                        
                    }
                }
                playFieldState = blankRows.concat(afterRowsCleared)
            }

            currentPiece = getNextPiece()
            currentPieceHeight = currentPiece.length
            currentPieceWidth = currentPiece.map(cols => cols.length).reduce((a, b) => a > b ? a : b)
            currentPieceCol = Math.floor((playFieldSize.width - currentPieceWidth) / 2)
            currentPieceRow = -1           
        }
    }    

    function moveSide(side: 'left' | 'right'){
        let sideCol = side == 'left' 
            ? Math.max(0, currentPieceCol - 1)
            : Math.min(playFieldSize.width - 1, currentPieceCol + currentPieceWidth)
            
        if(!playFieldState[currentPieceRow][sideCol]){            
            clearPiece()
            currentPieceCol = sideCol            
            putPiece()
        }
    }

    render()

    let ticksCounter = 0

    window.setInterval(
        () => {
            if(currentKey && currentPieceRow != -1){
                if(currentKey == "left"){
                    moveSide("left")
                }
                if(currentKey == "right"){
                    moveSide('right')
                }
            }
            if(ticksCounter % 10 == 0 || currentKey == 'down'){
                moveDown()
            }
            ticksCounter++

            clear()
            render()
        },
        100
    )
}

