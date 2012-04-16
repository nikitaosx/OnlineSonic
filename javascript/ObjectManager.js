﻿

function ObjectManager(sonicManager) {

    this.sonicManager = sonicManager;
    window.objectManager = this;
    this.metaObjectFrameworks = [];
    this.objectFrameworks = [];

    this.init = function () {

    };

    this.extendObject = function (d) {
        d.oldKey = name;
        for (var asset in d.assets) {
            d.assets[asset] = _H.extend(new LevelObjectAsset(""), d.assets[asset]);
            for (var frame in d.assets[asset].frames) {
                d.assets[asset].frames[frame] = _H.extend(new LevelObjectAssetFrame(0), d.assets[asset].frames[frame]);
            }
        }
        for (var piece in d.pieces) {
            d.pieces[piece] = _H.extend(new LevelObjectPiece(""), d.pieces[piece]);
        }
        for (var pieceLayout in d.pieceLayouts) {
            d.pieceLayouts[pieceLayout] = _H.extend(new LevelObjectPieceLayout(""), d.pieceLayouts[pieceLayout]);
            for (var piece in d.pieceLayouts[pieceLayout].pieces) {
                d.pieceLayouts[pieceLayout].pieces[piece] = _H.extend(new LevelObjectPieceLayoutPiece(0), d.pieceLayouts[pieceLayout].pieces[piece]);
            }
        }
        for (var projectile in d.projectiles) {
            d.projectiles[projectile] = _H.extend(new LevelObjectProjectile(""), d.projectiles[projectile]);
        }
        return d;
    };
}

function LevelObject(key) {
    this.assets = [];
    this.key = key ? key : "";
    this.pieces = [];
    this.pieceLayouts = [];
    this.projectiles = [];
    this.initScript = "this.state = {\r\n\txsp: 0.0,\r\n\tysp: 0.0,\r\n\tfacing: false,\r\n};";
    this.tickScript = "if(this.state.facing){\r\n\tthis.state.facing=false;\r\n\tthis.state.xsp=10;\r\n}";
    this.collideScript = "this.die();";
    this.hurtScript = "sonic.hit();";
    this.mainPieceLayout = function () {
        return this.pieceLayouts[0];
    };

    this.evalMe = function (js) {
        if (!this[js + "_last"]) {
            this[js + "_last"] = "";
        }
        if (this[js + "_last"] != this[js]) {
            this[js + "Compiled"] = undefined;
        }

        this[js + "_last"] = this[js];


        if (!this[js + "Compiled"]) {
            try {
                this[js + "Compiled"] = eval("(function(object,level,sonic){" + this[js] + "});");
            } catch (EJ) {

            }
        }
        return this[js + "Compiled"];
    };

    this.init = function (object, level, sonic) {
        object.reset();
        this.evalMe("initScript").apply(object, [object, level, sonic]);
    };
    this.tick = function (object, level, sonic) {
        if (object.lastDrawTick != sonicManager.tickCount - 1)
            this.init(object, level, sonic);

        object.lastDrawTick = sonicManager.tickCount;

        this.evalMe("tickScript").apply(object, [object, level, sonic]);

        object.xsp = object.state.xsp;
        object.ysp = object.state.ysp;

        object.x += object.xsp;
        object.y += object.ysp;

    };
    this.onCollide = function (object, level, sonic) {
        return this.evalMe("collideScript").apply(object, [object, level, sonic]);
    };
    this.onHurtSonic = function (object, level, sonic) {
        return this.evalMe("hurtScript").apply(object, [object, level, sonic]);
    };

}

function LevelObjectAsset(name) {
    this.frames = [];
    this.name = name ? name : "";
}

function LevelObjectAssetFrame(name) {
    this.offsetX = 0;
    this.width = 0;
    this.height = 0;
    this.offsetY = 0;
    this.hurtSonicMap = [];
    this.collisionMap = [];
    for (var i = 0; i < 100; i++) {
        this.collisionMap[i] = [];
        this.hurtSonicMap[i] = [];

    }

    this.uploadImage = function (sprite) {
        this.width = sprite.width;
        this.height = sprite.height;
        this.offsetX = _H.floor(sprite.width / 2);
        this.offsetY = _H.floor(sprite.height / 2);

        var ca = _H.defaultCanvas(this.width, this.height);

        ca.context.drawImage(sprite, 0, 0);
        var imgd = ca.context.getImageData(0, 0, this.width, this.height);
        var pix = imgd.data;

        var palette = {};
        var paletteLength = 0;

        for (var x = 0; x < this.width; x++) {
            this.colorMap[x] = [];
            for (var y = 0; y < this.height; y++) {
                var pl = _H.colorFromData(pix, (x * 4) + y * this.width * 4);
                var ind = 0;
                if (palette[pl] != undefined) {
                    ind = palette[pl];
                } else {
                    ind = paletteLength;
                    palette[pl] = paletteLength;
                    paletteLength++;
                }
                this.colorMap[x][y] = ind;
            }
        }
        this.palette = [];
        var ind = 0;
        for (var p in palette) {
            this.palette[ind++] = p.replace("#", "");
        }

    };


    this.colorMap = [];
    this.palette = [];
    this.name = name ? name : "";

    this.drawSimple = function (canvas, pos, width, height, xflip, yflip) {

        canvas.save();
        canvas.translate(pos.x, pos.y);


        if (xflip) {
            if (yflip) {
                canvas.translate(width, height);
                canvas.scale(-1, -1);
            } else {
                canvas.translate(width, 0);
                canvas.scale(-1, 1);
            }
        } else {
            if (yflip) {
                canvas.translate(0, height);
                canvas.scale(1, -1);
            } else {

            }
        }

        canvas.scale((width / this.width), (height / this.height));


        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var ex = x;
                var ey = y;
                var color = this.palette[this.colorMap[ex][ey]];
                if (canvas.fillStyle != "#" + color)
                    canvas.fillStyle = "#" + color;

                canvas.fillRect(ex, ey, 1, 1);

            }
        }
        canvas.restore();

    };

    this.image = [];
    this.getCache = function (size, xflip, yflip, showOutline, showCollideMap, showHurtMap) {

        //return false;
        return this.image[((xflip + 2) * 13) ^ (size.width * 47) ^ ((yflip + 2) * 71) ^ ((showOutline + 2) * 7) ^ ((showCollideMap + 2) * 89) ^ ((showHurtMap + 2) * 79)];
    };
    this.clearCache = function () {
        this.image = [];
    };
    this.setCache = function (image, size, xflip, yflip, showOutline, showCollideMap, showHurtMap) {
        //   return;
        this.image[((xflip + 2) * 13) ^ (size.width * 47) ^ ((yflip + 2) * 71) ^ ((showOutline + 2) * 7) ^ ((showCollideMap + 2) * 89) ^ ((showHurtMap + 2) * 79)] = image;
    };

    this.drawUI = function (_canvas, pos, size, showOutline, showCollideMap, showHurtMap, showOffset, xflip, yflip) {


        var fd = this.getCache(size, xflip, yflip, showOutline, showCollideMap, showHurtMap);

        if (!fd) {

            var mj = _H.defaultCanvas(size.width, size.height);
            var canvas = mj.context;

            canvas.save();

            canvas.strokeStyle = "#000000";
            canvas.lineWidth = 1;


            if (xflip) {
                if (yflip) {
                    canvas.translate(size.width, size.height);
                    canvas.scale(-1, -1);
                } else {
                    canvas.translate(size.width, 0);
                    canvas.scale(-1, 1);
                }
            } else {
                if (yflip) {
                    canvas.translate(0, size.height);
                    canvas.scale(1, -1);
                } else {

                }
            }


            canvas.scale(size.width / this.width, size.height / this.height);
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    var ex = x;
                    var ey = y;
                    var color = this.palette[this.colorMap[ex][ey]];
                    //  var negative = _H.negateColor(color);
                    if (canvas.fillStyle != "#" + color)
                        canvas.fillStyle = "#" + color;

                    //if (canvas.strokeStyle != "#" + negative)
                    //    canvas.strokeStyle = "#" + negative; 


                    canvas.fillRect(ex, ey, 1, 1);
                    //  if (showOutline)
                    //    canvas.strokeRect(ex, ey, 1, 1);

                    if (showCollideMap) {
                        if (this.collisionMap[ex][ey]) {
                            canvas.fillStyle = "rgba(30,34,255,0.6)";
                            canvas.fillRect(ex, ey, 1, 1);
                        }
                    }

                    if (showHurtMap) {
                        if (this.hurtSonicMap[ex][ey]) {
                            canvas.fillStyle = "rgba(211,12,55,0.6)";
                            canvas.fillRect(ex, ey, 1, 1);
                        }

                    }
                }
            }
            if (showOffset) {

                canvas.beginPath();
                canvas.moveTo(this.offsetX, 0);
                canvas.lineTo(this.offsetX, this.height);
                canvas.lineWidth = 1;
                canvas.strokeStyle = "#000000";
                canvas.stroke();

                canvas.beginPath();
                canvas.moveTo(0, this.offsetY);
                canvas.lineTo(this.width, this.offsetY);
                canvas.lineWidth = 1;
                canvas.strokeStyle = "#000000";
                canvas.stroke();
            }
            canvas.restore();
            fd = mj.canvas;
            this.setCache(mj.canvas, size, xflip, yflip, showOutline, showCollideMap, showHurtMap)
        }

        _canvas.drawImage(fd, pos.x, pos.y);

    };
    this.draw = function (canvas, pos, scale) {

    };
}

function LevelObjectPiece(name) {
    this.assetIndex = 0;
    this.frameIndex = 0;
    this.collided = false;
    this.xflip = false;
    this.yflip = false;
    this.visible = true;
    this.name = name ? name : "";

}

function LevelObjectPieceLayout(name) {
    this.width = 350;
    this.height = 280;
    this.pieces = [];

    this.name = name ? name : "";


    this.drawUI = function (canvas, pos, scale, showOutline, showImages, selectedPieceIndex, zeroPosition) {
        canvas.save();
        canvas.strokeStyle = "#000000";
        canvas.lineWidth = 2;

        canvas.fillStyle = "#FFFFFF";
        canvas.fillRect(pos.x, pos.y, this.width, this.height);

        canvas.beginPath();
        canvas.rect(pos.x, pos.y, this.width, this.height);
        canvas.clip();
        canvas.closePath();


        canvas.translate(zeroPosition.x, zeroPosition.y);
//        canvas.scale(3, 3);

        canvas.beginPath();
        canvas.moveTo(pos.x + -250, pos.y + 0);
        canvas.lineTo(pos.x + 250, pos.y + 0);
        canvas.closePath();
        canvas.stroke();

        canvas.beginPath();
        canvas.moveTo(pos.x + 0, pos.y + -250);
        canvas.lineTo(pos.x + 0, pos.y + 250);
        canvas.closePath();
        canvas.stroke();


        for (var i = 1; i < this.pieces.length; i++) {
            var j = this.pieces[i];

            canvas.beginPath();
            canvas.moveTo(pos.x + j.x, pos.y + j.y);
            canvas.lineTo(pos.x + this.pieces[i - 1].x, pos.y + this.pieces[i - 1].y);
            canvas.stroke();

        }


        var drawRadial;
        for (var i = 0; i < this.pieces.length; i++) {
            var j = this.pieces[i];
            if (showImages) {
                var piece = sonicManager.uiManager.objectFrameworkArea.objectFramework.pieces[j.pieceIndex];
                var asset = sonicManager.uiManager.objectFrameworkArea.objectFramework.assets[piece.assetIndex];
                if (asset.frames.length > 0) {
                    var frm = asset.frames[j.frameIndex];
                    drawRadial = sonicManager.mainCanvas.createRadialGradient(0, 0, 0, 10, 10, 50);
                    drawRadial.addColorStop(0, 'white');
                    if (selectedPieceIndex == i) {
                        drawRadial.addColorStop(1, 'yellow');
                    } else {
                        drawRadial.addColorStop(1, 'red');
                    }
                    var borderSize = 3;
                    canvas.fillStyle = drawRadial;
                    //   canvas.fillRect(pos.x + j.x - frm.offsetX - borderSize, pos.y + j.y - frm.offsetY - borderSize, frm.width + borderSize * 2, frm.height + borderSize*2);
                    frm.drawUI(canvas, { x: pos.x + j.x - frm.offsetX, y: pos.y + j.y - frm.offsetY }, { width: frm.width, height: frm.height }, false, true, true, false, piece.xflip, piece.yflip);
                }
            } else {
                drawRadial = sonicManager.mainCanvas.createRadialGradient(0, 0, 0, 10, 10, 50);
                drawRadial.addColorStop(0, 'white');
                if (selectedPieceIndex == i) {
                    drawRadial.addColorStop(1, 'yellow');
                } else {
                    drawRadial.addColorStop(1, 'red');
                }

                canvas.fillStyle = drawRadial;
                canvas.beginPath();
                canvas.arc(pos.x + j.x, pos.y + j.y, 10, 0, Math.PI * 2, true);
                canvas.closePath();
                canvas.fill();

            }
        }
        canvas.restore();
    };



    this.draw = function (canvas, x, y, scale, framework, showHeightMap) {



        for (var i = 0; i < this.pieces.length; i++) {
            var j = this.pieces[i];
            if (!j.visible) continue;
            var piece = framework.pieces[j.pieceIndex];
            var asset = framework.assets[piece.assetIndex];
            if (asset.frames.length > 0) {
                var frm = asset.frames[j.frameIndex];
                frm.drawUI(canvas, { x: (x + j.x) - (frm.offsetX * scale.x), y: (y + j.y) - (frm.offsetY * scale.y) }, { width: frm.width * scale.x, height: frm.height * scale.y }, false, showHeightMap, showHeightMap, false, piece.xflip, piece.yflip);
            }

        }

    };
}

function LevelObjectPieceLayoutPiece(pieceIndex) {
    this.pieceIndex = pieceIndex;
    this.assetIndex = 0;
    this.frameIndex = 0;
    this.x = 0;
    this.y = 0;
    this.visible = true;
}
var broken = _H.loadSprite("assets/Sprites/broken.png");


function LevelObjectInfo(o) {
    this.o = o;
    this.x = o.X;
    this.y = o.Y;
    this.xsp = 0;
    this.ysp = 0;
    this.xflip = o.XFlip;
    this.yflip = o.YFlip;
    this.subdata = o.SubType;
    this.key = o.ID;
    this.ObjectData = null;

    this.upperNibble = this.subdata >> 4;
    this.lowerNibble = this.subdata & 0xf;

    this.draw = function (canvas, x, y, scale, showHeightMap) {
        if (this.ObjectData.pieceLayouts.length == 0) {
            canvas.drawImage(broken, _H.floor((x - broken.width / 2)), _H.floor((y - broken.height / 2)), broken.width * scale.x, broken.height * scale.y);
            return;
        }

        this.ObjectData.mainPieceLayout().draw(canvas, x, y, scale, this.ObjectData, showHeightMap);
    };
    this.reset = function () {
        this.x = this.o.X;
        this.y = this.o.Y;
        this.xsp = 0;
        this.ysp = 0;

        this.xflip = this.o.XFlip;
        this.yflip = this.o.YFlip;

        this.subdata = this.o.SubType;
        this.upperNibble = this.subdata >> 4;
        this.lowerNibble = this.subdata & 0xf;
    };


    this.collides = function (sonic) {
        return this.collision(sonic, false);
    };

    this.hurtsSonic = function (sonic) {
        return this.collision(sonic, true);
    };

    this.collision = function (sonic, isHurtMap) {
        if (this.ObjectData.pieceLayouts.length == 0) return false;
        var pcs = this.ObjectData.mainPieceLayout().pieces;
        for (var pieceIndex = 0; pieceIndex < pcs.length; pieceIndex++) {
            var j = pcs[pieceIndex];
            var piece = this.ObjectData.pieces[j.pieceIndex];
            var asset = this.ObjectData.assets[piece.assetIndex];
            if (asset.frames.length > 0) {
                var frm = asset.frames[j.frameIndex];
                var map = isHurtMap ? frm.hurtSonicMap : frm.collisionMap;
                if (twoDArray(map, (sonic.x - this.x + frm.offsetX + j.x), (sonic.y - this.y + frm.offsetY + j.y)) == true) {
                    return true;
                }
            }
        }

        return false;
    };

    function twoDArray(map, x, y) {
        if (!map)
            return false;
        if (!map[x])
            return false;
        return map[x][y];
    }

    this.collide = function (sonic) {
        return this.ObjectData.onCollide(this, sonicManager.SonicLevel, sonicManager.sonicToon);
    };
    this.hurtSonic = function (sonic) {
        return this.ObjectData.onHurtSonic(this, sonicManager.SonicLevel, sonicManager.sonicToon);
    };

}

function LevelObjectProjectile(name) {
    this.x = 0;
    this.y = 0;
    this.xsp = 0;
    this.ysp = 0;
    this.xflip = 0;
    this.yflip = 0;
    this.assetIndex = 0;
    this.frameIndex = 0;
    this.name = name ? name : "";
    this.init = function (level, sonic) {
    };
    this.tick = function (level, sonic) {
    };
    this.onCollide = function (level, sonic) {
    };
    this.onHurtSonic = function (level, sonic, sensor) {
    };
}

function LevelEvent() {
    this.triggered = false;
    this.state = {};
    this.tick = function (level, sonic) {
    };
    this.trigger = function (state) {
        this.state = state;
    };
}