const github = require("@actions/github");
const core = require("@actions/core");

const requested = core
  .getInput("labels")
  .split(",")
  .map(x => x.trim());

async function label() {
  const myToken = core.getInput("repo-token");
  const octokit = new github.GitHub(myToken);
  const context = github.context;

  let labels = context.payload.issue.labels.map(label => label.name);
  for (let requestedLabel of requested) {
    if (!labels.includes(requestedLabel)) {
      labels.push(requestedLabel);
    }
  }

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
      // eslint-disable-next-line no-console
      console.log(`Labelled ${result} with ${requested}.`);
    },
    err => {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  )
  .then(() => {
    process.exit();
  });
