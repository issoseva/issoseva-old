import os
from fabric.api import settings, cd, run, local, env

env.use_ssh_config = True

def deploy(branch='master'):
    # If not in CI mode push the latest dir
    if not os.environ.get('CI', False):
        local('git push')

    with settings(user='root', host_string='issoseva.org'):
        with cd('/root/issoseva.org'):
            run('mkdir -p logs')
            run('git fetch origin %s' % branch)
            run('git reset --hard origin/%s' % branch)
            run('yarn install')
            run('yarn build')
            run('pm2 restart app.json')
