var mongoose = require('mongoose');

var userHistorySchema = new mongoose.Schema({
    channel     :   String,
    user        :   String,
    time        :   String
});

module.exports = mongoose.model("userLog", userHistorySchema);