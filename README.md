Automatically adds or removes labels from issues. You define the labels you'd like to add and/or remove in the YAML file. You can also specify if an issue should be ignored if an assignee has been added.

To add it to your workflow:

```yml
    - uses: andymckay/labeler@1.0.0
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        add-labels: "needs-triage, bug"
        ignore-if-assigned: true
```

This adds the `needs-triage` and `bug` labels to the issue. The most common approach is to do this when issues are created, you can do this with the following in your workflow file:

```yml
on:
  issues:
    types: [opened]
```

The parameter `ignore-if-assigned` checks at the time of the action running if the issue has been assigned to anyone. If set to `True` and the issue is assigned to anyone, then no labels will be added or removed. This can be helpful for new issues that immediatly get labels or assignees and don't require any action to be taken.

This action can also be used to remove labels from an issue. Just pass the label(s) to be removed separated by commas.

```yml
    - uses: andymckay/labeler@1.0.0
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        remove-labels: "help-wanted"
        ignore-if-assigned: false
```

An example use-case would be, to remove the `help-wanted` label when an issue is assigned to someone. For this, the workflow file would look like:

```yml
on:
  issues:
    types: [assigned]
```
