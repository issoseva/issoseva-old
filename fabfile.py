from fabric.api import settings, cd, run

def deploy():
    with settings(user='root', host_string='new.issoseva.org'):
        with cd('/root/issoseva.org'):
            run("pm2 stop app.json")
            run("git pull")
            run("yarn install")
            run("pm2 start app.json")
