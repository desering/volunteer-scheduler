module.exports = async ({ github, context }) => {
  const fs = require("node:fs");

  const trivyOutput = fs.readFileSync("./trivy-detail-table.txt", "utf8");

  const total = trivyOutput
    .matchAll(/Total: (?<total>\d)/gm)
    .map((match) => parseInt(match.groups.total, 10))
    .reduce((acc, cur) => acc + cur);

  const icon = total > 0 ? ":red_circle:" : ":green_circle:";

  const body = `${icon} Trivy found ${total} vulnerabilities.
            <details>
            <summary><strong>Scan results</strong></summary>

            \`\`\`
            ${trivyOutput}
            \`\`\`
            </details>`;

  // 1. Retrieve existing comments for the PR
  const { data: comments } = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  });
  // 2. Find the most recent comment that contains a trivy scan result
  comments.sort((a, b) => Date.parse(a.updated_at) - Date.parse(b.updated_at));
  const botComment = comments.findLast((comment) => {
    return (
      comment.user.type === "Bot" &&
      comment.body.includes("Trivy image scan results")
    );
  });
  // 3. If we have a comment, update it, otherwise create a new one
  if (botComment) {
    github.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: botComment.id,
      body: body,
    });
  } else {
    github.rest.issues.createComment({
      issue_number: context.issue.number,
      owner: context.repo.owner,
      repo: context.repo.repo,
      body: body,
    });
  }
};
