Automatically adds or removes labels from issues. You define the labels you'd like to add and/or remove in the YAML file.

To add it to your workflow:

```
    - uses: andymckay/labeler@1.0.0
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        add-labels: "needs-triage, bug"
```

This adds the `needs-triage` and `bug` labels to the issue. The most common approach is to do this when issues are created, you can do this with the following in your workflow file:

```
on: 
  issues:
    types: [opened]
```

This action can also be used to remove labels from an issue. Just pass the label(s) to be removed separated by commas.

```
    - uses: andymckay/labeler@1.0.0
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        remove-labels: "help-wanted"
```

An example use-case would be, to remove the `help-wanted` label when an issue is assigned to someone. For this, the workflow file would look like:

```
on:
  issues:
    types: [assigned]
```
