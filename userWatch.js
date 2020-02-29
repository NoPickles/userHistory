var request     =   require('request'),
    mongoose    =   require('mongoose'),
    Log         =   require('./models/userHisotry'),
    config      =   require('./config.js');
    

 channelList = config.channelList;
 nameList    = config.nameList;

 //var time = new Date();
 
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost/userHistory', { useNewUrlParser: true });

let getViewers = function(channelList){

    request('https://tmi.twitch.tv/group/user/' + channelList[0] + '/chatters', function(error, response, body){

        let bodyparsed = JSON.parse(body);
        let chatters = bodyparsed.chatters;

        let viewList = [].concat(chatters.vips, chatters.viewers, chatters.moderators);


        checkViewers(viewList, channelList[0]);

        });

};

let checkViewers = function(viewList, channel){

    nameList.forEach(name => {
        if(viewList.includes(name)){
            console.log('name marked');
            markTime(channel, name);
        }
        console.log('something marked');
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


setInterval(() => getViewers(channelList), 10000);