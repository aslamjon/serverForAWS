const fs = require('fs');
const path = require("path");
const _ = require('lodash');

const writeData = (filename, content) => {
    fs.writeFile(filename, JSON.stringify(content, null, 4), 'utf8', (err) => {
        if (err) console.log(err);
    })
}

const handleError = (err, res) => {
	// console.log("ERROR", err);
	res
		.status(500)
		.contentType("text/plain")
		.send({ message: "Oops! Something went wrong!" });
};
// *****************- Images -**********************
async function saveImg(req, res, file) {
    try {
        const tempPath = file.path;
        let originalName = file.originalname;
    
        function addDateTime(name) {
            const newDate = new Date()
            const orginalNameArr = name.split(".")
            const fileType = orginalNameArr.pop()
            const getDate = newDate.toLocaleDateString().split('/').join('_');
            const getTime = newDate.toLocaleTimeString().split(' ')[0].split(':').join('_');
            const milliseconds = newDate.getMilliseconds();
            orginalNameArr.push(`_${getDate}_${getTime}_${milliseconds}`);
            orginalNameArr.push(`.${fileType}`);
            return orginalNameArr.join('');
        }
    
        originalName = addDateTime(originalName);
        const targetPath = path.join(__dirname, `./data/images/${originalName}`);
    
        // Create Img
        if (path.extname(file.originalname).toLowerCase() && (".png" || ".svg" || ".jpg")) {
            const resultRename = await rename(tempPath, targetPath)
            if (!resultRename) handleError('', res);
            else return originalName;
        } else {
            // Delete cache
            const resUnlik = await unlink(tempPath);
            if (!resUnlik) handleError('', res);
            else {
                res
                    .status(403).contentType("text/plain")
                    .send({ message: "Only .png, .svg, .jpg files are allowed!" });
            }
        }
    } catch (error) {
        throw new Error(`${error.message} from saveImg`)
    }
}

async function saveImgs(req, res, fieldnames=['file']) {
    try {
        if (!_.isNull(req.files)) {
            res.status(400).send({ message: `Bad request: please send ${fieldnames.join(', ')}` });
            req.files = [];
        } else if (req.files.length !== fieldnames.length) {
            for (let i = 0; req.files.length > i; i++) {
                // Delete cache
                const resUnlik = await unlink(req.files[i].path);
                if (!resUnlik) handleError('', res);
            }
            res.status(400).send({ message: `Bad request: please send ${fieldnames.join(', ')}` });
        } else {
            let imgs = {}
            // check fieldname
            for (let i = 0; fieldnames.length > i; i++) {
                if (!fieldnames.includes(req.files[i].fieldname)) res.status(400).send({ message: "Bad request" });
            }

            for (let i = 0; fieldnames.length > i; i++) {
                imgs[req.files[i].fieldname] = await saveImg(req, res, req.files[i]);
            }
            return imgs;
        }
    } catch (error) {
        // console.log(error)
        throw new Error(`${error.message} from saveImgs`);
        // throw new Error("IMAGE_IS_NOT_SAVED")
    }
}
// ********************************************************
function rename(previousName, newName) {
    // console.log("Rename", previousName, newName);
    return new Promise((resolve, reject) => {
        fs.rename(previousName, newName, err => {
            if (err) resolve(0);
            resolve(1)
        })
    })
}
function unlink(tempPath) {
    // console.log("UNLINK", tempPath);
    return new Promise((resolve, reject) => {
        fs.unlink(tempPath, err => {
            if (err) resolve(0)
            resolve(1)
        })
    })
}
// ************************- encoding and decoding -********************************

const encodingBase64 = filePath => {
    const file = fs.readFileSync(filePath, {encoding: 'base64'});
    // return file.toString('base64');
    return file;
};

const decodingBase64 = (data, fileName) => {
    let buff = new Buffer.from(data, 'base64');
    fs.writeFileSync(fileName, buff)
}

const encodingBase64OfText = (fileOrData) => {
    let buff = new Buffer(fileOrData);
    let base64data = buff.toString('base64');
    return base64data;
}

const decodingBase64OfText = (data) => {
    const file = fs.readFileSync(filePath);
    let buff = new Buffer(file, 'base64');
    let text = buff.toString('ascii');
    return text;
}

function addDateTime(name) {
    const newDate = new Date()
    const orginalNameArr = name.split(".")
    const fileType = orginalNameArr.pop()
    const getDate = newDate.toLocaleDateString().split('/').join('_');
    const getTime = newDate.toLocaleTimeString().split(' ')[0].split(':').join('_');
    const milliseconds = newDate.getMilliseconds();
    orginalNameArr.push(`_${getDate}_${getTime}_${milliseconds}`);
    orginalNameArr.push(`.${fileType}`);
    return orginalNameArr.join('');
}

module.exports = {
    writeData,
    rename,
    unlink,
    saveImg,
    saveImgs,
    encodingBase64,
    decodingBase64,
    encodingBase64OfText,
    decodingBase64OfText,
    addDateTime
}