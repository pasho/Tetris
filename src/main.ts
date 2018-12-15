window.onload = () => {
    let playField = document.getElementById('playField') as HTMLCanvasElement

    playField.width = window.innerWidth
    playField.height = window.innerHeight

    let blockSize = 25
    let playFieldSize = { height: 22, width: 10 }

    let ctx = playField.getContext('2d')
    ctx.moveTo(0, 0)
    ctx.lineTo(0, playFieldSize.height * blockSize + 1)
    ctx.lineTo(playFieldSize.width * blockSize + 1, playFieldSize.height * blockSize + 1)
    ctx.lineTo(playFieldSize.width * blockSize + 1, 0)
    ctx.stroke()
}