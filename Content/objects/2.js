{"assets":[],"key":"2","pieces":[],"pieceLayouts":[],"projectiles":[],"initScript":"this.state = {\r\n\txsp: 0.0,\r\n\tysp: 0.0,\r\n\tfacing: 0,\r\n};","tickScript":"if(this.state.facing){\n\tthis.state.facing=0;\n\tthis.state.xsp=10;\n}","collideScript":"this.die();","hurtScript":"sonic.hit();","oldKey":""}