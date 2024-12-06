/*************************************
 *            SuperCurve    
 *              v1.2
 * 
 *      Created: Norbert Mereg
 *  E-mail: mereg.norbert@gmail.com
 * **********************************/
 
function convert2dto3d(value, z) {
    var a = Math.atan(z / ZDepth);
    var deg = a * 180 / Math.PI;
    return value * ((90 - deg) / 90);       
}

function getAlpha(z) {
    return 1 - (z / DEPTH / 1.3);   
}

function play( music ) {
    if(mute === 0)
    	music.play();
}

function is_html5_storage()
{  
    try
	{  
		return 'localStorage' in window && window['localStorage'] !== null;  
	} catch (e) {  
		return false;  
	}  
}

function putStorage(name, value) {
    if ( is_html5_storage() !== false )
    {
        localStorage[name] = value;
    }
}

function getStorage(name, defValue) {
    var res = defValue;
    if ( is_html5_storage() !== false )
    {
        if(localStorage.getItem(name) !== null)
            res = localStorage[name];
    }
    return res;
}

function roundedRect(x, y, w, h, r){
    context.moveTo(x+r, y);
    context.lineTo(x+w-r, y);
    context.quadraticCurveTo(x+w, y, x+w, y+r);
    context.lineTo(x+w, y+h-r);
    context.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    context.lineTo(x+r, y+h);
    context.quadraticCurveTo(x, y+h, x, y+h-r);
    context.lineTo(x, y+r);
    context.quadraticCurveTo(x, y, x+r, y);
}

function formatFloat(val) {
    return (new Number(val)).toFixed(2);
}

function timeToStr() {
    if (START_TIME === null)
        return "--:--";
        
    return pad(Math.floor(elapsed_time/60), 2) + ":" + pad(Math.ceil(elapsed_time%60), 2);   
}

function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function ptInRect(point, rect) {
    if (rect.width && rect.height)
    {
        rect.right = rect.left + rect.width;
        rect.bottom = rect.top + rect.height;
    }
    return (point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom);
}

function preLoadImages(images, callback) 
{
    if (images.length > 0)
    {
        var img = new Image();
        img.src = images[0];
        img.onload = function() {
            preLoadImages(images.slice(1), callback);
        };        
        
    } else
        callback();
}


function sign(val) {
    if (val > 0.0)
        return 1;
    else if (val < 0.0)
        return -1;
    else
        return 0;
}

function sleep(delay)
{
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

function getCursorX(e) {
    var x;
    if (e.pageX !== undefined)
        x = e.pageX;
    else
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    
    x -= canvas.offsetLeft;
    return x;
}

function getCursorY(e) {
    var y;
    if (e.pageY !== undefined)
        y = e.pageY;
    else
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    y -= canvas.offsetTop;
    return y;
}

function generateLevels(totalLevels) {
  const levels = [];

  for (let i = 1; i <= totalLevels; i++) {
    const baseSpeed = 1.5;
    const speedIncrement = 0.15;
    const baseSkillFactor = 10;
    const skillFactorDecrement = 0.5;
    const baseCurveAmount = 20;
    const curveDecrement = 1;
    const basePadWidth = 120;
    const basePadHeight = 80;
    const padDecrement = 10;

    levels.push({
      level: i,
      name: `Level ${i}`,
      curve: {
        amount: Math.max(baseCurveAmount - (i - 1) * curveDecrement, 10), // Minimum curve amount is 10
      },
      skillFactor: Math.max(
        baseSkillFactor - (i - 1) * skillFactorDecrement,
        2.5
      ), // Minimum skill factor is 2.5
      speed: baseSpeed + (i - 1) * speedIncrement, // Increment speed
      ...(i >= 3 && {
        padWidth: Math.max(
          basePadWidth - Math.floor(((i - 3) * padDecrement) / 2),
          80
        ), // Minimum width is 80
        padHeight: Math.max(
          basePadHeight - Math.floor(((i - 3) * padDecrement) / 2),
          50
        ), // Minimum height is 50
      }),
    });
  }

  return levels;
}