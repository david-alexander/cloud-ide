async function fakeDockerDaemon()
{
    const express = require('express');
    const util = require("util");
    const childProcess = require("child_process");

    async function getImageSha(imageName)
    {
        let lsOutput = (await util.promisify(childProcess.exec)('img ls')).stdout.split('\n');
        for (line of lsOutput)
        {
            let parts = line.split('\t');
            if (parts[0] == imageName || parts[0] == `docker.io/library/${imageName}`)
            {
                return parts[4].trim().split(':')[1];
            }
        }
    
        return '';
    }

    let app2 = express();
    app2.use(express.raw({ type: "*/*" }));
    app2.get('/:version/version', async (req, res) => {
        res.status(200).end(JSON.stringify({
            "Version": "1.24.0",
            "Os": "linux",
            "KernelVersion": "3.19.0-23-generic",
            "GoVersion": "go1.6.3",
            "GitCommit": "deadbee",
            "Arch": "amd64",
            "ApiVersion": "1.24",
            "BuildTime": "2016-06-14T07:09:13.444803460+00:00",
            "Experimental": true
       }));
    });
    app2.get('/:version/images/:image/json', async (req, res) => {
        console.log('REQUESTED IMAGE', req.params.image);
        let sha = await getImageSha(req.params.image);
        res.status(200).end(JSON.stringify({Id: `${sha}`}));
    });
    app2.post('/:version/images/:image/push', async (req, res) => {
        console.log('PUSHING IMAGE', req.params.image, req.query.tag);
        await util.promisify(childProcess.exec)(`img push ${req.params.image}:${req.query.tag}`);
        res.status(200).end(JSON.stringify({}));
    });
    // app2.post('/:version/images/:image/tag', async (req, res) => {
    //     console.log('TAGGING IMAGE', req.params.image, req.query.repo, req.query.tag);
    //     await util.promisify(childProcess.exec)(`img tag ${req.params.image}:${req.query.tag}`);
    //     res.status(200).end(JSON.stringify({}));
    // });
    app2.get('/:version/images/:repo/:image/json', async (req, res) => {
        console.log('REQUESTED IMAGE', req.params.repo, req.params.image);
        let sha = await getImageSha(req.params.repo + '/' + req.params.image);
        res.status(200).end(JSON.stringify({Id: `sha256:${sha}`}));
    });
    app2.post('/:version/images/:repo/:image/push', async (req, res) => {
        console.log('PUSHING IMAGE', req.params.repo, req.params.image, req.query.tag);
        await util.promisify(childProcess.exec)(`img push ${req.params.repo}/${req.params.image}:${req.query.tag}`);
        res.status(200).end(JSON.stringify({}));
    });
    app2.all(/.*/, async (req, res) => {
        console.log('DOCKER REQUEST', req.method, req.url, req.body);
        res.status(400).end();
    }); 
    app2.listen('/var/run/docker.sock');
}
fakeDockerDaemon();
