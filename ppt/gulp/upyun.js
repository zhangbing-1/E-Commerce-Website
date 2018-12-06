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

let sourcePath = path.join(__dirname, '../src/');

let fileName = 'ppt.js'
client.putFile('ppt', fs.createReadStream(sourcePath + fileName), {}).then(res => {
  console.log(path + '===== success');
}).catch(res => {
  console.log(`${fileName} 上传失败`)
})
