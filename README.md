# action-linear-create-issue

This is a [Github Action](https://github.com/features/actions) that allows to create project and issue links


## Inputs

| Input                 | Description                                                                        | Required |
|-----------------------|------------------------------------------------------------------------------------|----------|
| `linear-api-key`      | Linear API key generated from https://linear.app/settings/api . (e.g. `lin_api_*)` | ✅        |
| `scope`               | project or issue ids           | ✅       |
| `resource`       | UUID of the resource                  | ✅       |
| `name` | Descriptive name of the link            | ✅       |
| `target` | Destination URL             | ✅       |


## Example usage

### Create a comment with Linear Issue on Pull Request

```yaml
name: Create a link in the linear

on:
  workflow_dispatch:
  pull_request:
    branches:
      - main
    types: [opened, reopened]

jobs:
  comment-with-linear-issue-on-pull-request:
    runs-on: ubuntu-latest
    steps:
      - name: Find the Linear Issue
        id: findIssue
        uses: epsylabs/action-find-linear-issue@main
        with:
          linear-api-key: ${{secrets.LINEAR_API_KEY}}

      - name: Create issue
        id: create_issue
        uses: epsylabs/action-find-linear-issue@main
        with:
          linear-api-key: ${{secrets.LINEAR_API_KEY}}
          scope: issue
          resource: "${{ fromJson(steps.linear_info.outputs.linear-issue).project.id }}"
          name: "Test results report"
          target: https://example.com

      - name: Create comment in PR with Linear Issue link
        uses: peter-evans/create-or-update-comment@v2
        env:
          issue_identifier: ${{ fromJson(steps.findIssue.outputs.linear-issue).identifier }}
          issue_title: ${{ fromJson(steps.findIssue.outputs.linear-issue).title }}
          issue_url: ${{ fromJson(steps.findIssue.outputs.linear-issue).url }}
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          issue-number: ${{ github.event.pull_request.number }}
          body: |
            [${{ env.issue_identifier }}: ${{ env.issue_title }}](${{ env.issue_url }})
```
