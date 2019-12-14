var request     =   require('request'),
    mongoose    =   require('mongoose'),
    Log         =   require('./models/userHisotry'),
    config      =   require('./config.js');
    

 channelList = config.channelList;
 nameList    = config.nameList;

 var time = new Date();

mongoose.connect('mongodb://localhost/userHistory');

let getViewers = function(channelList){

    request('https://tmi.twitch.tv/group/user/' + channelList[0] + '/chatters', function(error, response, body){

        let bodyparsed = JSON.parse(body);

        checkViewers(bodyparsed, channelList[0], nameList[0]);

        });

};

let checkViewers = function(bodyparsed, channel, name){

    //let category = ['vips', 'moderators', 'viewers'];

    console.log(bodyparsed.chatters.viewers.includes("nopickles_0"));
    
    console.log((new Date() - time - 10000));

    if(bodyparsed.chatters.viewers.includes(name)){
        markTime(channel, name);
    }
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


setInterval(() => getViewers(channelList), 10000);