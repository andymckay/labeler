Automatically labels issues, by adding new labels to the issue. You define the labels you'd like to add to your issues in the YAML file.

To add it to your workflow:

```
    - uses: andymckay/labeler@1.0.0
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        labels: "needs-triage, bug"
```

This adds the `needs-triage` and `bug` labels to the issue. The most common approach is to do this when issues are created, you can do this with the following in your workflow file:

```
on: 
  issues:
    types: [opened]
```

That's it.
