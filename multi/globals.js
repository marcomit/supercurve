/*************************************
 *        SuperCurve Multi
 *              v1.0
 *     http://supercurve.sds.hu
 * 
 *      Created: Norbert Mereg
 *  E-mail: mereg.norbert@gmail.com
 * **********************************/
 
var STATE_MAIN_MENU     = 0;
var STATE_SUSPEND       = 1;
var STATE_RUN           = 2;
var STATE_NEXT_LEVEL    = 3;
var STATE_GAME_OVER     = 4;
var STATE_WIN           = 5;
var STATE_SAVE_SCORE    = 6;
var STATE_HIGHSCORES    = 7;

var STATE_MULTI_RESPONSE= 100;
var STATE_MULTI_WAIT    = 101;
var STATE_MULTI_LOBBY   = 102;
var STATE_MULTI_MESSAGE = 103;
var STATE_MULTI_DISCONNECT = 104;
var STATE_ERROR         = 105;

var BONUS_NONE          = 0;
var BONUS_CURVE         = 1;
var BONUS_SUPERCURVE    = 2;
var BONUS_MEGACURVE     = 3;
var BONUS_HYPERCURVE    = 4;
var BONUS_ACCURACY      = 5;
var BONUS_TIME          = 6;
var BONUS_CURVECOMBO    = 7;
var BONUS_LIFE          = 8;

var MODE_CHAT_LOBBY = 1;
var MODE_CHAT_PRIVATE = 2;


var canvas = null;
var context = null;

var mainTimer = null;
var lastDrawTime =null;
var lastMoveTime = null;
var lastStateTime = null;
var fps = 100;
var moveFPS = 100;
var oppMoveFPS = 100;
var lag_time = null;

var game_state = STATE_SUSPEND;
var game_message = "";
var game_mode = 1;
var game_pause = false;
var chat_mode = MODE_CHAT_LOBBY;
var error_callback = null;

var ball = null;
var comp = null;
var username = "Player";
var userid = -1;
var userFlag = new Image();
var oppInfo = {};
var oppid = -1;
var oppName = "";
var oppFlag = new Image();
var isHost = false;
var keepAliveTimer = null;
var multiTicker = null;
var highscores = [];
var userList = [];

var mouse = {
    x: 0,
    y: 0
}

var oldMouse = {
    x: 0,
    y: 0
}
var START_TIME = null;
var SCORE = 0;
var last_score = 0;
var elapsed_time = 0;
var curve_combo = 0;

var IS_SERVE = false;
var MAX_SERVE = 5;
var MAX_POINT = 11;
var TIME_MAX = 60; //1 minute 
var TIME_SCORE = 5;
var HIT_SCORE = 5;
var WALL_SCORE = 10;
var CURVE_SCORE = 25;
var SUPERCURVE_SCORE = 50;
var MEGACURVE_SCORE = 100;
var HYPERCURVE_SCORE = 250;
var CURVECOMBO_SCORE = 100;
var ACCURACY_SCORE = 100;
var LIFE_SCORE  = 200;
var bonus_message = "";

var POINT_PLAYER = 0;
var POINT_OPPONENT = 0;
var ROUND = 0;

var padSpeedX = 0.0;
var padSpeedY = 0.0;
var padPos = { x: 0, y: 0};
var hitID = 0;

var ZDepth = 25;
var CURVE_DECAY = 1.004;
var SPEED_DECAY = 1.0005;

var LEFT = 25;
var TOP = 25;
var WIDTH = 550;
var HEIGHT = 350;
var DEPTH = 70;

var PAD_WIDTH = 120;
var PAD_HEIGHT = 80;
var PAD_CORNER = 10;

var currentLevel = null;

var dev_mode = 0;
var mute = 0;
var hover_button = 0;
var sound_wallhit = null;
var sound_padhit = null;
var sound_padhit2 = null;
var sound_applause = null;
var sound_disappoint = null;
var img_bg = null;
var img_main = null;
var img_ball = null;
var img_ball_red = null;
var img_sound_on = null;
var img_sound_off = null;
