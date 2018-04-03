#!/bin/bash

function proDeploy(){
  ip=`curl ifconfig.me`
  echo "当前主机外网ip是：${ip}"
  if [[ $ip == '47.104.184.42' ]]; then
    cd /home/azj/frontend/fe-web
    echo "--------------------------同步代码-----------------------------------------"
    git fetch --all
    git reset --hard origin/master
    git pull
    cd mainSite/
    echo "--------------------------安装依赖-----------------------------------------"
    cnpm install
    echo "--------------------------清理build目录-----------------------------------------"
    npm run clean
    echo "--------------------------webpack 模块打包----------------------------------------"
    npm run build
    echo "--------------------------图片压缩-----------------------------------------"
    npm run imagemin
    npm run upyun pro
    echo "--------------------------线上环境分发 html-----------------------------------------"
    echo `scp ./build/*.html web1:/home/azj/fe-project/www` 'web1 完成'
    echo `scp ./build/*.html web2:/home/azj/fe-project/www` 'web2 完成'
    echo `scp ./build/*.html web3:/home/azj/fe-project/www` 'web3 完成'
  elif [[ condition ]]; then
    echo "当前环境不可发布版本"
  fi
}

function testDeploy(){
  npm run build
  scp -i ~/.ssh/deploy -r ./build/ root@47.104.172.172:/home/activitys/
}

echo "请输入当前代码发布环境：[ 1:测试环境 2:线上环境 3:同步脚本 4:本地发布线上 5:本地发布测试]"
read current
if [[ $current == 1 ]]; then
  testDeploy
elif [[ $current == 2 ]]; then
  proDeploy
elif [[ $current == 3 ]]; then
  cd /home/azj/frontend/fe-web
  git fetch --all
  git reset --hard origin/master
  git pull
elif [[ $current == 4 ]]; then
  ssh -i ~/.ssh/id_rsa azj@47.104.184.42 "
    cd /home/azj/frontend/fe-web/mainSite/
    npm run deploy
  "
elif [[ $current == 5 ]]; then
  echo "暂未实现"
else
  echo "请输入1或2"
fi




