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
  const ignoreIfLabeled = core.getInput("ignore-if-labeled");
  const octokit = new github.GitHub(myToken);
  const context = github.context;
  const repoName = context.payload.repository.name;
  const ownerName = context.payload.repository.owner.login;
  let issueNumber;
  if (context.eventName === "issues") {
    issueNumber = context.payload.issue.number;
  } else {
    issueNumber = context.payload.number;
  }
  const team = core.getInput("team");

  // query for the most recent information about the issue. Between the issue being created and
  // the action running, labels or asignees could have been added
  const updatedIssueInformation = await octokit.issues.get({
    owner: ownerName,
    repo: repoName,
    issue_number: issueNumber
  });

  if (team && context.eventName === "pull_request") {
    const teamArr = team.split("/");
    const org = teamArr.shift();
    const teamSlug = teamArr.pop();
    const teamMembers = await octokit.request(
      `/orgs/${org}/teams/${teamSlug}/members`
    );
    const logins = teamMembers.data.map(member => member.login);
    for (let login of logins) {
      if (login === updatedIssueInformation.data.user.login) {
        return `No action being taken. Ignoring because the author of the issue or pull request is part of the ${team} team`;
      }
    }
  }

  if (ignoreIfAssigned) {
    // check if the issue has been assigned to anyone
    if (updatedIssueInformation.data.assignees.length !== 0) {
      return "No action being taken. Ignoring because one or more assignees have been added to the issue";
    }
  }

  let labels = updatedIssueInformation.data.labels.map(label => label.name);
  if (ignoreIfLabeled) {
    if (labels.length !== 0) {
      return "No action being taken. Ignoring because one or labels have been added to the issue";
    }
  }

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
