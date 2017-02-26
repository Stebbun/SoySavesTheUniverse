var game = new Phaser.Game(800, 800, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var music;

var gameStarted;
var score;
var scoreText;
var healthBack;
var healthFore;

var ship;

var fireRate;
var nextFireTime;
var projectiles;
var shipProjectiles;
var soyBottles;
var soyMilks;
var soyBeans;
var isDead;
var pelletPtr;

var enemies;
var enemySpawnTimer;
var enemyCount;
var enemyProjectiles

var cursors;
var spaceKey;

var bosses;
var bossSpawnTimer;
var bossProjectiles;
var bosstype=0;

function preload() {
    game.load.spritesheet('ship', 'assets/Ship.png', 64, 64);
    game.load.image('sky', 'assets/space_background.png');
    //game.load.image('soybean', 'assets/sky.png');
    //game.load.image('soymilk', 'assets/sky.png');
	game.load.image('colShip', 'assets/collisionShip.png');
    game.load.image('soybottle', 'assets/Ship_Projectile.png');
    game.load.audio('soy_song', 'assets/soy_sonata.wav');
	
	game.load.image('health_fore', 'assets/Health_Foreground.png');
    game.load.image('health_back', 'assets/Health_Background.png');

    game.load.image('burger', 'assets/Burger_Enemy.png');
	game.load.image('burger_projectile', 'assets/Burger_Projectile.png');
	
	game.load.image('hotdog', 'assets/HotDog.png');
	game.load.image('hotdog_projectile', 'assets/HotDog_Projectile.png');
	
	game.load.image('boss_1', 'assets/BOSS.png');
}

function create(){
    //initialize variables
    gameStarted = false;
	isDead = false;
    fireRate = 100;
    nextFireTime = 0;
    enemyCount = 0;
	score = 0;

    //add music
    music = game.add.audio('soy_song');
    music.loop = true;
    music.play();

    //enable physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //add background
     background = game.add.sprite(0, 0, 'sky');
     background.scale.setTo(2, 2);

    //add player controlled ship
    ship = game.add.sprite(32, game.world.height - 150, 'ship');
	ship.health = 512;
    collisionShip = game.add.sprite(ship.x + 21,game.world.height - 140, 'colShip');
    game.physics.arcade.enable(collisionShip);
    collisionShip.visible = true;
    //enable physics on ship
    game.physics.arcade.enable(ship);
    
    //ship physics properties
    ship.body.collideWorldBounds = true;
    collisionShip.body.collideWorldBounds = true;

    //ship animations

    makeProjectiles();

    makeKeys();

    makeInitEnemies();

    makeEnemyTimer();
	
	makeScoreLabel();

    makeHealthBar();
}

function makeHealthBar(){
    healthBack = game.add.sprite(0, game.world.height-32, 'health_back');
    healthFore = game.add.sprite(0, game.world.height-32, 'health_fore');
	healthBack.width = game.width;
	healthFore.width = game.width;
}

function makeScoreLabel(){
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#FFF' });
}

function makeInitEnemies(){
    enemies = game.add.group();
    enemies.enableBody = true;
	bosses = game.add.group();

    for(var i = 0; i < 5; i++){
        var baddie = enemies.create(i*160, 0, 'burger');
		baddie.type = 0; // 0 is burger, 1 is hotdog, can be expanded
		baddie.move = 0;
		baddie.health = 5;
		baddie.shoot = 200;
		game.physics.arcade.enable(baddie);
        enemyCount++;
    }
}

function makeEnemyTimer(){
    enemySpawnTimer = game.time.create(false);

    enemySpawnTimer.loop(2000, spawnEnemy, this);

    enemySpawnTimer.start();
	
	bossSpawnTimer = game.time.create(false);
	
	bossSpawnTimer.loop(2000, spawnBoss, this);
	
	bossSpawnTimer.start();
	
}

function spawnEnemy(){
    if(gameStarted && enemyCount < 10){
		if (Math.floor(Math.random()*2)==0){
			var baddie = enemies.create( (Math.random() *5) *160, 0, 'burger');
			baddie.type = 0;
		} else if (score>=2000){
			var baddie = enemies.create( (Math.random() *5) *160, 0, 'hotdog'); 
			baddie.type = 1;
		} else {
			var baddie = enemies.create( (Math.random() *5) *160, 0, 'burger');
			baddie.type = 0;
		}
		baddie.move = 0;
		baddie.health = 5;
		baddie.shoot = 50;
        enemyCount++;
		game.physics.arcade.enable(baddie);
    }
}

function spawnBoss(){
	if (score >= 1000 && score <= 2000){
		bosstype = 1;
	}
	if (gameStarted && bosstype===1){
		var boss = bosses.create( (Math.random() *5) *160, 0, 'boss_1');
		boss.health = 100;
		boss.shoot = 30;
		game.physics.arcade.enable(boss);
		bosstype = 0;
	}
}


function makeProjectiles(){
	
	enemyProjectiles = game.add.group();
	enemyProjectiles.enableBody = true;
	enemyProjectiles.phyicsBodyType = Phaser.Physics.ARCADE;
	
	enemyProjectiles.createMultiple(10,'burger_projectile');
	enemyProjectiles.createMultiple(10,'hotdog_projectile');
	enemyProjectiles.setAll('checkWorldBounds',true);
	enemyProjectiles.setAll('outOfBoundsKill',true);
	
	bossProjectiles = game.add.group();
	bossProjectiles.enableBody = true;
	bossProjectiles.physicsBodyType = Phaser.Physics.ARCADE;
	
	bossProjectiles.createMultiple(10, 'burger_projectile');
	bossProjectiles.createMultiple(10, 'hotdog_projectile');
	bossProjectiles.setAll('checkWorldBounds', true);
	bossProjectiles.setAll('outOfBoundsKill', true);

    soyBottles = game.add.group();
    soyBottles.enableBody = true;
    soyBottles.physicsBodyType = Phaser.Physics.ARCADE;

    soyBottles.createMultiple(50, 'soybottle');
    soyBottles.setAll('checkWorldBounds', true);
    soyBottles.setAll('outOfBoundsKill', true);

    pelletPtr = soyBottles;
}

function makeKeys(){
    // cursor controls
    cursors = game.input.keyboard.createCursorKeys();

    //spacebar
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    //initialize to start game
    spaceKey.onDown.add(startGame, this);
}

function startGame(){
    gameStarted = true;
    game.input.onDown.remove(startGame, spaceKey);
}


function update(){
    game.physics.arcade.overlap(soyBottles, enemies, damageEnemy,null,this);
    //game.physics.arcade.collide(collisionShip,enemies);
    //damagePlayer(collisionShip,enemies);
    game.physics.arcade.overlap(collisionShip, enemies, damagePlayer,null,this);
	game.physics.arcade.overlap(collisionShip, enemyProjectiles, damagePlayer, null, this);
    collisionShip.x = ship.x+21;
    collisionShip.y = ship.y+10;
    if(gameStarted){
        gameplay();
    }
}
function damagePlayer(collisionShip,enemy){
    ship.health = ship.health - (512/5)
	healthFore.width = game.width *(ship.health / 512);
    enemy.kill();
    if(ship.health <= 3){
        ship.kill();
        collisionShip.kill();
		isDead = true;
    }
}
function damageEnemy(soyBottle,enemy){
    soyBottle.kill();
    enemy.health -= 1;
    if(enemy.health == 0){
        enemy.kill();
		enemies.remove(enemy);
		score += 100;
        scoreText.text = 'Score: ' + score;
        enemyCount--;
    }
    
}


function gameplay(){
    ship.body.velocity.x = 0;
    ship.body.velocity.y = 0;

    controlHandler();

    enemyMovementHandler();
	
	bossMovementHandler();
}

function enemyMovementHandler(){
    enemies.forEach(function(enemy){
		if(enemy.move!==0){
			enemy.move--;
			if (enemy.body.x<100){
				enemy.body.velocity.x = Math.random()*100;
			} else if (enemy.body.x>700){
				enemy.body.velocity.x = Math.random()*-100;
			}
			if (enemy.body.y<100){
				enemy.body.velocity.y = Math.random()*100;
			} else if (enemy.body.y>300){
				enemy.body.velocity.y = Math.random()*-100;
			}
		} else {
			enemy.body.velocity.x = Math.random()*200-100;
			enemy.body.velocity.y = Math.random()*200-100;
			enemy.move = Math.floor(Math.random()*50+20);
		}
		enemy.shoot--;
		if (enemy.shoot==0){
			enemyfire(enemy);
			enemy.shoot = 250;
		}
    }, this);
}

function bossMovementHandler(){
	bosses.forEach(function(boss){
		if (boss.body.x<100){
			boss.body.velocity.x = 200;
		} else if (boss.body.x > 700) {
			boss.body.velocity.x = -200;
		}
	}, this);
}
function controlHandler(){
    //remove this comment after adding animations
    if(cursors.left.isDown){
        ship.body.velocity.x = -300;
    }
    else if(cursors.right.isDown){
        ship.body.velocity.x = 300;
    }
    else if(cursors.up.isDown){
        ship.body.velocity.y = -300;
    }
    else if(cursors.down.isDown){
        ship.body.velocity.y = 300;
    }
    else{
        // idle
        ship.animations.stop();
        ship.frame = 0;
    }

    if(spaceKey.isDown){
		if(!isDead){
			fire();
		}
		ship.frame = 6;
    }
}

function fire(){
    if(game.time.now > nextFireTime && pelletPtr.countDead() > 0){
        nextFireTime = game.time.now + fireRate;
        var pellet = pelletPtr.getFirstDead();
        pellet.reset(ship.x+16.5, ship.y);
        pellet.body.velocity.y = -350;
    }
}

function enemyfire(enemy){
	if (enemy.type === 0){
		var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'burger_projectile');
		minifood.body.velocity.y = 100;
	} else if (enemy.type === 1){
		var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'hotdog_projectile');
		minifood.body.velocity.x = (collisionShip.x-enemy.body.x)*.9;
		minifood.body.velocity.y = (collisionShip.y-enemy.body.y)*.9;
	}
	
}