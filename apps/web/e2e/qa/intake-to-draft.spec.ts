import { test } from "@playwright/test";
import {
  completeIntake,
  expectDraftedStory,
  openProject,
  signIn,
  submitRequest,
} from "./intake-helpers";

test("a new request goes from intake to a drafted story", async ({ page }) => {
  const projectName = process.env.QA_PROJECT_NAME;
  if (!projectName) throw new Error("QA_PROJECT_NAME is required for the QA intake check");
  const title = `intake-to-draft ${Date.now()}`;

  await signIn(page);
  await openProject(page, projectName);
  await submitRequest(page, title);
  await completeIntake(page, title);
  await expectDraftedStory(page, title);
});
