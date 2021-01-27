# Mailscript templates: GitHub action failure to notification

You can use this template to trigger OS notifications whenever a GitHub action run fails.

In this template we will achieve this by redirecting github emails through a mailscript email address (or the subset related to a particular github org), then setting a workflow that forwards to a mailscript daemon running on your local machine to bridge to the OS for notifications.

## Workflow

Replace the `<username>` text with your mailscript `username` and `<personal-email>` with the email address github emails should be forwarded to (this is also where the github verification email will be sent).

```yml
version: '0.2'
addresses:
  github@<username>.mailscript.com:
    keys:
      - name: owner
        read: true
        write: true
triggers:
  - name: github-action-failed
    composition:
      - criteria:
          metadata.github.pr.buildFailed: true
actions:
  - name: mylaptop
    type: daemon
    config:
      daemon: mylaptop
  - name: forward-to-personal-email
    type: mailscript-email
    config:
      key: owner
      from: github@<username>.mailscript.com
      forward: <personal-email>
      type: forward
workflows:
  - name: forward-github-to-personal
    input: github@<username>.mailscript.com
    action: forward-to-personal-email
  - name: github-action-failures-to-daemon
    input: github@<username>.mailscript.com
    trigger: github-action-failed-trigger
    action: mylaptop
```

## Manual setup

Clone this repository locally.

Setup a new mailscript address specifically for dealing with github emails (replacing `<username>` text with your username):

```sh
mailscript addresses:add --address github@<username>.mailscript.com
```

Setup an auto-forward of all emails coming into onto your preferred email address:

```sh
mailscript actions:add --name forward-to-personal --forward <personal-email> --from github@<username>.mailscript.com

mailscript workflows:add --name forward-github-to-personal --input github@<username>.mailscript.com --action forward-to-personal
```

Change github settings:

```sh
TBD
```

Setup a workflow that waits for PR failed emails:


```sh
mailscript actions:add --name mylaptop --daemon mylaptop

mailscript triggers:add --name github-action-failed --property metadata.github.pr.buildFailed --equals true

mailscript workflows:add --name github-action-failures-to-daemon --input github@<username>.mailscript.com --trigger github-action-failed --action mylaptop
```

At the root of this repo run npm to install the node dependencies:

```sh
npm install
```

Run a local daemon using the daemon named in the workflow (i.e. `mylaptop`) that triggers the `notify.js` script whenever a Github Action run failed email is received:

```sh
mailscript daemon --daemon mylaptop command "node ./notify.js"
```

The contents of the emails is passed to the script as stringified json within the environment variable `payload`.