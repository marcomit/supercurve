/*************************************
 *            SuperCurve    
 *              v1.2
 * 
 *      Created: Norbert Mereg
 *  E-mail: mereg.norbert@gmail.com
 * **********************************/

function load()
{
    game_state = STATE_MAIN_MENU;
    
	context.fillStyle = "white";
	context.font = "bold 22pt Verdana";
    context.fillText("Loading...",400,245);
    
	lastDrawTime = new Date().getTime();
    ball = new Ball();   
    comp = new Computer();
    
    img_bg = new Image();
    img_main = new Image();
    img_main.src = "images/supercurve_main.png";

    img_sound_on = new Image();
    img_sound_on.src = "images/sound_on.png";

    img_sound_off = new Image();
    img_sound_off.src = "images/sound_off.png";

    img_ball = new Image();
    img_ball.src = "images/ball.png";

    img_ball_red = new Image();
    img_ball_red.src = "images/ball_red.png";
    
    img_ballshadow = new Image();
    img_ballshadow.src = "images/ball_shadow.png";

    sound_wallhit = document.getElementById('wall_hit');
    sound_wallhit.volume = 1.0;

    sound_padhit = document.getElementById('pad_hit');
    sound_padhit.volume = 1.0;    

    sound_padhit2 = document.getElementById('pad_hit2');
    sound_padhit2.volume = 1.0;    

    sound_applause = document.getElementById('applause');
    sound_applause.volume = 0.6;    

    sound_disappoint = document.getElementById('disappoint');
    sound_disappoint.volume = 0.3;    

    preLoadImages(["images/supercurve_main.png", "images/ball.png", "images/sound_off.png", "images/sound_on.png", "images/ball.png", "images/ball_red.png"], function() {
        mainTimer = setInterval(move, 1000/40);        
        draw();
    });
}

function draw()
{
    //Eltelt időből FPS számítás
    var now = new Date().getTime();
    if (lastDrawTime)
    {
    	var dt = now - lastDrawTime;
    	fps = 0.1*1000/dt + 0.9*fps;    
    }
    lastDrawTime = now;
    
    clearCanvas(false);
    
    if (game_state == STATE_SUSPEND || game_state == STATE_RUN)
    {
        drawPad(comp.padX, comp.padY, DEPTH, false);
        ball.draw();
    
        padPos = {x: mouse.x - LEFT, y: mouse.y - TOP};
        drawPad(padPos.x, padPos.y, 0, true);
    }
    drawInfobar();
    drawStateInfo();
    drawLives();
    
    window.requestAnimFrame(draw);
}

function move() {
    //Eltelt időből FPS számítás
    var now = new Date().getTime();
    if (lastMoveTime)
    {
        var dt = now - lastMoveTime;
    	moveFPS = 0.1*1000/dt + 0.9*moveFPS;    
    }
    lastMoveTime = now;


    if (game_state == STATE_NEXT_LEVEL)
    {
        if (Math.ceil(((new Date().getTime())-lastStateTime)/1000) > 2)
            game_state = STATE_SUSPEND;
    }
    if (mouse.x < LEFT + PAD_WIDTH / 2) mouse.x = LEFT + PAD_WIDTH / 2;
    if (mouse.y < TOP + PAD_HEIGHT / 2) mouse.y = TOP + PAD_HEIGHT / 2;
    if (mouse.x > LEFT + WIDTH - PAD_WIDTH / 2) mouse.x = LEFT + WIDTH - PAD_WIDTH / 2;
    if (mouse.y > TOP + HEIGHT - PAD_HEIGHT / 2) mouse.y = TOP + HEIGHT - PAD_HEIGHT / 2;
    
    padSpeedX = (mouse.x - oldMouse.x);
    padSpeedY = (mouse.y - oldMouse.y);

    oldMouse.x = mouse.x;
    oldMouse.y = mouse.y;
    

    ball.move();
    comp.tick();
}


function clearCanvas(force) {
    if (force || !$(img_bg).attr('src')) 
    {
        context.globalAlpha = 1;
        context.drawImage(img_main, 0, 0);
    
        context.strokeStyle = "#59c6fe";
        context.shadowColor = "fff";
        context.shadowBlur = 8;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;        
        context.lineWidth = 2;
        var drawX, drawY;
        for(var z = 0; z <= DEPTH; z += 10)
        {
            drawX = convert2dto3d(WIDTH, z);
            drawY = convert2dto3d(HEIGHT, z);
            drawLeft = (WIDTH - drawX) / 2;
            drawTop = (HEIGHT - drawY) / 2;
            context.globalAlpha = getAlpha(z);
            
            context.strokeRect(LEFT + drawLeft, TOP + drawTop, drawX, drawY);
            context.globalAlpha = 1;
        }
        context.lineWidth = 1;
        
        context.beginPath();
        context.moveTo(LEFT, TOP);
        context.lineTo(drawLeft + LEFT, drawTop + TOP);
        context.closePath();
        context.stroke();
    
        context.beginPath();
        context.moveTo(LEFT + WIDTH, TOP);
        context.lineTo(WIDTH - drawLeft + LEFT, drawTop + TOP);
        context.closePath();
        context.stroke();
    
        context.beginPath();
        context.moveTo(LEFT, TOP + HEIGHT);
        context.lineTo(drawLeft + LEFT, HEIGHT - drawTop + TOP);
        context.closePath();
        context.stroke();
    
        context.beginPath();
        context.moveTo(LEFT + WIDTH, TOP + HEIGHT);
        context.lineTo(WIDTH - drawLeft + LEFT, HEIGHT - drawTop + TOP);
        context.closePath();
        context.stroke();
        
        context.font = "18px tektron, Comic Sans MS, Verdana";
        context.textAlign = "left";
        context.fillStyle = "#e3f5ff";
        context.shadowColor = "white";
        context.shadowBlur = 6;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.fillText('Computer', LEFT , TOP + HEIGHT + 20); 
        context.textAlign = "right";
        context.fillText('Player', LEFT + WIDTH, TOP + HEIGHT + 20); 
        
        context.shadowBlur = 0;

        $(img_bg).attr('src', canvas.toDataURL());
    } else {
        context.drawImage(img_bg, 0, 0);
    }
}

function drawInfobar() {
    context.font = "35px tektron, Comic Sans MS, Verdana";
    context.textAlign = "center";
    context.fillStyle = "#e3f5ff";
    context.shadowColor = "white";
    context.shadowBlur = 6;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    //draw level
    if (currentLevel)
        context.fillText(pad(currentLevel.level, 2), 704, 130); 
    else
        context.fillText('--', 704, 130); 
    //draw score
    if (SCORE - last_score > 100) 
        last_score += 10;
    else if (last_score < SCORE) last_score += 5;
    context.fillText(pad(last_score, 5), 704, 230); 
    //draw time
    if (game_state == STATE_RUN)
    {
        elapsed_time = Math.ceil(((new Date().getTime())-START_TIME)/1000);
    }
    
    context.fillText(timeToStr(), 704, 335); 

    //draw bonus text
    if (bonus_message !== "")
    {
        context.fillText(bonus_message, 300, 460);     
    }
    
    context.shadowBlur = 0;

    if (mute == 1)
        context.drawImage(img_sound_off, 740, 453);
    else
        context.drawImage(img_sound_on, 740, 450);

    //FPS kiírása
    context.font = "10px Verdana";
    context.textAlign = "left";
    context.fillStyle = "#416e8d";
    context.shadowBlur = 0;
    context.fillText("FPS: " + Math.ceil(fps) + ', ' + Math.ceil(moveFPS), 10, 12);
}

function drawOverlay() {
    context.globalAlpha = 0.5;
    context.fillStyle = "#000";
    context.fillRect(0, 0, 800, 500);
    context.globalAlpha = 1;
}

function drawStateInfo() {
    var blur = 0;
    switch(game_state) {
        case STATE_MAIN_MENU: {
            drawOverlay();            
            context.font = "45px tektron, Comic Sans MS, Verdana";
            context.textAlign = "center";
            context.fillStyle = "#e3f5ff";
            context.shadowColor = "white";
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fillText('Main menu', 280, 120); 

            if (hover_button == 1)
                context.fillStyle = "#59c6fe";
            else
                context.fillStyle = "#325F8C";
            context.beginPath();
            roundedRect(130, 140, 300, 40, 5);
            context.closePath();
            context.fill();
            
            context.fillStyle = "#e3f5ff";
            context.font = "30px tektron, Comic Sans MS, Verdana";
            context.fillText('Single player', 280, 170); 

            if (hover_button == 2)
                context.fillStyle = "#59c6fe";
            else
                context.fillStyle = "#325F8C";
            context.beginPath();
            roundedRect(130, 200, 300, 40, 5);
            context.closePath();
            context.fill();
            
            context.fillStyle = "#e3f5ff";
            context.font = "30px tektron, Comic Sans MS, Verdana";
            context.fillText('Multi player', 280, 230); 

            if (hover_button == 3)
                context.fillStyle = "#59c6fe";
            else
                context.fillStyle = "#325F8C";
            context.beginPath();
            roundedRect(130, 260, 300, 40, 5);
            context.closePath();
            context.fill();
            
            context.fillStyle = "#e3f5ff";
            context.font = "30px tektron, Comic Sans MS, Verdana";
            context.fillText('High scores', 280, 290); 

            break;
        }
        case STATE_GAME_OVER: {
            drawOverlay();            
            context.font = "45px tektron, Comic Sans MS, Verdana";
            context.textAlign = "center";
            context.fillStyle = "#e3f5ff";
            context.shadowColor = "white";
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fillText('Game over', LEFT + WIDTH/2, 210); 

            context.font = "30px tektron, Comic Sans MS, Verdana";
            context.fillText(SCORE + ' points', LEFT + WIDTH/2, 280); 
            
            break;
        }
        case STATE_HIGHSCORES: {
            drawOverlay();            
            context.font = "45px tektron, Comic Sans MS, Verdana";
            context.textAlign = "center";
            context.fillStyle = "#e3f5ff";
            context.shadowColor = "white";
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fillText('High scores', LEFT + WIDTH/2, 60); 

            context.font = "20px Comic Sans MS, Verdana";
            var max = Math.min(10, highscores.length);
            for(var i = 0; i < max; i++)
            {
                if (i == 0)
                    context.font = "bold 24px Comic Sans MS, Verdana";
                else if (i == 1)
                    context.font = "bold 22px Comic Sans MS, Verdana";
                else if (i == 2)
                    context.font = "bold 20px Comic Sans MS, Verdana";
                else
                    context.font = "20px Comic Sans MS, Verdana";

            
                context.textAlign = "right";
                context.fillText(highscores[i].score + " points", LEFT + WIDTH/2 - 10, 100 + i * 25); 
                context.textAlign = "left";
                context.fillText(highscores[i].user, LEFT + WIDTH/2 + 10, 100 + i * 25); 
            }
            
            break;
        }        
        case STATE_NEXT_LEVEL: {
            drawOverlay();            
            context.font = "45px tektron, Comic Sans MS, Verdana";
            context.textAlign = "center";
            context.fillStyle = "#e3f5ff";
            context.shadowColor = "white";
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fillText(currentLevel.name, LEFT + WIDTH/2, 210); 
            
            break;
        }
        case STATE_WIN: {
            drawOverlay();            
            context.font = "45px tektron, Comic Sans MS, Verdana";
            context.textAlign = "center";
            context.fillStyle = "#e3f5ff";
            context.shadowColor = "white";
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fillText('Congratulation!', LEFT + WIDTH/2, 160); 
            context.font = "35px tektron, Comic Sans MS, Verdana";
            context.fillText('You won!', LEFT + WIDTH/2, 230); 
            context.font = "30px tektron, Comic Sans MS, Verdana";
            context.fillText(SCORE + ' points', LEFT + WIDTH/2, 300); 
            
            break;
        }
    }
}

function drawLives() {
    if (game_state == STATE_SUSPEND || game_state == STATE_RUN)
    {
        context.globalAlpa = 0.8;
        for (var i = 0; i < comp_lives; i++)
            context.drawImage(img_ball_red, LEFT + i * 20, TOP + HEIGHT + 28, 16, 16);    

        for (var i = 0; i < player_lives; i++)
            context.drawImage(img_ball, LEFT + WIDTH - 16 - i * 20, TOP + HEIGHT + 28, 16, 16);    
    }
}

function drawPad(_x, _y, z, hasPlayer) {
    _x -= PAD_WIDTH / 2;
    _y -= PAD_HEIGHT / 2;
    if (_x < 0) _x = 0;
    if (_y < 0) _y = 0;
    _x = Math.min(_x, WIDTH - PAD_WIDTH);
    _y = Math.min(_y, HEIGHT - PAD_HEIGHT);

    var drawW = convert2dto3d(WIDTH, z);
    var drawH = convert2dto3d(HEIGHT, z);
    var drawLeft = (WIDTH - drawW) / 2;
    var drawTop = (HEIGHT - drawH) / 2;

    var x = LEFT + drawLeft + convert2dto3d(_x, z); 
    var y = TOP + drawTop + convert2dto3d(_y, z); 
    
    var w = convert2dto3d(PAD_WIDTH, z); var sw = convert2dto3d(PAD_WIDTH / 4, z);
    var h = convert2dto3d(PAD_HEIGHT, z); var sh = convert2dto3d(PAD_HEIGHT / 4, z);
    var r = convert2dto3d(PAD_CORNER, z); var sr = convert2dto3d(PAD_CORNER / 2, z);
    
    //context.globalAlpha = getAlpha(z);
    context.beginPath();
    roundedRect(x, y, w, h, r);
    roundedRect(x + (w - sw)/2, y + (h - sh)/2, sw, sh, sr);

    context.moveTo(x + w/2, y);
    context.lineTo(x + w/2, y + (h - sh)/2);

    context.moveTo(x + w/2, y + h - (h - sh)/2);
    context.lineTo(x + w/2, y + h);

    context.moveTo(x, y + h/2);
    context.lineTo(x + (w - sw)/2, y + h/2);

    context.moveTo(x + w - (w - sw)/2, y + h/2);
    context.lineTo(x + w, y + h/2);

    context.closePath();
    if (hasPlayer) {
        context.lineWidth = 2;
        context.strokeStyle = "#409fd0";
    } else {
        context.lineWidth = 1;
        context.strokeStyle = "#e75b5c";    
    }
    var alpha = "0.4";
    if (((hasPlayer && ball.z <= 2) || (!hasPlayer && (ball.z >= DEPTH - 2))) && hitTest(hasPlayer))
        alpha = "0.6";
    context.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
    context.fill();        
    context.stroke();
}


/* --------------------- Ball class ---------------------- */
function Ball() {
    this.radius = 30.0;
    this.x = (WIDTH - this.radius) / 2;
    this.y = (HEIGHT - this.radius) / 2;
    this.z = 0.0;
    this.lastmove = 0;
    this.pause = false;
    
    //labda sebesség
    this.velocity = 1.0;
    this.dx = 0.0;
    this.dy = 0.0;
    this.dz = 0.0;
    
    //csavarás
    this.curveX = 0.0;
    this.curveY = 0.0;
    
    this.draw = function() {
        var drawRadius = convert2dto3d(this.radius, this.z);
        var drawX = convert2dto3d(this.x, this.z);
        var drawY = convert2dto3d(this.y, this.z);
        
        var drawW = convert2dto3d(WIDTH, this.z);
        var drawH = convert2dto3d(HEIGHT, this.z);
        var drawLeft = LEFT + (WIDTH - drawW) / 2;
        var drawTop = TOP + (HEIGHT - drawH) / 2;
        
        context.drawImage(img_ball, drawLeft + drawX, drawTop + drawY, drawRadius * 2, drawRadius * 2);
        
        //Segédvonal rajzolása
        context.globalAlpha = getAlpha(this.z);
        drawX = convert2dto3d(WIDTH, this.z);
        drawY = convert2dto3d(HEIGHT, this.z);
        drawLeft = LEFT + (WIDTH - drawX) / 2;
        drawTop = TOP + (HEIGHT - drawY) / 2;
        context.lineWidth = 2;
        context.strokeStyle = "#5bb8e7";
        context.strokeRect(drawLeft, drawTop, drawX, drawY);        
        context.globalAlpha = 1;
        context.lineWidth = 1;
        
        //Árnyék rajzolása
        /*var drawX = convert2dto3d(this.x, this.z);
        var drawY = convert2dto3d(HEIGHT, this.z);
        context.globalAlpha = getAlpha(this.z);
        context.drawImage(img_ballshadow, drawLeft + drawX, drawTop + drawY, drawRadius * 2, drawRadius * 2);*/
        context.globalAlpha = 1;
    };
    
    this.start = function(oppStart) {
        this.pause = false;
        this.velocity = currentLevel.speed;
        this.dz = oppStart?-this.velocity:this.velocity;

        if (game_mode == 1)
        {
            //véletlen szerű legyen a kezdés
            this.dx = (Math.random() * 2) - 0.5;
            this.dy = (Math.random() * 2) - 0.5;
        }
        
        this.lastmove = new Date().getTime();
    };
    
    this.stop = function() {
        this.dx = 0.0;
        this.dy = 0.0;
        this.dz = 0.0;
        
        this.curveX = 0.0;
        this.curveY = 0.0;

        this.x = (WIDTH - this.radius) / 2;
        this.y = (HEIGHT - this.radius) / 2;
        this.z = 0.0;
    }
    
    this.move = function() {
        if (game_state != STATE_RUN) return;
    
        if (!this.pause)
        {
            if (Math.abs(this.curveX) > 0.001)
                this.curveX /= CURVE_DECAY;
            else
                this.curveX = 0.0;
            if (Math.abs(this.curveY) > 0.001)
                this.curveY /= CURVE_DECAY;
            else
                this.curveY = 0.0;
            
            this.dx /= SPEED_DECAY;
            this.dy /= SPEED_DECAY;
            
            this.dx += this.curveX;
            this.dy += this.curveY;
        
            this.x += this.dx;
            this.y -= this.dy;
            this.z += this.dz;
            
            if (this.x > WIDTH - this.radius * 2) //jobb fal
            {
                play(sound_wallhit);
                this.curveX /= ((CURVE_DECAY - 1.0) * 50.0 + 1.0); //csavarás csillapítása 50-ed részére
                this.dx = -this.dx;
                this.x = WIDTH - this.radius * 2;
    
                if (this.dz > 0)
                    SCORE += WALL_SCORE;
            }
    
            if (this.x < 0) //bal fal
            {
                play(sound_wallhit);
                this.curveX /= ((CURVE_DECAY - 1.0) * 50.0 + 1.0);
                this.dx = -this.dx;
                this.x = 0;
    
                if (this.dz > 0)
                    SCORE += WALL_SCORE;
            }
    
            if (this.y > HEIGHT - this.radius * 2) //alsó fal
            {
                play(sound_wallhit);
                this.curveY /= ((CURVE_DECAY - 1.0) * 50.0 + 1.0);
                this.dy = -this.dy;
                this.y = HEIGHT - this.radius * 2;
    
                if (this.dz > 0)
                    SCORE += WALL_SCORE;
            }
    
            if (this.y < 0) //felső fal
            {
                play(sound_wallhit);
                this.curveY /= ((CURVE_DECAY - 1.0) * 50.0 + 1.0);
                this.dy = -this.dy;
                this.y = 0;
    
                if (this.dz > 0)
                    SCORE += WALL_SCORE;
            }
        }
        
        if (this.z > DEPTH) //ellenfél gólterület
        {
            if (game_mode == 1)
            {
                //single game
                if (hitTest(false))
                {
                    bonus(BONUS_NONE); //clear text
                    
                    comp.padSpeedX *= 2;
                    comp.padSpeedY *= 2;

                    this.curveX = comp.padSpeedX / currentLevel.curve.amount;
                    this.curveY = -comp.padSpeedY / currentLevel.curve.amount;
                    play(sound_padhit);
                } else {
                    //Gép meghal
                    die(false);
                    return;
                }
                this.dz = -this.dz;
                this.z = DEPTH;
            } else { 
                //multi
                if (oppInfo.hitID == hitID)
                {
                    this.pause = false;
                    if (oppInfo.success)
                    {
                        this.curveX = -oppInfo.curveX;
                        this.curveY = oppInfo.curveY;
                        comp.padX = oppInfo.hitX;
                        comp.padY = oppInfo.hitY;                        
                        this.dx = -oppInfo.speedX,
                        this.dy = oppInfo.speedY,
                        this.dz = -this.dz;
                        this.z = DEPTH;
                        play(sound_padhit);
                    } else 
                    {
                        //Ellenfél meghal
                        die(false);
                        return;
                    }
                } else {
                    //várakozás, mert még nem jött meg hogy mit ütött
                    this.pause = true;
                }
            }
        }
        if (this.z <= 0) //saját gólterület
        {
            if (hitTest(true))
            {
                
                SCORE += HIT_SCORE;
                this.curveX = -padSpeedX / currentLevel.curve.amount;
                this.curveY = padSpeedY / currentLevel.curve.amount;
                play(sound_padhit2);
                //console.log('X: ' + this.curveX + ' Y: ' + this.curveY);
                
                if (game_mode == 2) // multi
                {
                    if (isHost)
                        hitID++;    
                    sendTick(TICK_HIT, {
                        hitid: hitID,
                        x: padPos.x,
                        y: padPos.y,        
                        success: true,
                        curveX: this.curveX,
                        curveY: this.curveY,
                        speedX: this.dx,
                        speedY: this.dy
                    });
                    if (!isHost)
                        hitID++;    
                }
                
                bonus(BONUS_NONE); //clear text
                if (hitTest(true, true))
                {
                    SCORE += ACCURACY_SCORE;
                    bonus(BONUS_ACCURACY);
                }
                
                if (Math.abs(this.curveX) > 0.2 && Math.abs(this.curveY) > 0.2) {
                    if (Math.abs(this.curveX) > 0.6 && Math.abs(this.curveY) > 0.6) {
                        //hiper curve
                        SCORE += HYPERCURVE_SCORE;
                        bonus(BONUS_HYPERCURVE);
                    } else {
                        //super curve
                        SCORE += SUPERCURVE_SCORE;
                        bonus(BONUS_SUPERCURVE);
                    }
                } else if (Math.abs(this.curveX) > 0.2 || Math.abs(this.curveY) > 0.2) {
                    if (Math.abs(this.curveX) > 0.6 || Math.abs(this.curveY) > 0.6) {
                        //mega curve
                        SCORE += MEGACURVE_SCORE;
                        bonus(BONUS_MEGACURVE);
                    } else {
                        //curve
                        SCORE += CURVE_SCORE;
                        bonus(BONUS_CURVE);
                    }
                } else {
                    curve_combo = 0;
                }
            } else {
                //Játékos meghal
                die(true);
                return;
            }
            this.dz = -this.dz;
            this.z = 0;
        }
    };   
    
}

function bonus(type, point) {
    switch(type)
    {
        case BONUS_NONE: {
            bonus_message = ""; 
            break;
        }
        case BONUS_CURVE: {
            bonus_message = "Curve bonus +" + CURVE_SCORE + "!";
            ++curve_combo; 
            break;
        }
        case BONUS_SUPERCURVE: {
            bonus_message = "Super Curve bonus +" + SUPERCURVE_SCORE + "!"; 
            ++curve_combo;
            break;
        }
        case BONUS_MEGACURVE: {
            bonus_message = "Mega Curve bonus +" + MEGACURVE_SCORE + "!"; 
            ++curve_combo;
            break;
        }
        case BONUS_HYPERCURVE: {
            bonus_message = "Hyper Curve bonus +" + HYPERCURVE_SCORE + "!"; 
            ++curve_combo;
            break;
        }
        case BONUS_ACCURACY: bonus_message = "Accuracy bonus +" + ACCURACY_SCORE + "!"; break;
        case BONUS_TIME: bonus_message = "Time bonus +" + point + "!"; break;
        case BONUS_LIFE: bonus_message = "Life bonus +" + point + "!"; break;
    }
    if (curve_combo >= 3)
    {
        bonus_message = curve_combo + "x curve combo +" + CURVECOMBO_SCORE + "!"; 
        SCORE += CURVECOMBO_SCORE;
        curve_combo = 0;
    }
}

function hitTest(hasPlayer, acc) {
    var rLeft, rTop;
    if (hasPlayer) {
        rLeft = padPos.x - (PAD_WIDTH / 2);
        rTop = padPos.y - (PAD_HEIGHT / 2);
    } else {
        rLeft = comp.padX - (PAD_WIDTH / 2);
        rTop = comp.padY - (PAD_HEIGHT / 2);

    }
    var bR = ball.x + ball.radius * 1.60;
    var bB = ball.y + ball.radius * 1.60;
    
    var bL = ball.x + ball.radius * 0.40;
    var bT = ball.y + ball.radius * 0.40;
    if (bR >= rLeft && bL <= rLeft + PAD_WIDTH && bB >= rTop && bT <= rTop + PAD_HEIGHT)
    {
        if (acc)
        {
            rLeft = padPos.x - (PAD_WIDTH / 8);
            rTop = padPos.y - (PAD_HEIGHT / 8);
            var rRight = padPos.x + (PAD_WIDTH / 8);
            var rBottom = padPos.y + (PAD_HEIGHT / 8);

            var bX = ball.x + ball.radius;
            var bY = ball.y + ball.radius;
            
            if (bX >= rLeft && bX <= rRight && bY >= rTop && bY <= rBottom)
                return true;
            else
                return false;
            
        } else
            return true;
    }
    else
        return false;
    
}

function startGame() {
    SCORE = 0;
    last_score = 0;
    elapsed_time = 0;
    curve_combo = 0;
    bonus_message = "";
    player_lives = MAX_PLAYER_LIVES;
    comp_lives = MAX_COMP_LIVES;
    levelIndex = 0;
    clearCanvas(true);
    ball.stop();
    
    if (game_mode == 2)
    {
        if (!isHost)
        {
            ball.dz = -this.velocity;
            ball.z = DEPTH;
        }
    
        currentLevel = LEVELS[0];
        game_state = STATE_SUSPEND;
    }
    else
        nextLevel();
}

function nextLevel() {
    if (levelIndex == LEVELS.length) {
        game_state = STATE_WIN;    
    } else {
        curve_combo = 0;
        /*player_lives = MAX_PLAYER_LIVES;*/
        comp_lives = MAX_COMP_LIVES;
    
        currentLevel = LEVELS[++levelIndex - 1];
        game_state = STATE_NEXT_LEVEL;
        PAD_WIDTH = currentLevel.padWidth || 120;
        PAD_HEIGHT = currentLevel.padHeight || 80;
        
        lastStateTime = new Date().getTime();
    }
}

function start() {
    game_state = STATE_RUN;
    START_TIME = new Date().getTime();
    bonus_message = "";
    curve_combo = 0;
    elapsed_time = 0;
    
    if (game_mode == 2)
    {
        hitID = 1;
        if (isHost)
        {
            sendTick(TICK_HIT, {
                hitid: hitID,
                x: padPos.x,
                y: padPos.y,        
                success: true,
                curvex: 0,
                curvey: 0
            });
        }
        ball.start(!isHost);
    } else
        ball.start(false);
        
    comp.start();
    $("canvas").css("cursor", "none");
}

function die(player) {
    game_state = STATE_SUSPEND;
    last_score = SCORE;
    bonus_message = "";
    ball.stop();
    comp.stop();
    if (player)
    {
        player_lives--;
        play(sound_disappoint);
        if (game_mode == 2)
        {
            if (isHost)
                hitID++;    
        
            sendTick(TICK_LOST, {
                hitid: hitID,
                x: padPos.x,
                y: padPos.y
            });
        
            if (game_mode == 2 && !isHost)
            {
                ball.dz = -this.velocity;
                ball.z = DEPTH;
            }
        } else {
            POINT_COMP++;
        }
        
        if (game_mode == 1 && player_lives < 1)
        {
            game_state = STATE_GAME_OVER;
        } else
            bonus_message = "Fail";
    }
    else
    {
        POINT_PLAYER++;
        comp_lives--;
        play(sound_applause);
        
        //time bonus
        if (elapsed_time < TIME_MAX - 4) //4 másodperc az első ütésig
        {
            var point = (TIME_MAX - elapsed_time + 4) * TIME_SCORE;
            bonus(BONUS_TIME, point);
            SCORE += point;            
        }

        if (game_mode == 1 && comp_lives < 1)
        {
            var point = player_lives * LIFE_SCORE;
            bonus(BONUS_LIFE, point);
            SCORE += point;
            if (player_lives < MAX_PLAYER_LIVES)
                player_lives++;

            nextLevel();
        }
        
        if (game_mode == 2 && !isHost) {
            ball.dz = -this.velocity;
            ball.z = DEPTH;
        }
    }
    if (game_mode == 2)
        oppInfo = {};
    $("canvas").css("cursor", "default");
}


/* --------------------- Computer class ---------------------- */
function Computer() {
    this.padX = WIDTH / 2; 
    this.padY = HEIGHT / 2; 
    this.oldX = this.padX;
    this.oldY = this.padY;
    this.padSpeedX = 0.0;
    this.padSpeedY = 0.0;
    this.lastmove = 0;
        
    this.start = function() {
        this.padX = WIDTH / 2; 
        this.padY = HEIGHT / 2; 
    };
    
    this.stop = function() {
        this.padX = WIDTH / 2; 
        this.padY = HEIGHT / 2; 
    };
    
    this.tick = function() {
        if (game_state == STATE_RUN && game_mode == 1) {
            this.oldX = this.padX;
            this.oldY = this.padY;
            
            var dX = 0.0;
            var dY = 0.0;
            var skill = 0.0;
            if (ball.dz > 0)
            {
                //Ha felé megy a labda, akkor pozícionáljon
                if (ball.z/DEPTH > 0.2)
                {
                    dX = (ball.x + ball.radius) - this.padX;
                    dY = (ball.y + ball.radius) - this.padY;
                    skill = currentLevel.skillFactor;
                }
            } else {
                //Ha tőle elfele megy a labda, akkor álljon be középre
                dX = (WIDTH / 2) - this.padX;
                dY = (HEIGHT / 2) - this.padY;
                skill = currentLevel.skillFactor;
            }
            if (Math.abs(dX) > 0)
            {
                this.padX += dX / skill;
                //this.padX += sign(dX) * 5;
            }
            if (Math.abs(dY) > 0)
            {
                this.padY += dY / skill;
                //this.padY += sign(dY) * 5;
            }
            
            //Ellenőrizni nem csúszott-e túl
            if (this.padX < PAD_WIDTH / 2)
                this.padX = PAD_WIDTH / 2;
            if (this.padX > WIDTH - PAD_WIDTH / 2)
                this.padX = WIDTH - PAD_WIDTH / 2;

            if (this.padY < PAD_HEIGHT / 2)
                this.padY = PAD_HEIGHT / 2;
            if (this.padY > HEIGHT - PAD_HEIGHT / 2)
                this.padY = HEIGHT - PAD_HEIGHT / 2;
                
            this.padSpeedX = this.padX - this.oldX;
            this.padSpeedY = this.padY - this.oldY;
        } else if (game_mode == 2){
            if (oppInfo !== null) {
                this.padX = oppInfo.paddleX;
                this.padY = oppInfo.paddleY;
            }
        }
    };
}

function saveScore() {
    game_state = STATE_SAVE_SCORE;

    var name = getStorage('username', "Player " + Math.ceil(Math.random() * 1000));
    name = prompt("Please enter your name", name);
    if (name != null && name != "")
    {
        putStorage('username', name);
        $.ajax({
            type: "GET",
            async: true,
            cache: false,
            data: {
                user: name,
                score: SCORE
            },
            url: "https://supercurve-highscores.icebob-todo.workers.dev/highscores",
            dataType: "json",
            success: function(data) {
                if (data && data !== "") {
                    highscores = data;
                    game_state = STATE_HIGHSCORES;
                }    
            },
            error: function() {
                game_state = STATE_MAIN_MENU;
            }
        });        
            
    } else 
        game_state = STATE_MAIN_MENU;
}

function getHighScores() {
    $.ajax({
        type: "GET",
        async: true,
        cache: false,
        url: "https://supercurve-highscores.icebob-todo.workers.dev/highscores",
        dataType: "json",
        success: function(data) {
            if (data && data !== "") {
                highscores = data;
            }    
        }
    });        
}

/* --------------------- UI events ---------------------- */

$(document).ready(function() {
    canvas = document.getElementById('game');

    if(canvas.getContext) {
        context = canvas.getContext('2d'); 
        
        document.onmousedown = MouseClickHandler;
        document.onmousemove = MouseMoveHandler;
        document.onkeydown = KeyHandler;
		
        //Touch handler
        document.addEventListener("touchmove", function(event) {
            if (event.targetTouches.length > 0 && (game_state == STATE_SUSPEND || game_state == STATE_RUN))
                MouseMoveHandler(event.targetTouches[0]);        
                event.preventDefault();
        });		

        canvas.focus(); 
        
        window.requestAnimFrame = (function(callback){
            return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            };
        })();        
    
        load();
    }
});

function MouseClickHandler(e) {
    mouse.x = getCursorX(e);
    mouse.y = getCursorY(e);

    if (game_state == STATE_MAIN_MENU && ptInRect(mouse, {left: 130, top: 140, width: 300, height: 40}))
    {
        game_mode = 1;
        startGame();
    } else if (game_state == STATE_MAIN_MENU && ptInRect(mouse, {left: 130, top: 200, width: 300, height: 40}))
    {
        window.location = window.location.href + "multi";
    } else if (game_state == STATE_MAIN_MENU && ptInRect(mouse, {left: 130, top: 260, width: 300, height: 40}))
    {
        getHighScores();
        game_state = STATE_HIGHSCORES;
    } else if (ptInRect(mouse, {left: 740, top: 450, width: 45, height: 45}))
    {
        mute = 1 - mute;
    } else if (game_state == STATE_SUSPEND && hitTest(true)) 
    {
        if (game_mode == 1)
            start();
        else if (game_mode == 2 && isHost)
            start();
    } else if (game_state == STATE_GAME_OVER || game_state == STATE_WIN) 
    {
        if (SCORE > 0)
            saveScore();
        else
            game_state = STATE_MAIN_MENU;
    } else if (game_state == STATE_HIGHSCORES) 
    {
        game_state = STATE_MAIN_MENU;
    }
}

function MouseMoveHandler(e) {
    mouse.x = getCursorX(e);
    mouse.y = getCursorY(e);
    
    if (ptInRect(mouse, {left: 130, top: 140, width: 300, height: 40}))
        hover_button = 1;
    else if (ptInRect(mouse, {left: 130, top: 200, width: 300, height: 40}))
        hover_button = 2;
    else if (ptInRect(mouse, {left: 130, top: 260, width: 300, height: 40}))
        hover_button = 3;
    else
        hover_button = 0;
}

function KeyHandler(e) {
    e = window.event ? window.event : e; // Considering IE
    var key = (e.charCode) ? e.charCode : ((e.keyCode) ? e.keyCode : ((e.which) ? e.which : 0));
    if (key == 77) { //M
        mute = 1 - mute;
    }
    else if (key == 76) { 
        nextLevel();
    }
    else if (key == 73) {
        player_lives++;
    } else if (key == 88 && (game_state == STATE_RUN || game_state == STATE_SUSPEND)) { //X
        if (confirm('Do you want to quit?'))
        {
            ball.stop();
            comp.stop();
            $("canvas").css("cursor", "default");

            game_state = STATE_MAIN_MENU;
        }
    }
}
        