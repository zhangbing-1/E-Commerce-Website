#!/bin/bash

function proDeploy(){
  ssh -i ~/.ssh/id_rsa azj@47.104.184.42 " mkdir -p /home/azj/frontend/fe-activitys/codeProxy "
  scp -i ~/.ssh/id_rsa -r ./*.html azj@47.104.184.42:/home/azj/frontend/fe-activitys/codeProxy
  ssh -i ~/.ssh/id_rsa azj@47.104.184.42 "
    ssh web1 'mkdir -p /home/azj/fe-project/activitys/codeProxy'
    scp -r /home/azj/frontend/fe-activitys/codeProxy/* web1:/home/azj/fe-project/activitys/codeProxy
    ssh web2 'mkdir -p /home/azj/fe-project/activitys/codeProxy'
    scp -r /home/azj/frontend/fe-activitys/codeProxy/* web2:/home/azj/fe-project/activitys/codeProxy
    ssh web3 'mkdir -p /home/azj/fe-project/activitys/codeProxy'
    scp -r /home/azj/frontend/fe-activitys/codeProxy/* web3:/home/azj/fe-project/activitys/codeProxy
  "
}
