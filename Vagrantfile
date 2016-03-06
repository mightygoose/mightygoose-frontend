# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

  config.ssh.forward_x11 = true

  config.vm.box = "puphpet/ubuntu1404-x64"

  config.vm.synced_folder ".", "/musfinder"

  config.vm.network "private_network", ip: "192.168.100.202"

  config.vm.provision "shell", inline: <<-SHELL

      sudo apt-get update
      sudo apt-get install -y git python-pip postgresql-9.4 libpq-dev python-dev postgres-xc

      sudo pip install pgcli

      #install node
      sudo curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash
      . ~/.nvm/nvm.sh
      nvm install 4.0
      nvm use stable

      cd /musfinder
      npm install
  SHELL
end
