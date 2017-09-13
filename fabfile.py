from fabric.api import settings, cd, run, local, env
from fabric.network import ssh

env.use_ssh_config = True

def deploy(branch='master'):
    with settings(user='root', host_string='issoseva.org'):
        with cd('/root/issoseva.org'):
            run('mkdir -p logs')
            run("pm2 delete app.json")
            run("git fetch origin %s" % branch)
            run("git reset --hard origin/%s" % branch)
            run("yarn install")
            run("pm2 start app.json")
