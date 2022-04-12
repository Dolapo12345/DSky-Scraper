import kaboom from "kaboom"

const windowWidth = document.documentElement.clientWidth
const windowHeight = document.documentElement.clientHeight
const trueWidth = 704;
const trueHeight = 448;
const scaleX = windowWidth / trueWidth
const scaleY = windowHeight / trueHeight 
const scaleGame = Math.min(scaleX, scaleY)
let firstSpawned = false
let firstAnvil = false
var clothesLineArray = []
var anvilArray = []
var gameMusicContainer = []

kaboom({
    width: trueWidth,
    height: trueHeight,
    scale: scaleGame,
    background: [48, 127, 196],
    font: "sinko",
})

layers([
    "background",
    "game",
    "danger",
    "player",
], "game")

loadSprite("health1", "sprites/healthSprites/oneHealth.png");
loadSprite("health2", "sprites/healthSprites/2Health.png");
loadSprite("health3", "sprites/healthSprites/fullHealth.png");
loadSprite("health0", "sprites/healthSprites/dead.png");
loadSprite("wallLeft", "sprites/wallLeft.png");
loadSprite("wallRight", "sprites/wallRight.png");
loadSprite("clotheLine", "sprites/clothesLineEmpty.png")
loadSprite("clotheLineShirt", "sprites/clotheShirt.png")
loadSprite("anvil", "sprites/anvil.png");
loadSprite("warning", "sprites/!.png");
loadSprite("clotheLineSocks", "sprites/clotheSocks.png")
loadSprite("dead", "sprites/dead.png");
loadSprite("clotheLineTrousers", "sprites/clothesTrousers.png")
loadSprite("backgroundMain", "sprites/mainBG.png");
loadSprite("backgroundGame", "sprites/background.png");
loadSprite("character", "sprites/charIdle.png", {
  sliceX: 5,
  sliceY: 3,
  anims: {
    idle: { from: 0, to: 3, loop: true, speed: 2},
    run: { from: 4, to: 7, loop: true, speed: 6},
    jump: 8,
    cling: 9,
    climb: {from: 10, to: 13, loop: true, speed: 5},
  },
})
loadSound("bruh", "/sounds/bruh.mp3")
loadSound("mainMenuMusic", "/sounds/mainMenu.mp3")
loadSound("gameIntroMusic", "/sounds/gameIntro.mp3")
loadSound("gameMusic", "/sounds/gameLoop.mp3")
loadSound("clothesLineBreak", "/sounds/clotheBreak.mp3")
loadSound("playerHit", "/sounds/maleHurt.mp3")
loadSound("anvilHit", "/sounds/anvil.mp3")

function gameOverScreen(finalScore, introMusPlay, gameMusPlay){
  const bigScore = add([
    text('Your score was!: '.concat(finalScore), {size: 30}),
    pos(150, 100),
    color(18, 27, 128),
  ])

  const homeButton = add([
    text('Main Menu', {size: 18}),
    pos(180, 200),
    color(18, 27, 128),
    area(),
  ])

  const playAgain = add([
    text('Play Again', {size: 18}),
    pos(360, 200),
    color(18, 27, 128),
    area(),
  ])

  homeButton.onHover(
    () => {homeButton.use(color(9, 14, 71));}, 
    ()=> {homeButton.use(color(18, 27, 128));});
  playAgain.onHover(
    () => {playAgain.use(color(9, 14, 71));}, 
    ()=> {playAgain.use(color(18, 27, 128));});

  
  
  homeButton.onClick(
    () => {
      go("mainMenu")
    })
  playAgain.onClick(
    () => {go("game", true, introMusPlay, gameMusPlay)})
      
}

function spawnClothesLine(){
  let sideToSpawn = randi(0, 2);
  let lineItem = randi(0,4)
  if (lineItem == 0){
    var curSprite = "clotheLine"
  } else if (lineItem == 1){
    var curSprite = "clotheLineShirt"
  } else if (lineItem == 2){
    var curSprite = "clotheLineSocks"
  } else{
    var curSprite = "clotheLineTrousers"
  }

  if (sideToSpawn == 1){
    const clothesLine = add([
      sprite(curSprite),
      pos(192, -63),
      "danger",
      area(),
      cleanup(2),
    ])  

    clothesLineArray.push(clothesLine)
  }
  else{
    const clothesLine = add([
      sprite(curSprite, {flipX: true}),
      pos(448, -63),
      "danger",
      area(),
      cleanup(2),
    ])

    clothesLineArray.push(clothesLine)
  }
}

function dropAnvil(){
  let dropSection = randi(1,4)
  let xAnvPos = 320
  
  if (dropSection == 1){
    xAnvPos = 192
  }
  else if (dropSection == 2){
    xAnvPos = 320
  }
  else{
    xAnvPos = 448
  }

  const warning = add([
      sprite("warning"),
      pos(xAnvPos, 32),
    ])


  wait(2, () =>{
    destroy(warning)
    const fallingAnvil = add([
      sprite("anvil"),
      pos(xAnvPos, -63),
      "anvil",
      area(),
      cleanup(2),
      scale(0.85),
    ])

    anvilArray.push(fallingAnvil)
  })
}


scene("game", (fromPrevGame, a, b) => {

  let score = 0
  let loopLevel = 0
  let gameOver = false
  let introMusPlaying = a
  let gameMusicPlaying = b
  let health = 3

  const introLoop = play("gameIntroMusic", {volume: 0.7},)
  introLoop.pause()

  const gameMusic = play("gameMusic", {volume: 0.7, loop: true})
  gameMusic.pause()

  if (fromPrevGame == true){
    introloop = gameMusicContainer[0]
  }

  const leftWall = add([
    sprite('wallLeft'),
    pos(0, -448),
    "wall",
  ])

  const rightWall = add([
    sprite('wallRight'),
    pos(512, -448),
    "wall",
  ])

  const gameBG = add([
    sprite('backgroundGame'),
    scale(4),
    "background",
    pos(192, -448),
  ])

  const scoreText = add([
    text('Score: 0', {size: 20}),
    pos(15,20),
    color(187,159,106),
  ])

  const player = add([
    sprite("character", { anim: "climb", flipX: true}),
    pos(192, 275),
    "player",
    area(),
    layer("player"),
  ])

  const healthUI = add([
    sprite("health3"),
    pos(7, 45),
    layer("danger"),
    scale(1.25)
  ])
  
  
  loop(0.125, () => {
    if (gameOver == false){
      score += 1
      scoreText.use(text('Score: '.concat(score), {size: 20}))
    }
  })
  

  const firstWait = 4.5
  let secondsWaited = 0
  let secondsWaitedAnvil = 0

  if (gameOver == false) {
    loop(0.5, () => {

      if (gameOver == false){
      
        if (gameOver == false){
          secondsWaited += 0.5
          secondsWaitedAnvil += 0.5
    
          
          if (firstSpawned == false){
            if (secondsWaited == firstWait){
              spawnClothesLine()
              firstSpawned = true
              secondsWaited = 0
            }
          }
          else if (firstSpawned == true){
            if (secondsWaited == 2){
              spawnClothesLine()
              secondsWaited = 0
            }
          }
    
          if (secondsWaitedAnvil == 6){
            secondsWaitedAnvil = 0
            firstAnvil = true
            dropAnvil()
          }
        }
      }
    })
  }

  var jumpActive = false
  var onLeftSide = true
  var xTarget = 192

  onMousePress( () => {

    if (gameOver == false){
      if (onLeftSide == true){
  
        if (jumpActive == false){
          jumpActive == true
          xTarget = 342
          player.use(sprite("character", {anim: "jump", flipX: true}))
  
          wait(0.42, () =>{
            if (gameOver == false){
            player.use(sprite("character", {anim: "jump", flipX: false}))}
            xTarget = 448
          })
          wait(0.715, () =>{
            if (gameOver == false){
            player.use(sprite("character", {anim: "climb", flipX: false}))}
            jumpActive = false
            onLeftSide = false
          })
        }
      }
      else{
        if (jumpActive == false){
          jumpActive == true
          xTarget = 320
          player.use(sprite("character", {anim: "jump", flipX: false}))
  
          wait(0.355, () =>{
            if (gameOver == false){
            player.use(sprite("character", {anim: "jump", flipX: true}))}
            xTarget = 192
          })
          wait(0.71, () =>{
            if (gameOver == false){
            player.use(sprite("character", {anim: "climb", flipX: true}))}
            jumpActive = false
            onLeftSide = true
          })
        }
      }
    }
  })

  onKeyPress("space", () => {
    if (onLeftSide == true){
  
        if (jumpActive == false){
          jumpActive == true
          xTarget = 342
          player.use(sprite("character", {anim: "jump", flipX: true}))
  
          wait(0.42, () =>{
            if (gameOver == false){
            player.use(sprite("character", {anim: "jump", flipX: false}))}
            xTarget = 448
          })
          wait(0.715, () =>{
            if (gameOver == false){
            player.use(sprite("character", {anim: "climb", flipX: false}))}
            jumpActive = false
            onLeftSide = false
          })
        }
      }
    else{
      if (jumpActive == false){
        jumpActive == true
        xTarget = 320
        player.use(sprite("character", {anim: "jump", flipX: false}))
  
        wait(0.355, () =>{
          if (gameOver == false){
          player.use(sprite("character", {anim: "jump", flipX: true}))}
          xTarget = 192
        })
        wait(0.71, () =>{
          if (gameOver == false){
          player.use(sprite("character", {anim: "climb", flipX: true}))}
          jumpActive = false
          onLeftSide = true
        })
      }
    }
  })

  onCollide("danger", "player", () => {
    play("playerHit", {volume: 0.6})
    play("clothesLineBreak", {volume: 0.6})
    shake(6)
    health -= 1
    player.use(color(255, 0, 0))
    
    wait(0.3, () =>{
      player.use(color(255, 255, 255))
    })
    wait(0.6, () =>{
      player.use(color(255, 0, 0))
    })
    wait(0.9, () =>{
      player.use(color(255, 255, 255))
    })
  })

  onCollide("anvil", "player", () => {
    play("playerHit", {volume: 0.6})
    play("anvilHit", {volume: 0.6})
    shake(6)
    health -= 1
    player.use(color(255, 0, 0))
    
    wait(0.3, () =>{
      player.use(color(255, 255, 255))
    })
    wait(0.6, () =>{
      player.use(color(255, 0, 0))
    })
    wait(0.9, () =>{
      player.use(color(255, 255, 255))
    })
  })

  onUpdate(() => {

    if(firstSpawned == true){var frstSpwn = true}
    if(firstAnvil == true){var anvlSpwn = true}

    if (gameOver == true){
      introLoop.stop()
      if (introMusPlaying == true){
        introLoop.stop()
      }
      if (gameMusicPlaying == true){
        gameMusic.stop()
      }
      gameOverScreen(score, introMusPlaying, gameMusicPlaying)
    }

    if (gameOver == false){

      if (health == 2){
        healthUI.use(sprite("health2"))
      } else if (health == 1){
        healthUI.use(sprite("health1"))
      } else if (health == 0){
        healthUI.use(sprite("health0"))
        player.use(sprite("dead"))
        gameOver = true
      }

      player.moveTo(xTarget, 275, 360)

      gameBG.move(0, 5)
      rightWall.move(0, 150)
      leftWall.move(0, 150)
      loopLevel += 1


      if (frstSpwn == true){
          for (let i = 0; i < clothesLineArray.length; i++) {
            clothesLineArray[i].move(0, 150)
          }
      }

      if (anvlSpwn == true){
          for (let i = 0; i < anvilArray.length; i++) {
            anvilArray[i].move(0, 400)
          }
      }
    
      
      if (introMusPlaying == false){
        introLoop.play()
        gameMusicContainer.push(introLoop)
        introMusPlaying = true
        console.log(gameMusicContainer)
      }
        
      


      if (gameMusicPlaying == false){

        if(introLoop.time() >= introLoop.duration()){
          gameMusic.play()
          gameMusicContainer.push(gameMusic)
          gameMusicPlaying = true
        }
        
      }
  
      if (loopLevel == 180) {
  
        leftWall.moveTo(0, -448)
        rightWall.moveTo(512, -448)
        loopLevel = 0
      }
      
    }
  })
})

scene("mainMenu", () => {


  const mainMusic = play("mainMenuMusic", {
    volume: 0.7,
    loop: true
  })

  mainMusic.volume(0.7)



  
  
  const background = add([
    sprite("backgroundMain"),
    pos(0,0),
    ])

  const introClimber = add([
    sprite("character", { anim: "idle",}),
    pos(95, 210),
  ])

  const startButton = add([
    text("Play Game", {size: 30}),
    pos(470,135),
    color(163,97,52),
    area(),
  ])


  startButton.onHover(
    () => {startButton.use(color(138, 83, 10));}, 
    ()=> {startButton.use(color(163,97,52));});
  
  
  startButton.onClick(
    () => {

      introClimber.use(sprite("character", { anim: "run",}))

      var introRun = true

      if (introRun == true){
        onUpdate( ()=>{
          introClimber.move(150, 0)
        })
      }

      
      wait(0.9, () =>{
        introRun = false
        introClimber.use(sprite("character", { anim: "jump",}))

        var introJumpRight = true
        if (introJumpRight == true){
          onUpdate( ()=>{
          introClimber.move(150, -250)
          })
      }
      })

      wait(1.4, ()=>{
        introJumpRight = false
        introClimber.use(sprite("character", { anim: "cling",}))
        introClimber.move(-600, 250)
      })

      wait(1.5, ()=>{
        introClimber.use(sprite("character", { anim: "jump", flipX: true}))

        var introJumpLeft = true
        if (introJumpLeft == true){
          onUpdate( ()=>{
          introClimber.move(-600, -250)
          })
      }
      })


      
      wait(2.25, () =>{
        mainMusic.stop()
        go("game", false, false, false)
      })
    }) 
})



go("mainMenu")
