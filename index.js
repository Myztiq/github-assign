// Credit for the base of this goes to https://github.com/pozil/auto-assign-issue
const core = require('@actions/core');
const github = require('@actions/github');
const Chance = require('chance')

function getMonday( date ) {
  var day = date.getDay() || 7;
  if( day !== 1 )
    date.setHours(-24 * (day - 1));
  return date;
}

function daysIntoYear(date){
  return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
}

function generateMapping(assigneeList) {
  const seed = daysIntoYear(getMonday(new Date()))
  const chance = new Chance(seed)

  const randomList = chance.shuffle(assigneeList)
  const mapping = {}
  randomList.forEach((person, index) => {
    if (index % 2 === 1) {
      const prevPerson = randomList[index - 1]
      mapping[person] = prevPerson
      mapping[prevPerson] = person
    }
  })

  if (randomList.length % 2 === 1) {
    const lastUser = randomList[randomList.length - 1]
    mapping[lastUser] = randomList[0]
  }

  return mapping;
}

const run = async () => {
  // Get octokit
  const gitHubToken = core.getInput('repo-token', { required: true });
  const octokit = github.getOctokit(gitHubToken);

  // Get repo and issue info
  const { repository, issue, sender } = github.context.payload;
  if (!issue) {
    throw new Error(`Couldn't find issue info in current context`);
  }
  const [owner, repo] = repository.full_name.split('/');

  // Get issue assignees
  const assigneesString = core.getInput('assignees', { required: true });
  const assignees = assigneesString
    .split(',')
    .map((assigneeName) => assigneeName.trim());

  // Get assignment mapping
  const mapping = generateMapping(assignees)

  const newAssignee = mapping[sender]

  // Assign issue
  console.log(
    `Assigning issue ${issue.number} to ${JSON.stringify(newAssignee)}`
  );
  try {
    await octokit.issues.addAssignees({
      owner,
      repo,
      issue_number: issue.number,
      assignees: [newAssignee]
    });
  } catch (error) {
    core.setFailed(error.message);
  }
};

try {
  run();
} catch (error) {
  core.setFailed(error.message);
}

