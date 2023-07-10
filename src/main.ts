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
      if (
        (await issue.attachments()).nodes.filter(
          (link) => link.title == inputs.name,
        ).length == 0
      ) {
        linearClient.createAttachment({
          issueId: issue.id,
          url: inputs.target,
          title: inputs.name,
        });
      }
    } else if (inputs.scope == "project") {
      let project = await linearClient.project(inputs.resource);

      if (
        (await project.links()).nodes.filter(
          (link) => link.label == inputs.name,
        ).length == 0
      ) {
        await linearClient.createProjectLink({
          projectId: project.id,
          label: inputs.name,
          url: inputs.target,
        });
      }
    }
  } catch (error) {
    setFailed(`${(error as any)?.message ?? error}`);
  }
};

main();
