# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

  config.ssh.forward_x11 = true

  config.vm.box = "puphpet/ubuntu1404-x64"

  #config.vm.synced_folder ".", "/musfinder", :nfs => true

  config.vm.network "private_network", ip: "192.168.100.202"

  config.vm.provision "shell", inline: <<-SHELL

      sudo apt-get update
      sudo apt-get install -y python-pip git

      sudo pip install -r /musfinder/requirements.txt
  SHELL
end
