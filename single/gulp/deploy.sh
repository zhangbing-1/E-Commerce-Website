#!/bin/bash

function proDeploy(){
  npm run build
  npm run upyun pro

  ssh -i ~/.ssh/deploy azj@47.104.184.42 " mkdir -p /home/azj/frontend/fe-activitys/single "
  scp -i ~/.ssh/deploy -r ./build/*.html azj@47.104.184.42:/home/azj/frontend/fe-activitys/single
  ssh -i ~/.ssh/deploy azj@47.104.184.42 "
    ssh web1 'mkdir -p /home/azj/fe-project/activitys/single'
    scp -r /home/azj/frontend/fe-activitys/single/* web1:/home/azj/fe-project/activitys/single
    ssh web2 'mkdir -p /home/azj/fe-project/activitys/single'
    scp -r /home/azj/frontend/fe-activitys/single/* web2:/home/azj/fe-project/activitys/single
    ssh web3 'mkdir -p /home/azj/fe-project/activitys/single'
    scp -r /home/azj/frontend/fe-activitys/single/* web3:/home/azj/fe-project/activitys/single
  "
}


function testDeploy(){
  npm run test
  npm run upyun test
  ssh -i ~/.ssh/deploy root@47.104.172.172 " mkdir -p /home/activitys/single"
  scp -i ~/.ssh/deploy -r ./build/*.html root@47.104.172.172:/home/activitys/single
}

echo "请输入当前代码发布环境：[ 1:测试环境 2:线上环境 ]"
read current
if [[ $current == 1 ]]; then
  testDeploy
elif [[ $current == 2 ]]; then
  proDeploy
fi




