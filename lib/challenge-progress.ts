export function normalizeChallengeId(id: unknown): string {
  const value = String(id);
  return value.replace(/^(.*?)(\d+)$/, (_, prefix: string, suffix: string) => {
    return `${prefix}${Number(suffix)}`;
  });
}

export function resolveChallengeIds(
  problemIds: unknown,
  availableChallengeIds: readonly unknown[]
): string[] {
  if (!Array.isArray(problemIds)) return [];

  const availableIds = availableChallengeIds.map(String);
  const usedIds = new Set<string>();

  return problemIds.flatMap((problemId) => {
    const reference = String(problemId);
    const exactMatch = availableIds.find((id) => id === reference && !usedIds.has(id));
    if (exactMatch) {
      usedIds.add(exactMatch);
      return [exactMatch];
    }

    const normalizedReference = normalizeChallengeId(reference);
    const normalizedMatches = availableIds.filter(
      (id) => normalizeChallengeId(id) === normalizedReference && !usedIds.has(id)
    );
    if (normalizedMatches.length === 1) {
      usedIds.add(normalizedMatches[0]);
      return [normalizedMatches[0]];
    }

    const referenceStem = reference.replace(/\d+$/, "");
    const stemMatches = availableIds
      .filter((id) => id.replace(/\d+$/, "") === referenceStem && !usedIds.has(id))
      .sort((left, right) => {
        const leftNumber = Number(left.match(/(\d+)$/)?.[1] ?? 0);
        const rightNumber = Number(right.match(/(\d+)$/)?.[1] ?? 0);
        return leftNumber - rightNumber;
      });
    if (stemMatches.length > 0) {
      usedIds.add(stemMatches[0]);
      return [stemMatches[0]];
    }

    return [];
  });
}

export function getCompletedChallengeIds(
  statuses: readonly unknown[]
): Set<string> {
  const completedChallengeIds = new Set<string>();
  for (const status of statuses) {
    if (
      typeof status === "object" &&
      status !== null &&
      "challengeId" in status &&
      status.challengeId !== undefined &&
      status.challengeId !== null
    ) {
      completedChallengeIds.add(normalizeChallengeId(status.challengeId));
    }
  }
  return completedChallengeIds;
}

export function hasCompletedChallenges(
  problemIds: unknown,
  completedChallengeIds: ReadonlySet<string>
): boolean {
  return (
    Array.isArray(problemIds) &&
    problemIds.length > 0 &&
    problemIds.every((problemId) =>
      completedChallengeIds.has(normalizeChallengeId(problemId))
    )
  );
}
