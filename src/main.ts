

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
            //playFieldState[row][col] = row % 2 == 0 && col % 2 == 0
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

    let currentPieceCol = 4
    let currentPieceRow = -1    

    function move(){        
        //can move?        
        if(currentPieceRow != playFieldSize.height - 1 //not at the bottom
            && !playFieldState[currentPieceRow + 1][currentPieceCol]){
            //is visible?
            if(currentPieceRow >= 0){
                playFieldState[currentPieceRow][currentPieceCol] = false
            }

            currentPieceRow++
            playFieldState[currentPieceRow][currentPieceCol] = true            
        }
        else{
            currentPieceCol = 4
            currentPieceRow = -1           
        }
    }

    render()

    let ticksCounter = 0

    window.setInterval(
        () => {
            if(currentKey && currentPieceRow != -1){
                if(currentKey == "left"){
                    playFieldState[currentPieceRow][currentPieceCol] = false
                    currentPieceCol = Math.max(0, currentPieceCol - 1)
                    playFieldState[currentPieceRow][currentPieceCol] = true 
                }
                if(currentKey == "right"){
                    playFieldState[currentPieceRow][currentPieceCol] = false
                    currentPieceCol = Math.min(9, currentPieceCol + 1)
                    playFieldState[currentPieceRow][currentPieceCol] = true 
                }
            }
            if(ticksCounter % 10 == 0 || currentKey == 'down'){
                move()
            }
            ticksCounter++

            clear()
            render()
        },
        100
    )
}

