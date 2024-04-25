// uploadedFilePathModel.js

const mongoose = require('mongoose');

const filePathSchema = new mongoose.Schema({
    path: String,
});

const UploadedFilePath = mongoose.model('UploadedFilePath', filePathSchema);

module.exports = UploadedFilePath;
