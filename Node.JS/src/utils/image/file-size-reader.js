'use strict';

const fs = require('fs');

export default function getFilesizeInBytes(fileName) {
    let stats = fs.statSync(fileName);
    let fileSizeInBytes = stats['size'];
    return fileSizeInBytes;
}
