const github = require('@actions/github');
const core = require('@actions/core');

const myToken = core.getInput('myToken');
const octokit = new github.GitHub(myToken);
const context = github.context;

console.log(context);
