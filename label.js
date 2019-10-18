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
  const ignoreIfAssigned = core.getInput("ignore-if-assigned");
  const octokit = new github.GitHub(myToken);
  const context = github.context;
  const repoName = context.payload.repository.name;
  const ownerName = context.payload.repository.owner.login;
  const issueNumber = context.payload.issue.number;

  // query for the most recent information about the issue. Between the issue being created and
  // the action running, labels or asignees could have been added
  var updatedIssueInformation = await octokit.issues.get({
    owner: ownerName,
    repo: repoName,
    issue_number: issueNumber
  });

  if (ignoreIfAssigned) {
    // check if the issue has been assigned to anyone
    if (updatedIssueInformation.data.assignees.length != 0) {
      return "No action being taken. Ignoring because one or more assignees have been added to the issue";
    }
  }

  let labels = updatedIssueInformation.data.labels.map(label => label.name);
  for (let labelToAdd of labelsToAdd) {
    if (!labels.includes(labelToAdd)) {
      labels.push(labelToAdd);
    }
  }
  labels = labels.filter(value => {
    return !labelsToRemove.includes(value);
  });

  await octokit.issues.update({
    owner: ownerName,
    repo: repoName,
    issue_number: issueNumber,
    labels: labels
  });
  return `Updated labels in ${context.payload.issue.number}. Added: ${labelsToAdd}. Removed: ${labelsToRemove}.`;
}

label()
  .then(
    result => {
      // eslint-disable-next-line no-console
      console.log(result);
    },
    err => {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  )
  .then(() => {
    process.exit();
  });
