#!/bin/bash

npm run upyun pro
function proDeploy(){

}


function testDeploy(){
  npm run upyun test
}

echo "请输入当前代码发布环境：[ 1:测试环境 2:线上环境 ]"
read current
if [[ $current == 1 ]]; then
  testDeploy
elif [[ $current == 2 ]]; then
  proDeploy
fi




