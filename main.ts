namespace SpriteKind {
    export const Enemy_Projectile = SpriteKind.create()
    export const Effect = SpriteKind.create()
}
function x_movement () {
    if (controller.left.isPressed()) {
        shrimp.vx += -8
        facing_right = false
    } else if (controller.right.isPressed()) {
        shrimp.vx += 8
        facing_right = true
    }
    shrimp.vx = shrimp.vx * 0.9
}
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (jump_count < 1) {
        shrimp.vy = -155
        jump_count += 1
    }
})
scene.onOverlapTile(SpriteKind.Player, myTiles.tile3, function (sprite, location) {
    timer.throttle("take damage", 1000, function () {
        take_damage()
    })
})
function animate_lava () {
    for (let value of tiles.getTilesByType(myTiles.tile3)) {
        effect_sprite = sprites.create(img`
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            `, SpriteKind.Effect)
        tiles.placeOnTile(effect_sprite, value)
        effect_sprite.y += -8
        effect_sprite.startEffect(effects.bubbles)
    }
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    timer.throttle("player fire", 300, function () {
        proj = sprites.createProjectileFromSprite(assets.image`shockwave`, shrimp, 0, 0)
        proj.scale = 0.5
        if (facing_right) {
            proj.vx = 200
            animation.runImageAnimation(
            shrimp,
            assets.animation`attack right`,
            100,
            false
            )
        } else {
            proj.vx = -200
            proj.image.flipX()
            animation.runImageAnimation(
            shrimp,
            assets.animation`attack right`,
            100,
            false
            )
        }
    })
})
function load_level () {
    shrimp.setVelocity(0, 0)
    tiles.setCurrentTilemap(levels[level - 1])
    tiles.placeOnRandomTile(shrimp, myTiles.tile2)
    tiles.setTileAt(shrimp.tilemapLocation(), myTiles.tile7)
    for (let value of tiles.getTilesByType(myTiles.tile1)) {
        urchin = sprites.create(assets.image`urchin`, SpriteKind.Enemy)
        tiles.placeOnTile(urchin, value)
        tiles.setTileAt(value, myTiles.transparency16)
    }
    animate_lava()
}
scene.onOverlapTile(SpriteKind.Player, myTiles.tile4, function (sprite, location) {
    if (level == levels.length) {
        game.gameOver(true)
    }
    level += 1
    load_level()
})
scene.onOverlapTile(SpriteKind.Player, myTiles.tile8, function (sprite, location) {
    for (let value of tiles.getTilesByType(myTiles.tile7)) {
        tiles.setTileAt(value, myTiles.transparency16)
    }
    tiles.setTileAt(location, myTiles.tile7)
})
function take_damage () {
    info.changeLifeBy(-1)
    shrimp.setVelocity(0, 0)
    tiles.placeOnRandomTile(shrimp, myTiles.tile7)
}
function urchin_fire (urchin: Sprite) {
    vx = -100
    for (let index = 0; index < 3; index++) {
        vy = -100
        for (let index = 0; index < 3; index++) {
            if (vx != 0 || vy != 0) {
                spine = sprites.createProjectileFromSprite(assets.image`spine`, urchin, vx, vy)
                spine.setKind(SpriteKind.Enemy_Projectile)
                angle = spriteutils.heading(spine)
                transformSprites.rotateSprite(spine, spriteutils.radiansToDegrees(angle))
            }
            vy += 100
        }
        vx += 100
    }
}
function setup () {
    levels = [tilemap`level 1`, tilemap`level 2`, tilemap`level 3`]
    level = 1
    gravity = 8
    jump_count = 1
    facing_right = true
    scene.setBackgroundImage(assets.image`background`)
    scroller.scrollBackgroundWithCamera(scroller.CameraScrollMode.OnlyHorizontal)
    info.setLife(3)
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy_Projectile, function (sprite, otherSprite) {
    timer.throttle("take damage", 1000, function () {
        take_damage()
    })
})
scene.onHitWall(SpriteKind.Projectile, function (sprite, location) {
    if (tiles.tileAtLocationEquals(location, myTiles.tile5)) {
        tiles.setTileAt(location, myTiles.transparency16)
        tiles.setWallAt(location, false)
        effect_sprite = sprites.create(assets.image`breakable rock`, SpriteKind.Effect)
        tiles.placeOnTile(effect_sprite, location)
        sprites.destroy(effect_sprite, effects.disintegrate, 500)
    }
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {
    info.changeScoreBy(10)
    sprites.destroy(sprite)
    sprites.destroy(otherSprite)
})
function y_movement () {
    if (shrimp.isHittingTile(CollisionDirection.Bottom)) {
        jump_count = 0
    }
}
function setup_sprites () {
    shrimp = sprites.create(assets.image`shrimp right`, SpriteKind.Player)
    shrimp.ay = 325
    scene.cameraFollowSprite(shrimp)
    characterAnimations.loopFrames(
    shrimp,
    [assets.image`shrimp right`],
    100,
    characterAnimations.rule(Predicate.MovingRight)
    )
    characterAnimations.loopFrames(
    shrimp,
    [assets.image`shrimp left`],
    100,
    characterAnimations.rule(Predicate.MovingLeft)
    )
}
let gravity = 0
let angle = 0
let spine: Sprite = null
let vy = 0
let vx = 0
let urchin: Sprite = null
let level = 0
let levels: tiles.TileMapData[] = []
let proj: Sprite = null
let effect_sprite: Sprite = null
let jump_count = 0
let facing_right = false
let shrimp: Sprite = null
setup_sprites()
setup()
load_level()
game.onUpdate(function () {
    x_movement()
    y_movement()
})
game.onUpdateInterval(3000, function () {
    for (let value of sprites.allOfKind(SpriteKind.Enemy)) {
        urchin_fire(value)
    }
})
