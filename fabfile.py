import os

from fabric import task
from fabric.connection import Connection

@task
def deploy(local, branch='master'):
    # If not in CI mode push the latest dir
    if not os.environ.get('CI', False):
        local.run('git push', echo=True)

    with Connection('issoseva.org', user='root') as server:
        cmd = ' && '.join([
            'cd /root/issoseva.org',
            'mkdir -p logs',
            'git fetch origin %s' % branch,
            'git reset --hard origin/%s' % branch,
            'yarn install',
            'yarn build',
            'pm2 restart app.json',
        ])
        server.run(cmd, echo=True)


