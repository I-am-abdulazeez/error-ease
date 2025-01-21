import * as vscode from 'vscode';

export function getHoverContent(translatedMessage: string): vscode.MarkdownString {
  const markdown = new vscode.MarkdownString();
  markdown.isTrusted = true;
  markdown.appendMarkdown(
    `### 🛠️ **Error Ease Translation**\n\n` +
    `${translatedMessage}`
  );
  return markdown;
}
