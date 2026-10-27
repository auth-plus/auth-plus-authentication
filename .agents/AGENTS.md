# Agent Rules

## Speckit Workflow Constraints
- **Never skip steps**: Even if artifacts like `research.md`, `data-model.md`, `plan.md`, or `tasks.md` already exist, do not automatically skip steps in the speckit workflow. Always proceed through the required phases (specify, plan, tasks, implement).
- **Never automatically go to next step without asking me**: After completing any major speckit command (e.g., plan, tasks), stop and ask the user for approval or review before automatically running the next command in the workflow.
- **On 'plan' step**: After presenting the implementation plan, explicitly ask the user:
  - If there are any other alternatives that come to mind.
  - To propose 'what-if' scenarios to check if the plan is fully understood and robust.
  - BEHAVIORAL RULE: Behave like you are interviewing the user on a system design challenge. Suggest using the `/grill-me` command to facilitate a dedicated, interactive grilling session to test their system design decisions.

## Graphify Rules
- **Always query graphify first**: When searching for code, analyzing architecture, or looking up relationships, it is MANDATORY to use `/graphify query` or other graphify tools BEFORE using `grep_search` or reading raw files with `view_file`.
- When using speckit workflows (specify, plan, etc.), make sure to query graphify for the broader architectural context before jumping into file contents.
