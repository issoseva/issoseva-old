from fabric.api import settings, cd, run, local
from fabric.network import ssh

ssh.util.log_to_file("paramiko.log", 10)

def deploy(branch='master'):
    with settings(user='root', host_string='issoseva.org'):
        with cd('/root/issoseva.org'):
            run('mkdir -p logs')
            run("pm2 delete app.json")
            run("git fetch origin %s" % branch)
            run("git reset --hard origin/%s" % branch)
            run("yarn install")
            run("pm2 start app.json")
