/*************************************
 *        SuperCurve Multi
 *              v1.0
 *     http://supercurve.sds.hu
 * 
 *      Created: Norbert Mereg
 *  E-mail: mereg.norbert@gmail.com
 * **********************************/

var socket = null;
var state = false;

//Error codes
var NO_USER                 = 101;
var USER_PLAYING            = 102;
var USER_LIMIT              = 103;


var TICK_KEEP_ALIVE         = 500;
var TICK_NEW_GAME           = 501;
var TICK_ROUND_READY        = 502;
var TICK_MATCH_START        = 503;
var TICK_HIT                = 504;
var TICK_LOST               = 505;
var TICK_PADDLEPOS          = 506;
var TICK_CHAT               = 507;
var TICK_GAME_END           = 508;
var TICK_GO_LOBBY           = 509;
var TICK_USERLIST           = 510;
var TICK_REGISTER           = 511;
var TICK_SELECT             = 512;
var TICK_PAUSE              = 513;
var TICK_RESUME             = 514;
var TICK_MATCH_ACCEPT       = 515;
var TICK_MATCH_REJECT       = 516;
var TICK_MATCH_REQUEST      = 517;
var TICK_LOBBY_CHAT         = 518;
var TICK_GAME_CHAT          = 519;
var TICK_PLAY_AGAIN         = 520;
var TICK_ERROR              = 521;

/* ---------------- Multiplayer function ---------------- */
var buffer = "";

function connect() {
/*    try
    {  */
        if (socket)
            socket.close();
            
        game_state = STATE_MULTI_MESSAGE; game_message = "Connecting to server...";
        socket = new WebSocket("wss://supercurve.fly.dev/");
        
        socket.onopen = function(){  
            state = true;
            createUser();
        }  
    
        socket.onmessage = function(msg){  
            if (msg.data && msg.data != "")
            {
                processIncomingData($.parseJSON( msg.data ));
            }
        }  
    
        socket.onclose = function(){  
            $("#userlist").hide();
            changeChatMode(MODE_CHAT_LOBBY, false);
            game_state = STATE_MULTI_DISCONNECT;
            state = false;
        }           
    
/*    } catch(exception){  
        state = false;
        alert(exception); 
    }  */   
}


async function createUser() {
    var name = getStorage('username', "Player " + Math.ceil(Math.random() * 1000));
    name = prompt("Please enter your name", name);
    if (name!=null && name!="")
    {
        putStorage('username', name);
        username = name;
        //beregisztrálni játékosnak
        const countryCode = await getCountryByIP();

        send({
            type: TICK_REGISTER,
            data: {
                name: username,
                geoip: {
                    country_code: countryCode, 
                    country: getCountryName(countryCode), 
                    //city: window.geoip_city?geoip_city():""
                }
            }
        });
    }
}

function getCountryByIP() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://api.country.is/",
            dataType: "json",
            success: function(data) {
                resolve(data.country);
            },
            error: function(err) {
                reject(err);
            }
        });
    });
}

function serverKeepAlive() {
    send({
        type: TICK_KEEP_ALIVE,
        data: {
            id: userid,
            fps: moveFPS
        }
    });
}

function refreshUserList(data) {
    userList = data;
    var tBody = $("#userTable tbody");
    tBody.empty();
    
    $.each(data, function(i ,user) {
        var row = $("<tr></tr>").addClass("userItem").attr('id', user.id);

        var flag = $("<img></img>").attr('src', 'images/flags/' + user.countryCode.toLowerCase() + '.png');
        $("<div></div>").addClass('divCountry').append(flag).wrap('<td></td>').parent().appendTo(row);
        
        $('<span class="playerName"></span>').text(user.name).wrap('<td></td>').parent().appendTo(row);
        
        if (user.id == userid) {
            $('<div class="stateMe"></div>').text('').wrap('<td></td>').parent().appendTo(row);
        } else {
            if (user.state == 0)
            {
                $('<div class="stateWaiting"></div>').text('PLAY!').click(function() {
                    oppid = user.id;
                    serverSelectPlayer(user.id);
                }).wrap('<td></td>').parent().appendTo(row);
                
            }
            else
                $('<div class="statePlaying"></div>').text('Playing').wrap('<td></td>').parent().appendTo(row);
        }

        $('<span class="spanFPS"></span>').text(parseInt(user.fps)).wrap('<td></td>').parent().appendTo(row);
        
        $('<span class="spanCountry"></span>').text(user.country).wrap('<td></td>').parent().appendTo(row);
        
        tBody.append(row);    
    });
}

function serverSelectPlayer(oppid) {
    $("#userlist").hide();
    changeChatMode(MODE_CHAT_LOBBY, false);
    game_state = STATE_MULTI_MESSAGE; game_message = "Waiting for accept...";
    send({
        type: TICK_SELECT,
        data: {
            id: userid,
            opponent: oppid
        }
    });
    
}

function togglePause() {
    if (game_state == STATE_RUN)
    {
        game_pause = !game_pause;
        sendTick(game_pause?TICK_PAUSE:TICK_RESUME);
    }     
}

function getUser(id) {
    for(var i = 0; i < userList.length; i++) {
        if (userList[i].id == id)
            return userList[i];
    }
}

function playAgain() {
    sendTick(TICK_PLAY_AGAIN);
    game_state = STATE_MULTI_WAIT;    
}

function processIncomingData(item) {
    if (item.error)
    {
        //alert(item.msg);
        gotoLobby();
        return false;
    } else {
        var data = item.data;
        switch(item.type) {
            case TICK_ERROR:
                if (data.code == USER_LIMIT)
                {
                    game_state = STATE_ERROR;
                    game_message = data.message;
                    error_callback = function() {
                        game_state = STATE_MAIN_MENU;
                    };
                }
                
                break;
            case TICK_REGISTER: 
                userid = data.id;       
                keepAliveTimer = setInterval(serverKeepAlive, 2000);
                gotoLobby();
                        
                break;
            case TICK_USERLIST:
                refreshUserList(data);
                break;
            case TICK_MATCH_REQUEST:
                if(confirm('Do you want to play with ' + data.name + '?'))
                    sendTick(TICK_MATCH_ACCEPT);
                else
                    sendTick(TICK_MATCH_REJECT);
                
                break;
            case TICK_NEW_GAME:
                $("#userlist").hide();
                changeChatMode(MODE_CHAT_PRIVATE, true);
                if (data.host.id == userid)
                {
                    oppid = data.opp.id;
                    oppName = data.opp.name;
                    isHost = true;                            
                } else {
                    oppid = data.host.id;
                    oppName = data.host.name;
                    isHost = false;                            
                }
                IS_SERVE = isHost;
                game_state = STATE_MULTI_RESPONSE;
                break;
            case TICK_MATCH_START:
                //clearInterval(keepAliveTimer);
                //keepAliveTimer = null;
                startMultiTicker();
                startGame();
                break;
            case TICK_HIT:
                oppInfo.hitID = data.hitid;
                oppInfo.hitX = parseFloat(data.x);
                oppInfo.hitY = parseFloat(data.y);
                oppInfo.curveX = parseFloat(data.curveX);
                oppInfo.curveY = parseFloat(data.curveY);
                oppInfo.paddleX = parseFloat(data.x);
                oppInfo.paddleY = parseFloat(data.y);
                oppInfo.speedX = data.speedX,
                oppInfo.speedY = data.speedY,
                oppInfo.success = true;
                
                if (game_state == STATE_SUSPEND)
                    start();
                
                break;
            case TICK_PADDLEPOS:
                oppInfo.paddleX = data.x;
                oppInfo.paddleY = data.y;
                oppMoveFPS = parseFloat(data.fps);
                break;
            case TICK_LOST:
                oppInfo.hitID = data.hitid;
                oppInfo.hitX = data.x;
                oppInfo.hitY = data.y;
                oppInfo.paddleX = data.x;
                oppInfo.paddleY = data.y;
                oppInfo.success = false;
                break;
            case TICK_MATCH_REJECT:
            case TICK_GO_LOBBY:
                if (data && data.message)
                    bonus_message = data.message;
                else
                    bonus_message = "";
                gotoLobby();
                break;
            case TICK_PAUSE:
                if (game_state == STATE_RUN)
                    game_pause = true;                
                break;
            case TICK_RESUME:
                if (game_state == STATE_RUN)
                    game_pause = false;                
                break;
            case TICK_LOBBY_CHAT:
                if (chat_mode == MODE_CHAT_LOBBY)
                    addChatMessage(data);
                break;
            case TICK_GAME_CHAT:
                if (chat_mode == MODE_CHAT_PRIVATE)
                    addChatMessage(data);
                break;
        }
    }
}

function gotoLobby(gameEnd, msgToOpp) {
    game_state = STATE_MULTI_LOBBY;
    $("#userlist").show();
    changeChatMode(MODE_CHAT_LOBBY, true);
    if (gameEnd)
    {
        var data = {};
        if (msgToOpp)
            data.message = msgToOpp;
        sendTick(TICK_GAME_END, data);        
    }
}

function isChatFocus() {
    var activeObj = document.activeElement;    
    return activeObj.tagName == "TEXTAREA";    
}

function startMultiTicker() {
    if (multiTicker == null)
        multiTicker = setInterval(mainTick, 100);    
}

function stopMultiTicker() {
    if (multiTicker == null)
        clearInterval(multiTicker);
    multiTicker = null;    
}


function mainTick() {
    sendTick(TICK_PADDLEPOS, {
        x: padPos.x,
        y: padPos.y,
        fps: parseInt(moveFPS, 10),
    });
}

function sendTick(type, data) {
    if (data == null)
        data = {id: userid};
    else
        data.id = userid;
        
    send({
        type: type,
        data: data
    });
}


function send(data)
{
    if (data)
    {
        try {
            socket.send(JSON.stringify(data));
        } catch(ex) {	
        }
    
    }
}

function addChatMessage(data) {
    var container = $("#chatWindowContent");
    var tsText = data.name + ':';
    var msgItemSpan = $('<span class="chatWindowMessageFrom">' + tsText + '&nbsp;<span class="chatWindowMessageContent">' + data.message + '</span></span>');
    var msgItem = $('<div class="chatWindowMessage"></div>').append(msgItemSpan);    
    container.append(msgItem).scrollTop(container[0].scrollHeight);
    
	if (container.children().length > 500) {
    	container.find('.chatMessage:lt(' + container.children().length - 500 + ')').remove();
	}
}

function changeChatMode(mode, show) {
    if (chat_mode != mode)
    {
        chat_mode = mode;
        $("#chatWindowContent").empty();
    }
    if (show)
        $("#chatwindow").show();
    else
        $("#chatwindow").hide();
    
}

function checkChatBoxInputKey(event)
{
    var textarea = $("#chatWindowInput textarea");
    var msg = textarea.val();
    if(event.keyCode == 13 && event.shiftKey == 0)  
	{
        msg = msg.replace(/^\s+|\s+$/g,"").replace(/<[^>]*>?/g, ""); //trim
		msg = msg.substring(0, 100);
        textarea.val('');
        textarea.focus();
        if (msg != '') 
		{
            sendTick(chat_mode == MODE_CHAT_PRIVATE?TICK_GAME_CHAT:TICK_LOBBY_CHAT, {
                message: msg
            })
        }

        return false;
    } else {
		//Hossz figyelés
		return (msg.length < 100);
	}

}