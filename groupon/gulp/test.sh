:

scp -i ~/.ssh/id_rsa -r ./F0VuxGKp4i.txt azj@47.104.184.42:/home/azj/frontend/fe-activitys/
ssh -i ~/.ssh/id_rsa azj@47.104.184.42 "
  scp -r /home/azj/frontend/fe-activitys/F0VuxGKp4i.txt web1:/home/azj/fe-project
  scp -r /home/azj/frontend/fe-activitys/F0VuxGKp4i.txt web2:/home/azj/fe-project
  scp -r /home/azj/frontend/fe-activitys/F0VuxGKp4i.txt web3:/home/azj/fe-project
"
