const github = require("@actions/github");
const core = require("@actions/core");

var labelsToAdd = core
  .getInput("add-labels")
  .split(",")
  .map(x => x.trim());

var labelsToRemove = core
  .getInput("remove-labels")
  .split(",")
  .map(x => x.trim());

/**
 * Obtain the issue number either from input or from the context
 * @param core - the core object
 * @param context - the context object
 * @returns {*|number} - issue/card/pr number if not provided by user.
 */
function getIssueNumber(core, context) {
  let issueNumber = core.getInput("issue-number");

  // return what is provided
  if (issueNumber) return issueNumber;

  // return the one found in issue
  issueNumber = context.payload.issue && context.payload.issue.number;
  if (issueNumber) return issueNumber;

  // return the one found in PR
  issueNumber =
    context.payload.pull_request && context.payload.pull_request.number;
  if (issueNumber) return issueNumber;

  let card_url =
    context.payload.project_card && context.payload.project_card.content_url;
  issueNumber = card_url && card_url.split("/").pop();

  return issueNumber;
}

async function label() {
  const myToken = core.getInput("repo-token");
  const ignoreIfAssigned = core.getInput("ignore-if-assigned");
  const ignoreIfLabeled = core.getInput("ignore-if-labeled");
  const octokit = new github.GitHub(myToken);
  const context = github.context;
  const repoName = context.payload.repository.name;
  const ownerName = context.payload.repository.owner.login;
  let issueNumber = getIssueNumber(core, context);

  if (issueNumber === undefined) {
    return "No action being taken. Ignoring because issueNumber was not identified";
  }

  labelsToAdd = labelsToAdd.filter(value => ![""].includes(value));

  labelsToRemove = labelsToRemove.filter(value => ![""].includes(value));

  // query for the most recent information about the issue. Between the issue being created and
  // the action running, labels or asignees could have been added
  var updatedIssueInformation = await octokit.issues.get({
    owner: ownerName,
    repo: repoName,
    issue_number: issueNumber
  });

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

  if (labelsToRemove.length != 0) {
    labels = labels.filter(value => !labelsToRemove.includes(value));
    await octokit.issues.update({
      owner: ownerName,
      repo: repoName,
      issue_number: issueNumber,
      labels: labels
    });
  } else {
    await octokit.issues.addLabels({
      owner: ownerName,
      repo: repoName,
      issue_number: issueNumber,
      labels: labels
    });
  }
  return `Updated labels in ${issueNumber}. Added: ${labelsToAdd}. Removed: ${labelsToRemove}.`;
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
