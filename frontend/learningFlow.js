const STORAGE_KEYS = {
  selection: 'learning.selection',
  analysis: 'learning.analysis',
  roadmap: 'learning.roadmap',
  progressDraft: 'learning.progressDraft',
  resourceProgress: 'learning.resourceProgress',
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getSelection() {
  return readJson(STORAGE_KEYS.selection, null);
}

export function setSelection(value) {
  writeJson(STORAGE_KEYS.selection, value);
}

export function getAnalysis() {
  return readJson(STORAGE_KEYS.analysis, null);
}

export function setAnalysis(value) {
  writeJson(STORAGE_KEYS.analysis, value);
}

export function getRoadmap() {
  return readJson(STORAGE_KEYS.roadmap, null);
}

export function setRoadmap(value) {
  writeJson(STORAGE_KEYS.roadmap, value);
}

export function getProgressDraft() {
  return readJson(STORAGE_KEYS.progressDraft, {
    completedSkills: [],
    assignmentScores: [],
    dailyHoursSpent: 0,
    modulesCompleted: 0,
    testsAttended: 0,
    testsPassed: 0,
    testsFailed: 0,
    toolProgress: [],
  });
}

export function setProgressDraft(value) {
  writeJson(STORAGE_KEYS.progressDraft, value);
}

export function getResourceProgress() {
  return readJson(STORAGE_KEYS.resourceProgress, {});
}

export function setResourceProgress(value) {
  writeJson(STORAGE_KEYS.resourceProgress, value);
}

export function getCurrentUserId(user) {
  return user?.id || user?.userId || '';
}

export function buildProgressPayload(userId, draft = getProgressDraft()) {
  const toolProgress = draft.toolProgress || [];
  const completedSkills = draft.completedSkills?.length
    ? draft.completedSkills
    : toolProgress.filter((item) => item.completedPercentage === 100).map((item) => item.skill);
  const modulesCompleted = typeof draft.modulesCompleted === 'number'
    ? draft.modulesCompleted
    : toolProgress.reduce((sum, item) => sum + Math.floor((item.completedPercentage || 0) / 34), 0);

  return {
    userId,
    completedSkills,
    milestoneProgress: toolProgress.map((item) => ({
      skill: item.skill,
      milestoneId: item.skill,
      completed: item.completedPercentage === 100,
    })),
    assignmentScores: draft.assignmentScores || [],
    dailyHoursSpent: draft.dailyHoursSpent || 2,
    modulesCompleted,
    testsAttended: draft.testsAttended || 0,
    testsPassed: draft.testsPassed || 0,
    testsFailed: draft.testsFailed || 0,
    toolProgress,
  };
}
