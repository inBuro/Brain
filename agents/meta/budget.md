# Budget

Model routing for this agent system (see `feedback_agent_model_routing` in `~/Brain` memory):

- **Main loop** (whichever entry point the user is driving from — router or a `~/Brain` session): Opus 4.8, 1M context.
- **All persona sub-agents** invoked via the Task tool: Sonnet 4.6, set via `CLAUDE_CODE_SUBAGENT_MODEL`.
- Opening a persona folder under `~/Brain/agents/<name>/` directly (bypassing the router) runs that session on whatever model the user picked for it — the Sonnet-4.6 routing above only applies to Task-tool sub-agent calls, not to standalone workspace sessions.

No token/cost ceiling tracked here yet — add one if usage needs it.
