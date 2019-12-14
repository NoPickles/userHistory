var mongoose = require('mongoose');

var userHistorySchema = new mongoose.Schema({
    user        :   String,
    channel     :   String,
    time        :   String
});

module.exports = mongoose.model("Log", userHistorySchema);