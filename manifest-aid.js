const glob = require('glob');
const fs = require('fs');
const crypto = require('crypto');

const buildDir = process.argv[2];

glob(`${buildDir}precache-manifest.*.js`, {}, function (er, files) {
    if (files.length === 1) {
        const file = files[0];
        fs.readFile(file, 'utf8', function (err, data) {
            if (!err) {
                const splits = data.split('\n');
                const first = splits.shift();
                const last = splits.pop();
                const json = `[${splits.join('')}]`;
                const manifestList = JSON.parse(json);
                const dirList = [`${buildDir}bin/*.*`, `${buildDir}recorder/*.*`];
                const maniList = [];
                dirList.forEach((list) => {
                    glob(list, {}, function (innerErr, innerFiles) {
                        if (!innerErr) {
                            innerFiles.forEach((innerFile) => {
                                const d = innerFile.replace(buildDir, '');
                                maniList.push({
                                    'revision': crypto.createHash('sha-256').update(fs.readFileSync(innerFile, 'utf8')).digest('hex'),
                                    'url': `/${d}`
                                });
                            });
                            dirList.shift();
                            if (dirList.length === 0) {
                                manifestList.push.apply(manifestList, maniList);
                                let ddd = JSON.stringify(manifestList, null, 2).split('\n');
                                ddd.pop();
                                ddd.shift();
                                const final = `${first}\n${ddd.join('\n')}\n${last}`;
                                fs.writeFile(file, final, 'utf8', function (err) {
                                    if (err) return console.log(err);
                                });
                            }
                        }
                    });
                });
            } else {
                console.log(err, file);
            }
        });
    }
});