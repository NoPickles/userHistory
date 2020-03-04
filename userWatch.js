var express     =   require("express");
var app         =   express();

var request     =   require('request'),
    mongoose    =   require('mongoose'),
    Log         =   require('./models/userHisotry'),
    config      =   require('./config.js'),
    bodyParser  =   require("body-parser");
    

 channelList = config.channelList;
 nameList    = config.nameList;

 //var time = new Date();
 
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost/userHistory', { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get('/', function(req, res){
    res.send('Hello World!');
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

let getViewers = function(channelList){

    request('https://tmi.twitch.tv/group/user/' + channelList[0] + '/chatters', function(error, response, body){

        let bodyparsed = JSON.parse(body);
        var chatters = bodyparsed.chatters;

        if ("vips" in chatters) {       
            let viewList = [].concat(chatters.vips, chatters.viewers, chatters.moderators);
            checkViewers(viewList, channelList[0]);
        }
        
        });

};

let checkViewers = function(viewList, channel){

    nameList.forEach(name => {
        if(viewList.includes(name)){
            markTime(channel, name);
        }
    });

};

let markTime = function(channel, name){

    //add time to a mongo database
    // { channel: "hasanabi", chatter: "nopickles", timeStamp}
    
    let obj = {
        user    : name,
        channel : channel,
        time    : new Date().toISOString()
    };

    var history = new Log(obj);

    history.save(function(err, history){
        if(err) return console.error(err);
        console.log(history);
    })

};


setInterval(() => getViewers(channelList), 1000);