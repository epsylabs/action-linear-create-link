import { debug, setFailed, getInput, setOutput } from "@actions/core";
import { Issue, Project, LinearClient, LinearClientOptions } from "@linear/sdk";
import { context } from "@actions/github";
import getIssues, { IssueNumber } from "./getIssues";

type InputMap = {
  apiKey: string;
  resource: string;
  scope: string;
  name: string;
  target: string;
};

type ApiKeyInput = Pick<LinearClientOptions, "apiKey">;

type PartsWithOpts<Type> = {
  [Property in keyof Type]: { value: string | undefined; flag: boolean };
};
type PartsType = PartsWithOpts<{ branch: void; title: void; body: void }>;

type LimitedIssue = Omit<Issue, "team" | "labels" | "project">;
type FoundIssueType = LimitedIssue & {
  project?: Project | null;
};

const main = async () => {
  const matchToIssueNumber = (issueStr: string): IssueNumber => {
    const [teamKey, issueNumber] = issueStr.split("-");
    return { teamKey: teamKey.toUpperCase(), issueNumber: Number(issueNumber) };
  };

  try {
    const inputs: InputMap = {
      apiKey: getInput("linear-api-key", { required: true }),
      resource: getInput("resource"),
      scope: getInput("scope"),
      name: getInput("name"),
      target: getInput("target"),
    };

    const linearClient = new LinearClient({
      ...(inputs as ApiKeyInput),
    });

    if (inputs.scope == "issue") {
      let issue = await linearClient.issue(inputs.resource);
    } else if (inputs.scope == "project") {
      let project = await linearClient.project(inputs.resource);
      console.log(project.links());
    }

    // const teams: Team[] = await getTeams(linearClient);
    // if (!teams.length) {
    //   setFailed(`No teams found in Linear workspace`);
    //   return;
    // }

    // const teamKeys: string[] = teams.map((team) => team.key);
    // const regexStr: string = `(?<!A-Za-z)(${teamKeys.join("|")})-(\\d+)`;
    // const regExp: RegExp = new RegExp(regexStr, "gim");
    // const haystack: string = Object.values(prParts)
    //   .map(({ value, flag }) => (flag ? value : undefined))
    //   .filter(Boolean)
    //   .join(" ");
    // debug(`Checking PR for identifier "${regexStr}" in "${haystack}"`);

    // const matches: string[] = haystack.match(regExp) as string[];
    // if (matches?.length) {
    //   debug(`Found numbers: ${matches.join(", ")}`);

    //   const issueNumbers: IssueNumber[] = inputs.outputMultiple
    //     ? matches.map(matchToIssueNumber)
    //     : [matchToIssueNumber(matches[0])];
    //   debug(`Formatted issues: ${JSON.stringify(issueNumbers)}`);

    //   const issues: Issue[] = await getIssues(linearClient, ...issueNumbers);
    //   debug(`Linear API issues result: ${JSON.stringify(issues)}`);

    //   if (issues.length) {
    //     const extendIssues = (
    //       rawIssues: Issue[],
    //     ): Promise<FoundIssueType[]> => {
    //       const promises = rawIssues.map(
    //         async (issue): Promise<FoundIssueType> => {
    //           return {
    //             ...(issue as LimitedIssue),
    //             team: inputs.withTeam ? await issue.team : null,
    //             labels: inputs.withLabels ? (await issue.labels()).nodes : null,
    //             project: inputs.withProject ? await issue.project : null,
    //           };
    //         },
    //       );

    //       return Promise.all(promises);
    //     };

    //     const foundIssues = await extendIssues(issues);

    //     debug(`Updated result: ${JSON.stringify(foundIssues)}`);

    //     if (inputs.outputMultiple) {
    //       setOutput("linear-issues", JSON.stringify(foundIssues));
    //     } else {
    //       setOutput("linear-issue", JSON.stringify(foundIssues[0]));
    //     }
    //     return;
    //   }

    // setFailed(
    //   `Failed to find Linear issue identifier in PR branch, title, or body.`,
    // );
    // return;
  } catch (error) {
    setFailed(`${(error as any)?.message ?? error}`);
  }
};

main();
