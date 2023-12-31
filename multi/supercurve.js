/*************************************
 *        SuperCurve Multi
 *              v1.0
 *     http://supercurve.sds.hu
 * 
 *      Created: Norbert Mereg
 *  E-mail: mereg.norbert@gmail.com
 * **********************************/

function load()
{
    game_state = STATE_MAIN_MENU;
    
	context.fillStyle = "white";
	context.font = "bold 26pt Verdana";
    context.fillText("Loading...",400,245);
    
	lastDrawTime = new Date().getTime();
    ball = new Ball();   
    comp = new Opponent();
    
    img_bg = new Image();
    img_main = new Image();
    img_main.src = "images/supercurve_multi_main.png";

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

    preLoadImages(["images/supercurve_multi_main.png", "images/ball.png", "images/sound_off.png", "images/sound_on.png", "images/ball.png", "images/ball_red.png"], function() {
        draw();
//        mainTimer = setInterval(move, 1000/40);        
        setTimeout(move, 1000/50);        
        setTimeout(controlFPS, 1000/50);        
    });
    
    
}

function draw()
{
    //Eltelt időből FPS számítás
    var now = new Date().getTime();
    if (lastDrawTime)
    {
    	var dt = now - lastDrawTime;
        if (dt != 0)
        	fps = 0.1*1000/dt + 0.9*fps;    
    }
    lastDrawTime = now;
    

    clearCanvas(false);
    
    if ((game_state == STATE_SUSPEND || game_state == STATE_RUN) && !game_pause)
    {
        drawPad(comp.padX, comp.padY, DEPTH, false);
        ball.draw();
    
        padPos = {x: mouse.x - LEFT, y: mouse.y - TOP};
        drawPad(padPos.x, padPos.y, 0, true);
    }
    
    context.shadowBlur = 0;
    drawInfobar();
    drawStateInfo();
    
    window.requestAnimFrame(draw);
}

function controlFPS() {
    //Eltelt időből FPS számítás
    var now = new Date().getTime();
    if (lastMoveTime)
    {
        var dt = now - lastMoveTime;
        if (dt != 0)
            moveFPS = 0.1*1000/dt + 0.9*moveFPS;    
    }
    if (moveFPS > fps)
        moveFPS = fps;
    lastMoveTime = now;
    
    setTimeout(controlFPS, 1000/50);        
}

function move() {

    if (game_state == STATE_NEXT_LEVEL)
    {
        if (Math.ceil(((new Date().getTime()) - lastStateTime) / 1000) > 2)
            game_state = STATE_SUSPEND;
    }
    
    if (dev_mode == 1)
    {
        mouse.x = LEFT + (WIDTH) / 2; 
        mouse.y = TOP + (HEIGHT) / 2; 
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
    
    var newFPS = 50;
    if (oppMoveFPS && oppMoveFPS > 0 && oppMoveFPS < 50)
    {
        if (ball.dz > 0)
            newFPS = (oppMoveFPS - 2);        
        else
            newFPS = (oppMoveFPS + 2);        
    }
    setTimeout(move, 1000/newFPS);        
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
        context.shadowBlur = 8;
        
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
        
        
        context.font = "18px tektron, Impact, Verdana";
        context.textAlign = "left";
        context.fillStyle = "#e3f5ff";
        context.shadowColor = "white";
        context.shadowBlur = 6;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        
        context.fillText(username, LEFT + 25 , TOP + HEIGHT + 20); 
        context.textAlign = "right";
        context.fillText(oppName, LEFT + WIDTH - 25, TOP + HEIGHT + 20); 
        
        drawPoints();

        context.shadowBlur = 0;

        //draw flags
        if (userFlag.loaded)
            context.drawImage(userFlag, LEFT , TOP + HEIGHT + 10);
        if (oppFlag.loaded)
            context.drawImage(oppFlag, LEFT + WIDTH - 20 , TOP + HEIGHT + 10);

        context.shadowBlur = 0;

        $(img_bg).attr('src', canvas.toDataURL());
    } else {
        context.drawImage(img_bg, 0, 0);
    }
}

function drawInfobar() {

    context.font = "35px tektron, Impact, Verdana";
    context.textAlign = "center";
    context.fillStyle = "#e3f5ff";
    context.shadowColor = "white";
    context.shadowBlur = 6;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

/*    context.fillText(pad(ROUND, 2), 704, 130); 

    //draw score
    if (SCORE - last_score > 100) 
        last_score += 10;
    else if (last_score < SCORE) last_score += 5;
    context.fillText(pad(last_score, 5), 704, 230); 
*/    
    //draw time
    if (game_state == STATE_RUN)
    {
        elapsed_time = Math.ceil(((new Date().getTime())-START_TIME)/1000);
    }
    
    context.fillText(timeToStr(), 704, 140); 

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
            
            context.font = "45px tektron, Impact, Verdana";
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
            roundedRect(130, 200, 300, 40, 5);
            context.closePath();
            context.fill();
            
            context.fillStyle = "#e3f5ff";
            context.font = "30px tektron, Impact, Verdana";
            context.fillText('Login to lobby', 280, 230); 

            break;
        }
        case STATE_GAME_OVER: {
            drawOverlay();

            context.font = "45px tektron, Impact, Verdana";
            context.textAlign = "center";
            context.fillStyle = "#e3f5ff";
            context.shadowColor = "white";
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fillText('You lost', LEFT + WIDTH/2, 210); 

            context.font = "30px tektron, Impact, Verdana";
            context.fillText(POINT_PLAYER + ' - ' + POINT_OPPONENT, LEFT + WIDTH/2, 280); 


            //Play again button
            if (hover_button == 10)
                context.fillStyle = "#59c6fe";
            else
                context.fillStyle = "#325F8C";
            context.beginPath();
            roundedRect(50, 310, 200, 30, 5);
            context.closePath();
            context.fill();
            
            context.fillStyle = "#e3f5ff";
            context.font = "20px tektron, Impact, Verdana";
            context.fillText('Play again', 150, 330); 

            //Back to lobby button
            if (hover_button == 11)
                context.fillStyle = "#59c6fe";
            else
                context.fillStyle = "#325F8C";
            context.beginPath();
            roundedRect(325, 310, 200, 30, 5);
            context.closePath();
            context.fill();
            
            context.fillStyle = "#e3f5ff";
            context.font = "20px tektron, Impact, Verdana";
            context.fillText('Back to lobby', 425, 330); 


            break;
        }
        case STATE_WIN: {
            drawOverlay();

            context.font = "45px tektron, Impact, Verdana";
            context.textAlign = "center";
            context.fillStyle = "#e3f5ff";
            context.shadowColor = "white";
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fillText('Congratulation!', LEFT + WIDTH/2, 160); 
            context.font = "35px tektron, Impact, Verdana";
            context.fillText('You won!', LEFT + WIDTH/2, 230); 
            context.font = "30px tektron, Impact, Verdana";
            context.fillText(POINT_PLAYER + ' - ' + POINT_OPPONENT, LEFT + WIDTH/2, 280); 
            
            //Play again button
            if (hover_button == 10)
                context.fillStyle = "#59c6fe";
            else
                context.fillStyle = "#325F8C";
            context.beginPath();
            roundedRect(50, 310, 200, 30, 5);
            context.closePath();
            context.fill();
            
            context.fillStyle = "#e3f5ff";
            context.font = "20px tektron, Impact, Verdana";
            context.fillText('Play again', 150, 330); 

            //Back to lobby button
            if (hover_button == 11)
                context.fillStyle = "#59c6fe";
            else
                context.fillStyle = "#325F8C";
            context.beginPath();
            roundedRect(325, 310, 200, 30, 5);
            context.closePath();
            context.fill();
            
            context.fillStyle = "#e3f5ff";
            context.font = "20px tektron, Impact, Verdana";
            context.fillText('Back to lobby', 425, 330); 
            
            
            break;
        }
        case STATE_MULTI_RESPONSE: {
            drawOverlay();

            context.font = "45px tektron, Impact, Verdana";
            context.textAlign = "center";
            context.fillStyle = "#e3f5ff";
            context.shadowColor = "white";
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fillText('Click to start', LEFT + WIDTH/2, 210); 
            
            break;
        }
        case STATE_MULTI_WAIT: {
            drawOverlay();

            context.font = "45px tektron, Impact, Verdana";
            context.textAlign = "center";
            context.fillStyle = "#e3f5ff";
            context.shadowColor = "white";
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fillText('Waiting for ', LEFT + WIDTH/2, 210); 
            context.fillText(oppName + '...', LEFT + WIDTH/2, 260); 
            
            break;
        }        
        case STATE_MULTI_MESSAGE: {
            drawOverlay();

            context.font = "32px tektron, Impact, Verdana";
            context.textAlign = "center";
            context.fillStyle = "#e3f5ff";
            context.shadowColor = "white";
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fillText(game_message, LEFT + WIDTH/2, 210); 
            
            break;
        }        
        case STATE_ERROR: {
            drawOverlay();

            context.font = "30px tektron, Impact, Verdana";
            context.textAlign = "center";
            context.fillStyle = "#e3f5ff";
            context.shadowColor = "white";
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fillText(game_message, LEFT + WIDTH/2, 210); 
            
            break;
        }        
        
        case STATE_MULTI_DISCONNECT: {
            drawOverlay();

            context.font = "40px tektron, Impact, Verdana";
            context.textAlign = "center";
            context.fillStyle = "#e3f5ff";
            context.shadowColor = "white";
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.fillText('Server not found.', LEFT + WIDTH/2, 210); 
            
            break;
        }
        
        case STATE_RUN: {
            if (game_pause)
            {
                drawOverlay();
    
                context.font = "40px tektron, Impact, Verdana";
                context.textAlign = "center";
                context.fillStyle = "#e3f5ff";
                context.shadowColor = "white";
                context.shadowBlur = blur;
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;
                context.fillText('Pause', LEFT + WIDTH/2, 210); 
            }
            break;
        }        
        
    }
}

function drawPoints() {
    //if (game_state == STATE_SUSPEND || game_state == STATE_RUN)
    {
        context.globalAlpa = 1;
        context.font = "32px tektron, Impact, Verdana";
        context.textAlign = "center";
        context.fillStyle = "#e3f5ff";
        context.shadowColor = "white";
        context.shadowBlur = 6;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.fillText(POINT_PLAYER + ' - ' + POINT_OPPONENT, LEFT + WIDTH/2, TOP + HEIGHT + 32); 
        context.shadowBlur = 0;
        
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
    this.radius = 40.0;
    this.x = WIDTH/2 - this.radius;
    this.y = HEIGHT/2 - this.radius;
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

        this.lastmove = new Date().getTime();
    };
    
    this.stop = function() {
        this.dx = 0.0;
        this.dy = 0.0;
        this.dz = 0.0;
        
        this.curveX = 0.0;
        this.curveY = 0.0;

        this.x = WIDTH/2 - this.radius;
        this.y = HEIGHT/2 - this.radius;
        this.z = 0.0;
    }
    
    this.move = function() {
        if (game_state != STATE_RUN) return;
    
        if (!this.pause && !game_pause)
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
            if (oppInfo.hitID == hitID)
            {
                //console.log('Opponent HIT: ' + hitID);
                if (lag_time)
                {
                    var now = new Date().getTime();
                    console.log('LAG: ' + (now - lag_time)/1000);
                    lag_time = null;
                }

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
                if (!this.pause)
                {
                    lag_time = new Date().getTime();
                }
                
                this.pause = true;
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
                
                if (IS_SERVE)
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
                //console.log('Pad HIT: ' + hitID);
                if (!IS_SERVE)
                    hitID++;    
                
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
        //case BONUS_TIME: bonus_message = "Time bonus +" + point + "!"; break;
        //case BONUS_LIFE: bonus_message = "Life bonus +" + point + "!"; break;
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

function serveBall() {
    var x = ROUND % (MAX_SERVE*2);
    var evenRound = (x > 0 && x <= MAX_SERVE);
    if ((isHost && evenRound) || (!isHost && !evenRound))
    {
        IS_SERVE = true;
        ball.dz = this.velocity;
        ball.z = 0;
    } else {
        IS_SERVE = false;
        ball.dz = -this.velocity;
        ball.z = DEPTH;
    }
}

function startGame() {
    SCORE = 0;
    ROUND = 1;
    POINT_PLAYER = 0;
    POINT_OPPONENT = 0;
    last_score = 0;
    game_pause = false;
    elapsed_time = 0;
    curve_combo = 0;
    bonus_message = "";
    
    //get country flags
    var u = getUser(userid);
    if (u)
        userFlag.src = 'images/flags/' + u.countryCode.toLowerCase() + '.png';
    var u = getUser(oppid);
    if (u)
        oppFlag.src = 'images/flags/' + u.countryCode.toLowerCase() + '.png';
    
    clearCanvas(true);
    ball.stop();
    serveBall();

    currentLevel = LEVELS[0];
    game_state = STATE_SUSPEND;
}

function nextLevel() {
    if (levelIndex == LEVELS.length) {
        game_state = STATE_WIN;    
    } else {
        curve_combo = 0;
        player_lives = MAX_PLAYER_LIVES;
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
    
    hitID = 1;
    if (IS_SERVE)
    {
        sendTick(TICK_HIT, {
            hitid: hitID,
            x: padPos.x,
            y: padPos.y,        
            success: true,
            curveX: 0,
            curveY: 0,
            speedX: 0,
            speedY: 0
        });
    }
    ball.start(!IS_SERVE);
        
    comp.start();
    $("canvas").css("cursor", "none");
}

function die(player) {
    game_state = STATE_SUSPEND;
    last_score = SCORE;
    bonus_message = "";
    ROUND++;
    ball.stop();
    comp.stop();
    if (player)
    {
        POINT_OPPONENT++;
        play(sound_disappoint);

        if (IS_SERVE)
            hitID++;    
    
        sendTick(TICK_LOST, {
            hitid: hitID,
            x: padPos.x,
            y: padPos.y
        });
        bonus_message = "Fail!";
        
    }
    else
    {
        POINT_PLAYER++;
        play(sound_applause);
        
        //time bonus
        if (elapsed_time < TIME_MAX - 4) //4 másodperc az első ütésig
        {
            var point = (TIME_MAX - elapsed_time + 4) * TIME_SCORE;
            bonus(BONUS_TIME, point);
            SCORE += point;            
        }
        bonus_message = "Goal!";

    }
    if (POINT_PLAYER >= MAX_POINT || POINT_OPPONENT >= MAX_POINT)
    {
        if (POINT_PLAYER > POINT_OPPONENT)
            game_state = STATE_WIN;
        else
            game_state = STATE_GAME_OVER;
    }
    serveBall();
    oppInfo = {};
    $("canvas").css("cursor", "default");
    clearCanvas(true);
}


/* --------------------- Opponent class ---------------------- */
function Opponent() {
    this.padX = WIDTH / 2; 
    this.padY = HEIGHT / 2; 
    this.oldX = this.padX;
    this.oldY = this.padY;
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
        if (oppInfo !== null) {
            this.padX = WIDTH - oppInfo.paddleX;
            this.padY = oppInfo.paddleY;
        }
    };
}

/* --------------------- UI events ---------------------- */

$(document).ready(function() {
    canvas = document.getElementById('game');

    if(canvas.getContext) {
        context = canvas.getContext('2d'); 
        
        document.onmousedown = MouseClickHandler;
        document.onmousemove = MouseMoveHandler;
        document.onkeydown = KeyHandler;
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
        
        if (window.MozWebSocket) //Firefox support
        {
            window.WebSocket = window.MozWebSocket;
        }
        
        if (typeof(WebSocket) === "undefined")
            alert("Oh no, you need a browser that supports WebSockets.");
        else        
            load();
    }
});

function MouseClickHandler(e) {
    mouse.x = getCursorX(e);
    mouse.y = getCursorY(e);

/*    if (game_state == STATE_MAIN_MENU && ptInRect(mouse, {left: 130, top: 140, width: 300, height: 40}))
    {
        game_state = STATE_MULTI_LOBBY;
        connect();
    } else*/ if (game_state == STATE_MAIN_MENU && ptInRect(mouse, {left: 130, top: 200, width: 300, height: 40}))
    {
        game_state = STATE_MULTI_LOBBY;
        connect();
    } else if (ptInRect(mouse, {left: 740, top: 450, width: 45, height: 45}))
    {
        mute = 1 - mute;
    } else if (game_state == STATE_SUSPEND && hitTest(true)) 
    {
        if (IS_SERVE)
            start();
    } else if ((game_state == STATE_GAME_OVER || game_state == STATE_WIN)  && ptInRect(mouse,  {left: 50, top: 310, width: 200, height: 30}))
    {
        playAgain();
    } else if ((game_state == STATE_GAME_OVER || game_state == STATE_WIN)  && ptInRect(mouse,  {left: 325, top: 310, width: 200, height: 30}))
    {
        gotoLobby(true);
    } else if ((game_state == STATE_HIGHSCORES || game_state == STATE_MULTI_DISCONNECT)  && ptInRect(mouse, {left: LEFT, top: TOP, width: WIDTH, height: HEIGHT}))
    {
        game_state = STATE_MAIN_MENU;
    } else if ((game_state == STATE_MULTI_RESPONSE)  && ptInRect(mouse, {left: LEFT, top: TOP, width: WIDTH, height: HEIGHT}))
    {
        sendTick(TICK_ROUND_READY);
        game_state = STATE_MULTI_WAIT;
        
    } else if ((game_state == STATE_ERROR)  && ptInRect(mouse, {left: LEFT, top: TOP, width: WIDTH, height: HEIGHT}))
    {
        if (error_callback)
            error_callback();
    }
}

function MouseMoveHandler(e) {
    mouse.x = getCursorX(e);
    mouse.y = getCursorY(e);
    
/*    if (ptInRect(mouse, {left: 130, top: 140, width: 300, height: 40}))
        hover_button = 1;
    else*/ if (ptInRect(mouse, {left: 130, top: 200, width: 300, height: 40}))
        hover_button = 1;
    else if (ptInRect(mouse, {left: 50, top: 310, width: 200, height: 30}))
        hover_button = 10;
    else if (ptInRect(mouse, {left: 325, top: 310, width: 200, height: 30}))
        hover_button = 11;
    else
        hover_button = 0;
}

function KeyHandler(e) {
    e = window.event ? window.event : e; // Considering IE
    var key = (e.charCode) ? e.charCode : ((e.keyCode) ? e.keyCode : ((e.which) ? e.which : 0));
    if (key == 77 && !isChatFocus()) { //M
        mute = 1 - mute;
    } else if (key == 80 && !isChatFocus()) { //P
        togglePause();
    } else if (key == 81 && !isChatFocus() && e.ctrlKey && e.shiftKey) { //Q
        dev_mode = 1 - dev_mode;
    } else if (key == 88 && !isChatFocus() && (game_state == STATE_RUN || game_state == STATE_SUSPEND || game_state == STATE_MULTI_WAIT || game_state == STATE_MULTI_RESPONSE)) { //X
        togglePause();
        if (confirm('Do you want to quit?'))
            gotoLobby(true, username + " quit");
        else
            togglePause();
    }
}
        