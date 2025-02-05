sudo apt update
sudo apt install -y curl
curl -L https://raw.githubusercontent.com/tj/n/master/bin/n | sudo bash -s lts

node -v
npm -v

sudo npm install -g pnpm

pnpm -v