from fabric.api import settings, cd, run, local, env

env.use_ssh_config = True

def deploy(branch='master'):
    local('git push')
    with settings(user='root', host_string='issoseva.org'):
        with cd('/root/issoseva.org'):
            run('mkdir -p logs')
            run('git fetch origin %s' % branch)
            run('git reset --hard origin/%s' % branch)
            run('yarn install')
            run('yarn build')
            run('pm2 restart app.json')
