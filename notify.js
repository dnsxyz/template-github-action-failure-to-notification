const notifier = require('node-notifier');
const path = require('path');
const process = require('process');

const GITHUB_ICON = "";

function main(emailData) {
    if (!emailData.metadata || !emailData.metadata.github || !emailData.metadata.github.pr) {
        return
    }
    const { organization, repository, buildFailed, name, commit } = emailData.metadata.github.pr
    if (organization == null || repository == null || buildFailed == null || name == null || commit == null) {
        return
    }

    if (buildFailed) {
        notifier.notify({
            title: 'GitHub Action Run Failed\nvia Mailscript',
            message: 'PR ' + organization + "/" + repository + " - " + name + " (" + commit + ")",
            // icon: path.join(__dirname, GITHUB_ICON),
            sound: true,
            wait: false,
        })
    }
}

main(JSON.parse(process.env.payload));
