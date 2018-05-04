:

scp -i ~/.ssh/id_rsa -r ./wx.html azj@47.104.184.42:/home/azj/frontend/fe-activitys/
ssh -i ~/.ssh/id_rsa azj@47.104.184.42 "
  scp -r /home/azj/frontend/fe-activitys/wx.html web1:/home/azj/fe-project
  scp -r /home/azj/frontend/fe-activitys/wx.html web2:/home/azj/fe-project
  scp -r /home/azj/frontend/fe-activitys/wx.html web3:/home/azj/fe-project
"
