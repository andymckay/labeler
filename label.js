const github = require("@actions/github");
const core = require("@actions/core");

const labelsToAdd = core
  .getInput("add-labels")
  .split(",")
  .map(x => x.trim());

const labelsToRemove = core
  .getInput("remove-labels")
  .split(",")
  .map(x => x.trim());

async function label() {
  const myToken = core.getInput("repo-token");
  const octokit = new github.GitHub(myToken);
  const context = github.context;

  let labels = context.payload.issue.labels.map(label => label.name);
  for (let labelToAdd of labelsToAdd) {
    if (!labels.includes(labelToAdd)) {
      labels.push(labelToAdd);
    }
  }
  labels = labels.filter((value) => {
    return !labelsToRemove.includes(value);
  });

  await octokit.issues.update({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    issue_number: context.payload.issue.number,
    labels: labels
  });
  return context.payload.issue.number;
}

label()
  .then(
    result => {
      console.log(`Updated labels in ${result}. Added: ${labelsToAdd}. Removed: ${labelsToRemove}.`);
    },
    err => {
      console.log(err);
    }
  )
  .then(() => {
    process.exit();
  });
