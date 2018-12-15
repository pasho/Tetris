

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

    let currentPiece = [true, true]
    let currentPieceWidth = currentPiece.length
    let currentPieceCol = Math.floor((playFieldSize.width - currentPieceWidth) / 2)    
    let currentPieceRow = -1            

    function moveDown(){        
        //can move?        
        if(currentPieceRow != playFieldSize.height - 1 //not at the bottom
            && !playFieldState[currentPieceRow + 1][currentPieceCol]){
            //is visible?
            if(currentPieceRow >= 0){
                for(let colOffset = 0; colOffset < currentPieceWidth; colOffset++){
                    playFieldState[currentPieceRow][currentPieceCol + colOffset] = false
                }
            }

            currentPieceRow++
            for(let colOffset = 0; colOffset < currentPieceWidth; colOffset++){                
                playFieldState[currentPieceRow][currentPieceCol + colOffset] = true        
            }    
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

            currentPieceCol = Math.floor(playFieldSize.width - currentPieceWidth) / 2
            currentPieceRow = -1           
        }
    }    

    function moveSide(side: 'left' | 'right'){
        let sideCol = side == 'left' 
            ? Math.max(0, currentPieceCol - 1)
            : Math.min(playFieldSize.width - 1, currentPieceCol + 1)
            
        if(!playFieldState[currentPieceRow][sideCol]){
            playFieldState[currentPieceRow][currentPieceCol] = false
            currentPieceCol = sideCol
            playFieldState[currentPieceRow][currentPieceCol] = true 
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

