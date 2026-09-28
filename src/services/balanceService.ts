import type {
  CategoryBalanceSummary,
  DailyAvailableTime,
  GoalCategory,
  GoalWeeklyReviewSummary,
  WeeklyGoalTarget,
} from '../types/index.ts'
import { hoursToMinutes } from '../utils/index.ts'

/**
 * Service for computing balance distributions and evaluating goal progress against targets.
 */

/**
 * Evaluates whether executed time satisfies a goal's weekly target thresholds.
 */
export function evaluateWeeklyGoalStatus(
  target: WeeklyGoalTarget,
  actualMinutes: number,
): GoalWeeklyReviewSummary['targetStatus'] {
  const minMinutes = hoursToMinutes(target.minimumHours)
  const targetMinutes = hoursToMinutes(target.targetHours)
  const maxMinutes =
    target.maximumHours !== undefined
      ? hoursToMinutes(target.maximumHours)
      : undefined

  if (maxMinutes !== undefined && actualMinutes > maxMinutes) {
    return 'ceiling_exceeded'
  }
  if (actualMinutes >= targetMinutes) {
    return 'target_met'
  }
  if (actualMinutes >= minMinutes) {
    return 'minimum_met'
  }
  return 'below_minimum'
}

/**
 * Calculates net available execution capacity for a given day.
 */
export function calculateNetExecutionCapacity(
  availableTime: DailyAvailableTime,
): number {
  return Math.max(
    0,
    availableTime.totalAvailableMinutes - availableTime.fixedCommitmentMinutes,
  )
}

/**
 * Computes category balance distribution given executed minutes per category.
 */
export function computeCategoryBalanceDistribution(
  categories: GoalCategory[],
  executedMinutesByCategory: Record<string, number>,
): CategoryBalanceSummary[] {
  const totalMinutes = Object.values(executedMinutesByCategory).reduce(
    (sum, val) => sum + val,
    0,
  )

  return categories.map((category) => {
    const actualMinutes = executedMinutesByCategory[category.id] ?? 0
    const actualHours = Math.round((actualMinutes / 60) * 10) / 10
    const shareOfTotalPercentage =
      totalMinutes > 0
        ? Math.round((actualMinutes / totalMinutes) * 1000) / 10
        : 0

    return {
      categoryId: category.id,
      categoryName: category.name,
      actualMinutes,
      actualHours,
      shareOfTotalPercentage,
      targetBalancePercentage: category.targetBalancePercentage,
    }
  })
}
