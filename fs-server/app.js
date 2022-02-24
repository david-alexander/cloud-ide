const express = require('express');

const app = express();

async function shell(res, script, args, env, cwd = null)
{
    const childProcess = require("child_process");

    if (!cwd)
    {
        cwd = process.cwd();
    }

    console.log('shell', script, args, env);
    let proc = childProcess.spawn(script, args, { env: { ...process.env, ...env }, cwd });
    
    proc.stdout.on('data', (data) => console.log(data.toString('utf8')));
    proc.stderr.on('data', (data) => console.log(data.toString('utf8')));
    
    await new Promise((resolve, reject) => proc.on('exit', () => resolve()));
}

app.get('/test-endpoint', async (req, res) => {
    const uuid = require('uuid');
    let tempDir = `${uuid.v4()}`;
    let env = { REPO_URL: req.query.repoURL, GIT_BRANCH: req.query.branch, SRC_DIR: tempDir };
    await shell(res, 'sh', ['./get_source.sh'], env);
    res.redirect(`http://web.cloud-ide.desktop/#/source/${tempDir}`);
});

app.listen(8080);
