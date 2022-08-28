sudo npm install lib-jitsi-meet --force && sudo make
sudo systemctl restart prosody
sudo systemctl restart jicofo
sudo systemctl restart jitsi-videobridge2
sudo service nginx restart
