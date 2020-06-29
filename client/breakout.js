// import Phaser from "phaser";
// import LoadingScene from './loadingScene'

let player, ball, blueBrick, greenBrick, redBrick, orangeBrick, cursors
let gameStart = false;
let score = 0
let scoreText;
let rick;

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 600,
  debug: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: {
    preload,
    create,
    update,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: false
    }
  }
}

const game = new Phaser.Game(config)


function preload() {

  this.load.audio('rick', './public/assets/rick-rolled.ogg')
  this.load.image('background', './public/assets/images/background.png')
  this.load.image('ball', './public/assets/images/ball.png')
  this.load.image('brick1', './public/assets/images/brick-blue.png')
  this.load.image('brick2', './public/assets/images/brick-green.png')
  this.load.image('brick3', './public/assets/images/brick-red.png')
  this.load.image('brick4', './public/assets/images/brick-orange.png')
  this.load.image('paddle', './public/assets/images/paddle.png')
}

function create() {

  //background
  this.add.sprite(0,0, 'background').setOrigin(0,0).setScale(1.40)

  //Rick roll 'em
  this.rickRolled = this.sound.add('rick')
  this.rickRolled.play()


  //setting up scoreboard
  scoreText = this.add.text(5, 5, 'score: 0', { fontSize: '28px', fill: '#fff' });

  //creating player via paddle
  player = this.physics.add.sprite(
    400, //x position
    600, //y position
    'paddle'
  ).setScale(.15),
  player.setImmovable(true)
  player.body.collideWorldBounds = true;

  //create ball
  ball = this.physics.add.sprite(
    400,
    565,
    'ball'
  ).setScale(.015)

  ball.body.collideWorldBounds = true;
  ball.body.setBounce(1)

  //add bricks
  blueBricks = this.physics.add.group({
    key: 'brick1',
    repeat: 8,
    immovable: true,
    setXY: {
      x: 120,
      y: 45,
      stepX:70
    },
    setScale: {
      x: .3,
      y: .3
    }
  })
  greenBricks = this.physics.add.group({
    key: 'brick2',
    repeat: 7,
    immovable: true,
    setXY: {
      x: 150,
      y: 80,
      stepX:70
    },
    setScale: {
      x: .3,
      y: .3
    }
  })
  redBricks = this.physics.add.group({
    key: 'brick3',
    repeat: 9,
    immovable: true,
    setXY: {
      x: 87,
      y: 115,
      stepX:70
    },
    setScale: {
      x: .3,
      y: .3
    }
  })
  orangeBricks = this.physics.add.group({
    key: 'brick4',
    repeat: 8,
    immovable: true,
    setXY: {
      x: 120,
      y: 150,
      stepX:70
    },
    setScale: {
      x: .3,
      y: .3
    }
  })

  //add keyboard movement - up, down, left, right, shift, space
  cursors = this.input.keyboard.createCursorKeys()

  //COLLISIONS

  //create collisions between brick and ball
  this.physics.add.collider(ball, blueBricks, brickCollision, null, this)
  this.physics.add.collider(ball, greenBricks, brickCollision, null, this)
  this.physics.add.collider(ball, redBricks, brickCollision, null, this)
  this.physics.add.collider(ball, orangeBricks, brickCollision, null, this)

  //create collision between paddle and ball
  this.physics.add.collider(ball, player, playerCollision, null, this)

  //GAME STATUS START/WIN/LOSE
  startGameText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    'Press Spacebar to Start',
    {
      fontFamily: 'Courier',
      fontSize: '50px',
      fill: '#fff'
    }
  )

  startGameText.setOrigin(0.5)
  startGameText.setVisible(true)

  lostText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    'Try Again?',
    {
      fontFamily: 'Courier',
      fontSize: '50px',
      fill: '#fff'
    }
  )

  lostText.setOrigin(0.5)
  lostText.setVisible(false)

  winText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    'You win!',
    {
      fontFamily: 'Courier',
      fontSize: '50px',
      fill: '#fff'
    }
  )

  winText.setOrigin(0.5)
  winText.setVisible(false)

}

function update(){
  //GameStart on space
  if (!gameStart) {
    ball.setX(player.x)
    ball.setVelocityY(0) //prevents ball from floating up
    ball.setVelocityX(0) //prevents ball from floating left or right

    if(cursors.space.isDown) {
      gameStart = true
      startGameText.setVisible(false)
      ball.setVelocityY(-250)

    }
  }

  if (gameOver(this.physics.world)) {
    lostText.setVisible(true);
    ball.disableBody(true, true)
    if(cursors.shift.isDown) {
      gameStart = false
      this.scene.restart()
      score = 0
    }

  } else if (win()) {
    winText.setVisible(true)
    ball.disableBody(true, true)
  } else {
    //while the game is live
    player.body.setVelocityX(0) //keeps player still if not pressing keyboard

    //controls the paddle left and right at px/s
    if(cursors.left.isDown) {
      player.body.setVelocityX(-450) //num is px per second to the left
    } else if (cursors.right.isDown) {
      player.body.setVelocityX(450) //num is px per second to the right
    }
  }

}

// object collision functions
function brickCollision(ball, brick) {
  brick.disableBody(true, true)
  score += 10
  scoreText.setText('score:' + score)

  if (ball.body.velocity.x === 0) {
    num = Math.random()
    if (num >= 0.5) {
      ball.body.setVelocityX(150)
    } else {
      ball.body.setVelocityY(-150)
    }
  }
}

function playerCollision(ball, player) {
  ball.setVelocityY(ball.body.velocity.y - 30)

  let newVelX = Math.abs(ball.body.velocity.x) + 5;

  if (ball.x < player.x) {
    ball.setVelocityX(-newVelX)
  } else {
    ball.setVelocityX(newVelX)
  }
}


//Game Status functions
function gameOver(world){
  return ball.body.y >= world.bounds.height - 40
}

function win(){
  return blueBricks.countActive() + greenBricks.countActive() + redBricks.countActive() + orangeBricks.countActive() === 0
}

