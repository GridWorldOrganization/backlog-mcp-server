import { getSpaceTool } from "./getSpace.js";
import { getUsersTool } from "./getUsers.js";
import { getMyselfTool } from "./getMyself.js";
import { getPrioritiesTool } from "./getPriorities.js";
import { getResolutionsTool } from "./getResolutions.js";
import { getIssueTypesTool } from "./getIssueTypes.js";
import { getNotificationsTool } from "./getNotifications.js";
import { getNotificationsCountTool } from "./getNotificationsCount.js";
import { resetUnreadNotificationCountTool } from "./resetUnreadNotificationCount.js";
import { markNotificationAsReadTool } from "./markNotificationAsRead.js";
import { getGitRepositoriesTool } from "./getGitRepositories.js";
import { getGitRepositoryTool } from "./getGitRepository.js";
import { getPullRequestsTool } from "./getPullRequests.js";
import { getPullRequestsCountTool } from "./getPullRequestsCount.js";
import { getPullRequestTool } from "./getPullRequest.js";
import { addPullRequestTool } from "./addPullRequest.js";
import { updatePullRequestTool } from "./updatePullRequest.js";
import { getPullRequestCommentsTool } from "./getPullRequestComments.js";
import { addPullRequestCommentTool } from "./addPullRequestComment.js";
import { updatePullRequestCommentTool } from "./updatePullRequestComment.js";
import { getWatchingListItemsTool } from "./getWatchingListItems.js";
import { getWatchingListCountTool } from "./getWatchingListCount.js";
import { getProjectListTool } from "./getProjectList.js";
import { addIssueTool } from "./addIssue.js";
import { addProjectTool } from "./addProject.js";
import { getProjectTool } from "./getProject.js";
import { updateProjectTool } from "./updateProject.js";
import { deleteProjectTool } from "./deleteProject.js";
import { getWikiPagesTool } from "./getWikiPages.js";
import { getWikisCountTool } from "./getWikisCount.js";
import { getWikiTool } from "./getWiki.js";
import { addWikiTool } from "./addWiki.js";
import { getCategoriesTool } from "./getCategories.js";
import { getIssueTool } from "./getIssue.js";
import { getIssuesTool } from "./getIssues.js";
import { countIssuesTool } from "./countIssues.js";
import { updateIssueTool } from "./updateIssue.js";
import { deleteIssueTool } from "./deleteIssue.js";
import { getIssueCommentsTool } from "./getIssueComments.js";
import { addIssueCommentTool } from "./addIssueComment.js";
import { Backlog } from 'backlog-js';
import { TranslationHelper } from "../createTranslationHelper.js";

export const allTools = (backlog: Backlog, helper: TranslationHelper) => [
  // Space tools
  getSpaceTool(backlog, helper),
  getUsersTool(backlog, helper),
  getMyselfTool(backlog, helper),
  getPrioritiesTool(backlog, helper),
  getResolutionsTool(backlog, helper),
  getIssueTypesTool(backlog, helper),
  
  // Notification tools
  getNotificationsTool(backlog, helper),
  getNotificationsCountTool(backlog, helper),
  resetUnreadNotificationCountTool(backlog, helper),
  markNotificationAsReadTool(backlog, helper),
  
  // Git tools
  getGitRepositoriesTool(backlog, helper),
  getGitRepositoryTool(backlog, helper),
  
  // Pull Request tools
  getPullRequestsTool(backlog, helper),
  getPullRequestsCountTool(backlog, helper),
  getPullRequestTool(backlog, helper),
  addPullRequestTool(backlog, helper),
  updatePullRequestTool(backlog, helper),
  getPullRequestCommentsTool(backlog, helper),
  addPullRequestCommentTool(backlog, helper),
  updatePullRequestCommentTool(backlog, helper),
  
  // Watching tools
  getWatchingListItemsTool(backlog, helper),
  getWatchingListCountTool(backlog, helper),
  
  // // Project tools
  getProjectListTool(backlog, helper),
  addProjectTool(backlog, helper),
  getProjectTool(backlog, helper),
  updateProjectTool(backlog, helper),
  deleteProjectTool(backlog, helper),
  
  // Issue tools
  getIssueTool(backlog, helper),
  getIssuesTool(backlog, helper),
  countIssuesTool(backlog, helper),
  addIssueTool(backlog, helper),
  updateIssueTool(backlog, helper),
  deleteIssueTool(backlog, helper),
  
  // Comment tools
  getIssueCommentsTool(backlog, helper),
  addIssueCommentTool(backlog, helper),
  
  // Wiki tools
  getWikiPagesTool(backlog, helper),
  getWikisCountTool(backlog, helper),
  getWikiTool(backlog, helper),
  addWikiTool(backlog, helper),
  
  // Category tools
  getCategoriesTool(backlog, helper),
];
