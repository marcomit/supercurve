/*************************************
 *        SuperCurve Multi
 *              v1.1
 * https://github.com/icebob/supercurve
 * 
 * 
 *      Created: Norbert Mereg
 * **********************************/


/*
    TODO:
        - Match után kérdezze meg, hogy akar-e még játszani újra

*/

//Error codes
var NO_USER                 = 101;
var USER_PLAYING            = 102;
var USER_LIMIT              = 103;


//Command codes
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
var TICK_SELECT_OPP         = 512;
var TICK_PAUSE              = 513;
var TICK_RESUME             = 514;
var TICK_MATCH_ACCEPT       = 515;
var TICK_MATCH_REJECT       = 516;
var TICK_MATCH_REQUEST      = 517;
var TICK_LOBBY_CHAT         = 518;
var TICK_GAME_CHAT          = 519;
var TICK_PLAY_AGAIN         = 520;
var TICK_ERROR              = 521;

//Use-state codes
var USER_LOBBY              = 0;
var USER_WAIT_START         = 1;
var USER_WAIT_ACCEPT        = 2;         
var USER_PLAYING            = 3;
var USER_WAIT_AGAIN         = 4;

var MAX_USERS = 30;
var USER_ID = 1;
var users = [];

/*var fs = require('fs');
fs.readFile('./usersdata', function (err, data) {
  if (!err)
    users = JSON.parse(data);
});*/

const WebSocket = require('ws');

const wsServer = new WebSocket.Server({ port: 8080 });

console.log("SuperCurve Multi Server started on port 8080");

wsServer.on('connection', function(connection, request) {
    if (!originIsAllowed(request.headers.origin)) {
        console.log((new Date()) + " Connection from origin " + request.origin + " rejected.");
        connection.close();
        return;
    }

    console.log((new Date()) + " (" + users.length + ") Connection accepted from ", connection.remoteAddress);
    
    connection.on('message', function(message) {
        //console.log((new Date()) + "INCOMING: " + message);
        doWork(connection, message);
    });

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + " (" + users.length + ") Peer " + connection.remoteAddress + " disconnected.");
        //user törlése connection alapján
        for (var i = users.length - 1; i >= 0; i--)
        {
            var user = users[i];
            if (user.id === connection.userid)
            {
                if (user.opponent)
                {
                    //Ellenfél kiléptetése
                    var oppUser = getUser(user.opponent);
                    if (oppUser) {
                        send(oppUser, {
                            type: TICK_GO_LOBBY,
                            data: {
                                message: user.name + " disconnected."
                            }
                        });       
                        oppUser.status = USER_LOBBY;
                        oppUser.opponent = null;
                        
                    }
                }
                users.remove(i);
            }
        }
        UserlistChanged();    
        
    });
});

function originIsAllowed(origin) {
    return (origin == "http://localhost:3000");
}

function doWork(conn, _data) {
    try {   
        var data = JSON.parse(_data);
        switch(data.type)
        {
            case TICK_REGISTER: RegisterUser(conn, data.data); break;
            default: processData(data);
        }
    } catch (ex) {
        console.error('ERROR: ', ex);
    }
}

setInterval(function() {
    //CleanOldUsers();
    UserlistChanged();
    /*fs.writeFile('./usersdata',  JSON.stringify(users), function (err) {
        if (err)
            console.error(err);
        //console.timeEnd('saveData');
    });*/
}, 5000); 


//Új user regisztrálása
function RegisterUser(conn, data)
{
    if (users.length >= MAX_USERS)
    {
        var resp = {
            type: TICK_ERROR,
            data: {
                code: USER_LIMIT,
                message: "Sorry, server is full!"
            }
        };
        conn.send(JSON.stringify(resp));
        exit;
    }
    
    if (data.name)
    {
        var user = {
            id: USER_ID++,
            name: data.name,
            fps: 0,
            status: USER_LOBBY,
            isHost: false,
            lastAccess: new Date().valueOf(),
            opponent: null,
            geoip: data.geoip,
            connection: conn
        };
        conn.userid = user.id;
        users.push(user);
        
        var resp = {
            type: TICK_REGISTER,
            data: {
                id: user.id        
            }
        };
        send(user, resp);

        UserlistChanged();

        console.log((new Date()) + " New user: " + user.name + " (" + user.geoip.city + ", " + user.geoip.country + ")");
    }    
}

//Userlist változás miatt userlista szétküldése
function UserlistChanged() {
    if (users.length > 0)
        sendEveryoneInLobby({
            type: TICK_USERLIST,
            data: GetUserList()
        });
}

/*Leszakadt, kilépett userek törlése
function CleanOldUsers() {
    var bChanged = false;
    //karbantartás
    var now = new Date();
    for (var i = users.length - 1; i >= 0; i--)
    {
        var user = users[i];
        if (now.valueOf() - user.lastAccess > 10 * 1000)
        {
            if (user.opponent)
            {
                //Ellenfél kiléptetése
                var oppUser = getUser(user.opponent);
                if (oppUser)
                {
                    send(oppUser, {
                        type: TICK_GO_LOBBY,
                        data: {
                            message: user.name + " disconnected."
                        }
                    });                    
                    oppUser.status = USER_LOBBY;
                    oppUser.opponent = null;
                }
            }
        
            users.remove(i);
            if (user.connection)
                user.connection.close();
            bChanged = true;
        }
    }
    //if (bChanged)
        UserlistChanged();    
}*/

// kliensek számára küldhető userlista összeállítása
function GetUserList(data) {
    var result = [];
    if (data && data.id) 
    {
        var user = getUser(data.id);
        if (user)
            user.lastAccess = new Date().valueOf();
    }
    users.forEach(function(item) {
        if (item.status === 0)
        {
            result.push({
                id: item.id,
                name: item.name,
                fps: item.fps,
                state: item.status,
                country: item.geoip.country || '',
                countryCode: item.geoip.country_code || ''
            });
        }
    });
    users.forEach(function(item) {
        if (item.status !== 0)
        {
            result.push({
                id: item.id,
                name: item.name,
                fps: item.fps,
                state: item.status,
                country: item.geoip.country || '',
                countryCode: item.geoip.country_code || ''
            });
        }
    });
    return result;
}

//user objektum kikeresése ID alapján
function getUser(id) {
    for(var i = 0; i < users.length; i++)
        if (users[i].id == id)
            return users[i];
}

function processData(pack) {
    if (pack.type && pack.data)
    {
        //Feladó user kikeresése
        var user = getUser(pack.data.id);
        if (user)
        {
            user.lastAccess = new Date().valueOf();
        
            //Ellenfél kikeresése
            var oppUser = null;
            if (user.opponent)
                oppUser = getUser(user.opponent);    
                
            var data = pack.data;
            switch(parseInt(pack.type, 10)) {
                case TICK_KEEP_ALIVE:
                    user.fps = parseInt(data.fps, 10);
                    
                    break;
                case TICK_SELECT_OPP: 
                    var oppUser = getUser(data.opponent);
                    if (user && oppUser)
                    {
                        if (oppUser.status == USER_LOBBY)
                        {
                            user.opponent = oppUser.id;
                            oppUser.opponent = user.id;
                            
                            user.status = USER_WAIT_ACCEPT;
                            oppUser.status = USER_WAIT_ACCEPT;
                            
                            send(oppUser, {
                                type: TICK_MATCH_REQUEST,
                                data: {
                                    id: user.id,
                                    name: user.name
                                }
                            });                    
                            
                            UserlistChanged();
                        } else {
                            //Ellenfél már játszik
                            send(oppUser, {
                                type: TICK_GO_LOBBY,
                                data: {
                                    message: oppUser.name + " is playing."
                                }
                            });                    
                            
                        }
                        UserlistChanged();
                    }                    
                    
                    break;
                case TICK_PLAY_AGAIN:
                    user.status = USER_WAIT_AGAIN;
                    if (oppUser.status == USER_WAIT_AGAIN)
                        sendCommand(TICK_MATCH_START, user, oppUser); 
                    
                    break;
                case TICK_MATCH_ACCEPT:
                    if (user && oppUser)
                    {
                        user.isHost = true;
                        oppUser.isHost = false;
                        
                        user.status = USER_WAIT_START;
                        oppUser.status = USER_WAIT_START;
                        
                        newGame(user, oppUser);

                        UserlistChanged();
                    }                    
                    break;
                case TICK_MATCH_REJECT:
                    if (user && oppUser)
                    {
                        user.opponent = null;
                        oppUser.opponent = null;
                        
                        user.status = USER_LOBBY;
                        oppUser.status = USER_LOBBY;
                    
                        send(oppUser, {
                            type: TICK_GO_LOBBY,
                            data: {
                                message: oppUser.name + " has rejected."
                            }
                        });                    
                    }
                    break;
                case TICK_ROUND_READY: 
                    if (oppUser)
                    {
                        if (user.status == USER_WAIT_START)
                        {
                            user.status = USER_PLAYING;
                            if (oppUser.status == USER_PLAYING)
                                sendCommand(TICK_MATCH_START, user, oppUser);            
                        }
                    }
                    break;
                
                case TICK_HIT: 
                    if (oppUser)
                    {
                        send(oppUser, {
                            type: TICK_HIT,
                            data: data
                        });
                    }
                    
                    break;
                
                case TICK_LOST: 
                    if (oppUser)
                    {
                        send(oppUser, {
                            type: TICK_LOST,
                            data: data
                        });
                        user.status = USER_WAIT_START;
                        oppUser.status = USER_WAIT_START;
                    }
                    
                    break;
                
                case TICK_PADDLEPOS: 
                    if (oppUser)
                    {
                        send(oppUser, {
                            type: TICK_PADDLEPOS,
                            data: data
                        });
                    }
                    break;

                case TICK_PAUSE: 
                case TICK_RESUME: 
                    if (oppUser)
                    {
                        sendCommand(pack.type, oppUser);
                    }
                    break;
                
                case TICK_GAME_END:
                    if (oppUser)
                        send(oppUser, {
                            type: TICK_GO_LOBBY,
                            data: {
                                message: (data.message)?data.message:""
                            }
                        });                    
                    user.status = USER_LOBBY;            
                    user.opponent = null;
                    user.isHost = false;
                    
                    oppUser.status = USER_LOBBY;
                    oppUser.opponent = null;
                    oppUser.usHost = false;
                    
                    UserlistChanged();
                    
                    break;
                case TICK_LOBBY_CHAT:
                    sendEveryone({
                        type: TICK_LOBBY_CHAT,
                        data: {
                            id: user.id,
                            name: user.name,
                            countryCode: user.geoip.country_code || '',
                            message: data.message                            
                        }
                    })
                    
                    break;
                case TICK_GAME_CHAT:
                    if (oppUser)
                    {
                        var pack = {
                            type: TICK_GAME_CHAT,
                            data: {
                                id: user.id,
                                name: user.name,
                                countryCode: user.geoip.country_code || '',
                                message: data.message                            
                            }
                        };
                        send(oppUser, pack);
                        send(user, pack); 
                    }
                    break;
            }
        }
    }
}

function newGame(hostPlayer, oppPlayer) {
    var pack = {
        type: TICK_NEW_GAME,
        data: {
            host: {
                id: hostPlayer.id,
                name: hostPlayer.name
            },
            opp: {
                id: oppPlayer.id,
                name: oppPlayer.name
            }
        }
    };
    send(hostPlayer, pack);
    send(oppPlayer, pack);
    
    // saveToDB(TICK_NEW_GAME, hostPlayer, oppPlayer);
}

function sendCommand(type, p1, p2) {
    var pack = { type: type };
    if (p1) send(p1, pack);
    if (p2) send(p2, pack);
}

function sendEveryone(data) {
    for(var i = 0; i < users.length; i++)
        send(users[i], data);
}

function sendEveryoneInLobby(data) {
    for(var i = 0; i < users.length; i++)
        if (users[i].status == USER_LOBBY)
            send(users[i], data);
}


function send(user, data) {
    if (user.connection) {
        //console.log((new Date()) + " SEND: ", data);
        user.connection.send(JSON.stringify(data));
    }
}

function saveToDB(type, p1, p2) {
    try {
        var mysql = require('mysql').Client;
        
        var db = new mysql();
        
        db.user = 'supercurve';
        db.host = '127.0.0.1';
        db.port = 3306;
        db.database = 'supercurve';
        
        if (type == TICK_NEW_GAME)
        {
            db.query('insert into multi_log(p1_name, p1_country, p1_country_code, p1_city, p1_ip, p2_name, p2_country, p2_country_code, p2_city, p2_ip) values (?,?,?,?,?,?,?,?,?,?);', 
                [p1.name, p1.geoip.country, p1.geoip.country_code, p1.geoip.city, p1.connection.remoteAddress,
                p2.name, p2.geoip.country, p2.geoip.country_code, p2.geoip.city, p2.connection.remoteAddress], function(err, info) {
                if (err)
                    console.log(err);
            });
        }
        db.end();
    } catch(ex) {	
        console.error('DB Error: ', ex);
    }
}




function Exception(id) {
    var res = {
        error: id,
        msg: ''
    };
    switch(id)
    {
        case NO_USER: res.msg = 'User not exists!'; break;
        case USER_PLAYING: res.msg = 'User is playing!'; break;
    }
    
    return res;
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
