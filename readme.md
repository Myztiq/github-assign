# GitHub action that auto-assigns issues to users on a given week

## Inputs

| Parameter    | Required | Description                                                                |
| ------------ | -------- | -------------------------------------------------------------------------- |
| `repo-token` | true     | The GITHUB_TOKEN, needed to update the Issue.                              |
| `assignees`  | true     | Comma separated list of user names. Those users will be randomly assigned to each other for code review buddies for the week |

## Example usage

Here's an example flow that auto-assigns tickets between two users:

```yml
name: Issue assignment

on:
    issues:
        types: [opened]

jobs:
    auto-assign:
        runs-on: ubuntu-latest
        steps:
            - name: 'Weekly auto assign code buddies'
              uses: Myztiq/github-assign@0.0.2
              with:
                  repo-token: ${{ secrets.GITHUB_TOKEN }}
                  assignees: octocat, octocat1
```
