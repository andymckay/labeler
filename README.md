Automatically adds or removes labels from issues, pull requests and project cards.


## Supported Github events
- 'issues'
- 'pull_request'
- 'project_card'

## repo-token
To use this action a github access token is required since the github api is used. See the [oficial documentation](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) for more info.


## add-labels & remove-labels
to add or remove labels the parameters are:
- `add-labels`
- `remove-labels` 

They may receive multiple labels separated by commas.
They also may be used together. 

```yml
add-labels: 'label1, label2'
remove-labels: 'label3, label4'
```

## Complete 'basic' usage

```yml
name: issue-automation

on:
  issues:
    types: [opened]
  pull_request:
    types: [opened]
  project_card:
    types: [moved]

jobs:
  automate-issues-labels:
    runs-on: ubuntu-latest
    steps:
      - name: initial labeling
        uses: andymckay/labeler@master
        with:
          repo-token: ${{secrets.GH_TOKEN}}
          add-labels: "needs-triage, bug"
          remove-labels: "in progress"

```

This runs on 3 types of events:
- `issues` creation
- `pull_request` creation
- `project_card` move

This adds the labels:
- `needs-triage`
- `bug` 

And removes the label `in progress`.

## ignore-if-assigned

The parameter `ignore-if-assigned` checks at the time of the action running if the issue has been assigned to anyone. If set to `True` and the issue is assigned to anyone, then no labels will be added or removed. This can be helpful for new issues that immediatly get labels or assignees and don't require any action to be taken.

An example use-case would be, to remove the `help-wanted` label when an issue is assigned to someone. For this, the workflow file would look like:

```yml
name: issue-automation

on:
  issues:
    types: [assigned]

jobs:
  automate-issues-labels:
    runs-on: ubuntu-latest
    steps:
      - uses: andymckay/labeler@master
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          remove-labels: "help-wanted"
          ignore-if-assigned: false
```

## ignore-if-labeled

The parameter `ignore-if-labeled` checks at the time of the action running if the issue has been labeled. If set to `True` and the issue is labeled, then no labels will be added or removed. This can be helpful for new issues that immediatly get labels or assignees and don't require any action to be taken.

An example use-case would be, to add the `needs-triage` label when an issue is oppened without labels. For this, the workflow file would look like:

```yml
name: issue-automation

on:
  issues:
    types: [opened]

jobs:
  automate-issues-labels:
    runs-on: ubuntu-latest
    steps:
      - uses: andymckay/labeler@1.0.2
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          add-labels: "needs-triage"
          ignore-if-labeled: true
```
