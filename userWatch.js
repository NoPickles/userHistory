var express     =   require("express");
var app         =   express();

var request     =   require('request'),
    mongoose    =   require('mongoose'),
    Log         =   require('./models/userHisotry'),
    config      =   require('./config.js'),
    bodyParser  =   require("body-parser");
    

channelList = config.channelList;
nameList    = config.nameList;

var conList = new Object();

mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost/userHistory', { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", 'ejs');
app.use(express.static(__dirname + "/public"));

app.get('/', function(req, res){
    res.render('hello');
});

app.get("/user/:twitchID", function(req, res){
    
    Log.find({ user: req.params.twitchID}, function(err, userLogs){

        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(userLogs));
        }

    });
});

app.listen(3000, function(){
    console.log("Serving");
});

var scanChannels = function(channelList){

    console.clear()

    for (let i = 0; i < channelList.length; i++) {
        getViewers(channelList[i])
    }
};

let getViewers = function(channel){
    var promise = new Promise(function(resolve, reject){
        request(
            {   
                method: 'GET',
                uri: 'https://tmi.twitch.tv/group/user/' + channel + '/chatters',
                json: true
            },
            function(error, response, body){
                //console.log('statusCode:', response && response.statusCode);
                //TODO fix error where response is undefined
                
                if (response.statusCode === undefined) {
                    reject();
                } else {
                    if (response.statusCode == 200) {

                        var chatters = body.chatters;

                        let viewList = [].concat(chatters.vips, chatters.viewers, chatters.moderators);
        
                        let viewObj = {
                            channel : channel,
                            list    : viewList
                        }
                        resolve(viewObj);
                    }
                }
            }
        )
    });
    
    promise
        .then(checkViewers)
        .then(displayTime)
        .catch(function(){
        });
};

let checkViewers = function(viewObj){  
    nameList.forEach(name => {
        if(viewObj.list.includes(name)){

            let logObj = {
                user    : name,
                channel : viewObj.channel,
                time    : new Date()
            };
            if(logObj.channel === config.channelList[0]){
                consoleTime(logObj);
            }
            saveTime(logObj);
        }
    });
};

let saveTime = function(object){
    //save time to mongo db
    // { channel: "hasanabi", chatter: "nopickles", timeStamp}
    var history = new Log(object);

    history.save(function(err, history){
        if(err) return console.error(err);
    })
};

let consoleTime = function(dateObj){
    //Save list of recent logs
    let consolObj = dateObj;
    var localTime = consolObj.time.toString();

    conList[consolObj.user] = localTime;
};

let displayTime = function(){

    let displayList = conList;

    for (const key of Object.keys(displayList)){

        var middle = "";

        for (let i = key.length; i < 15; i++){
            middle += " ";
        }
        console.log(key, middle , ':', displayList[key]);
    }
};



setInterval(() => scanChannels(channelList), 10000); //DOn't forget 

