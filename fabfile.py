from fabric.api import settings, cd, run, local

def deploy(branch='master'):
    local('git push') # Ensure we have no local commits

    with settings(user='root', host_string='new.issoseva.org'):
        with cd('/root/issoseva.org'):
            run('mkdir -p logs')
            run("pm2 delete app.json")
            run("git fetch origin %s" % branch)
            run("git reset --hard origin/%s" % branch)
            run("yarn install")
            run("pm2 start app.json")
