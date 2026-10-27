const DEFAULT_QA_BASE_URL = "https://qa.bnts-arc.ai";

export function resolveQaTarget(env: NodeJS.ProcessEnv): { baseURL: string; projectName: string } {
  const projectName = env.ARC_QA_PROJECT_NAME;
  if (!projectName) {
    throw new Error("ARC_QA_PROJECT_NAME must be set to the name of the existing QA Project");
  }
  return { baseURL: env.ARC_QA_BASE_URL || DEFAULT_QA_BASE_URL, projectName };
}
