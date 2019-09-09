const github = require('@actions/github');
const core = require('@actions/core');

async function label() {
    const myToken = core.getInput('repo-token');
    const octokit = new github.GitHub(myToken);
    const context = github.context;

    let labels = context.payload.issue.labels.map(label => label.name);
    if (labels.includes["needs-triage"]) {
        return false;
    }
    labels.push("needs-triage");

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
      (result) => {
          if (result) {
              console.log(`Labelled ${result}`);
          } else {
              console.log(`Needs-triage already exists, no need to add.`);
          }
      },
      (err)  => { console.log(err) }
   )
   .then(
       () => { process.exit() }
    )