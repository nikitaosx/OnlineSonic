﻿function TileChunk(tilePieces) {
    this.tilePieces = tilePieces;
    this.hLayer = [[]];
    this.sprites = [];
    this.getTilePiece = function (x, y) {
        return this.tilePieces[_H.floor((x / 16))][_H.floor((y / 16))];
    };
    this.getBlock = function (x, y) {
        return sonicManager.SonicLevel.Blocks[this.tilePieces[_H.floor((x / 16))][_H.floor((y / 16))].Block];
    };
    this.isOnlyBackground = undefined;
    this.empty = undefined;
    this.onlyBackground = function () {
        if (this.isOnlyBackground == false) return false;
        if (this.isOnlyBackground == true) return true;
        for (var i = 0; i < this.tilePieces.length; i++) {
            for (var j = 0; j < this.tilePieces[i].length; j++) {
                var r = this.tilePieces[i][j];
                var pm = sonicManager.SonicLevel.Blocks[r.Block];
                if (pm) {
                    if (!pm.onlyBackground()) {
                        return this.isOnlyBackground = false;
                    }
                }
            }
        }
        this.isOnlyBackground = true;
        return true;
    };
    this.isEmpty = function () {
        if (this.empty == false) return false;
        if (this.empty == true) return true;
        for (var i = 0; i < this.tilePieces.length; i++) {
            for (var j = 0; j < this.tilePieces[i].length; j++) {
                var r = this.tilePieces[i][j];
                if (r.Block != 0) {
                    return this.empty = false;
                }
            }
        }
        this.empty = true;
        return true;
    };
    this.lastAnimatedFrame = 0;
    this.lastAnimatedIndex = 0;
    this.animatedTick = function () {
        if (this.lastAnimatedFrame == undefined) {
            this.lastAnimatedFrame = 0;
            this.lastAnimatedIndex = 0;
        }

        if (this.animated.Frames[this.lastAnimatedIndex].Ticks == 0 ||
            (sonicManager.drawTickCount - this.lastAnimatedFrame) >= ((this.animated.AutomatedTiming > 0)
                ? this.animated.AutomatedTiming
                : this.animated.Frames[this.lastAnimatedIndex].Ticks)) {
            this.lastAnimatedFrame = sonicManager.drawTickCount;
            this.lastAnimatedIndex = (this.lastAnimatedIndex + 1) % this.animated.Frames.length;
        }
    };
    this.draw = function (canvas, position, scale, layer, animationFrame, bounds) {


        if (animationFrame == undefined && this.animated != undefined) {

            animationFrame = this.lastAnimatedIndex;
        }

        var fd;
        if (false && (fd = sonicManager.SpriteCache.tileChunks[layer + " " + this.index + " " + scale.y + " " + scale.x + " " + ((animationFrame != undefined) ? animationFrame : '-')])) {
            if (fd == 1) return false;
            canvas.drawImage(fd, position.x, position.y);

            /*  if (this.animated) {

            for (var i = 0; i < this.tilePieces.length; i++) {
            for (var j = 0; j < this.tilePieces[i].length; j++) {
            var r = this.tilePieces[i][j];
            var pm = sonicManager.SonicLevel.Blocks[r.Block];
            if (pm) {
            pm.draw(canvas, { x: position.x + i * 16 * scale.x, y: position.y + j * 16 * scale.y }, scale, layer, r.XFlip, r.YFlip, true, animationFrame);
            }
            }
            }
            }*/
        } else {
            _H.save(canvas);

            for (var i = 0; i < this.tilePieces.length; i++) {
                for (var j = 0; j < this.tilePieces[i].length; j++) {
                    var r = this.tilePieces[i][j];
                    var pm = sonicManager.SonicLevel.Blocks[r.Block];
                    if (pm) {
                        TileChunk.__position.x = position.x + i * 16 * scale.x;
                        TileChunk.__position.y = position.y + j * 16 * scale.y;

                        pm.draw(canvas, TileChunk.__position, scale, layer, r.XFlip, r.YFlip, this.animated, animationFrame, bounds);
                        //canvas.strokeStyle = "#FFF";
                        //canvas.strokeRect(position.x + i * 16 * scale.x, position.y + j * 16 * scale.y, scale.x * 16, scale.y * 16);
                    }
                }
            }
            _H.restore(canvas);
        }

        return true;
    };

}
TileChunk.__position = { x: 0, y: 0 };
