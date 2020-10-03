var express     =   require("express");
var app         =   express();

var request     =   require('request'),
    mongoose    =   require('mongoose'),
    Log         =   require('./models/userHisotry'),
    config      =   require('./config.js'),
    bodyParser  =   require("body-parser");
    

channelList = config.channelList;
nameList    = config.nameList;

var consoleList = new Object();
 
 //var time = new Date();
 
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
    for (let i = 0; i < channelList.length; i++) {
        getViewers(channelList[i])
    }
}

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
                    console.log('error: ' + response.statusCode);
                    reject();
                } else {
                    if (response.statusCode == 200) {
                        var chatters = body.chatters;

                        if (typeof chatters === 'undefined'){
                            console.log('nothing');
                        } else {
                            let viewList = [].concat(chatters.vips, chatters.viewers, chatters.moderators);
        
                            let viewObj = {
                                channel : channel,
                                list    : viewList
                            }
        
                            resolve(viewObj);
                        }
                    }
                }
            }
        )

    });

    promise
        .then(checkViewers);
};


let checkViewers = function(viewObj){  
    nameList.forEach(name => {
        if(viewObj.list.includes(name)){
            markTime(viewObj.channel, name);
        }
    });
};

let markTime = function(channel, name){

    //add time to a mongo database
    // { channel: "hasanabi", chatter: "nopickles", timeStamp}
    
    let obj = {
        user    : name,
        channel : channel,
        time    : new Date()
    };

    if (obj.channel === channelList[0]) {
        consoleTime(obj);
    }
    //Calls consoleTime to show the latest finds for 1st channel in channelList 

    var history = new Log(obj);

    history.save(function(err, history){
        if(err) return console.error(err);
    })
};

let consoleTime = function(dateObj){
    
    var localTime = dateObj.time.toString();

    consoleList[dateObj.user] = localTime;

    console.clear();

    for (const key of Object.keys(consoleList)){
        console.log(key, ":" , consoleList[key]);
    }
};




setInterval(() => scanChannels(channelList), 10000);

