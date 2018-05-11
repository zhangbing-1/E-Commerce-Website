/**
 * npm run upyun pro //同步生产
 * npm run upyun test //同步生产
 *
 */

let upyun = require("upyun");
let fs = require("fs")
let path = require("path")

const service = new upyun.Service('zongjie-web', 'liuchengyong', 'zongjie123');
const client = new upyun.Client(service);

console.log(`--------------------------资源文件同步又拍云 【${ process.argv[2] == 'pro' ? '线上环境' : '测试环境' }】-----------------------------------------`);
let sourcePath = path.join(__dirname, '../build');
let list = fs.readdirSync(sourcePath);

function readDirSync(list, index, path) {
  if (index >= list.length) return;
  var fileName = list[index];
  var info = fs.statSync(sourcePath + path + fileName);
  if (info.isDirectory()) { // 目录
    var fileList = fs.readdirSync(sourcePath + path + fileName);
    console.log(sourcePath + path + fileName);
    readDirSync(fileList, 0, path + fileName + '/');
    readDirSync(list, ++index, path);
  } else {
    uploadFile(path + fileName, fs.createReadStream(sourcePath + path + fileName),function(){
      readDirSync(list, ++index, path);
    })
  }
}

function uploadFile(path, file, callback) {
  var remoteFileName = process.argv[2] == 'pro' ? `activitys/sendBook/${path}` : `test/activitys/sendBook/${path}`
  client.putFile(remoteFileName, file, {}).then(res => {
    console.log(path + ' ===== success');
    callback();
  }).catch(res => {
    console.log(`${fileName} 上传失败`)
  })
}

readDirSync(list, 0, '/');









// list.forEach((fileName,index) => {
//   let remoteFileName = process.argv[2] == 'pro' ? `/${fileName}`: `test/${fileName}`
//   client.putFile(remoteFileName, fs.createReadStream(`${sourcePath}/${fileName}`), {}).then(res=>{
//     console.log(`${fileName} 上传至${remoteFileName}完毕`)
//   }).catch(res=>{
//     console.log(`${fileName} 上传失败`)
//   })
// })
