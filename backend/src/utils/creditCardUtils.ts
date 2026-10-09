export interface DueStatus {
  daysLeft: number;
  isOverdue: boolean;
  dueStatusText: string;
  dueStatusColor: 'green' | 'yellow' | 'red';
}

export interface UtilizationStatus {
  utilizationPercent: number;
  utilizationColor: 'green' | 'yellow' | 'red';
}

/**
 * Computes due status based on server time and target dueDate
 * Green: > 7 days
 * Yellow: 3 to 7 days
 * Red: < 3 days (including today = 0 days)
 * Red: Overdue by N days if dueDate < today
 */
export function calculateDueStatus(dueDate: Date, currentDate: Date = new Date()): DueStatus {
  const current = new Date(currentDate);
  current.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - current.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      daysLeft: diffDays,
      isOverdue: true,
      dueStatusText: `Overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`,
      dueStatusColor: 'red',
    };
  }

  if (diffDays > 7) {
    return {
      daysLeft: diffDays,
      isOverdue: false,
      dueStatusText: `${diffDays} days left to pay`,
      dueStatusColor: 'green',
    };
  }

  if (diffDays >= 3) {
    return {
      daysLeft: diffDays,
      isOverdue: false,
      dueStatusText: `${diffDays} days left to pay`,
      dueStatusColor: 'yellow',
    };
  }

  return {
    daysLeft: diffDays,
    isOverdue: false,
    dueStatusText: `${diffDays} day${diffDays === 1 ? '' : 's'} left to pay`,
    dueStatusColor: 'red',
  };
}

/**
 * Computes credit card utilization percentage and color band:
 * Green: under 30% (< 30)
 * Yellow: 30% to 60% (>= 30 and <= 60)
 * Red: above 60% (> 60)
 */
export function calculateUtilization(amountSpent: number, creditLimit: number): UtilizationStatus {
  if (creditLimit <= 0) {
    return { utilizationPercent: 0, utilizationColor: 'green' };
  }

  const ratio = (amountSpent / creditLimit) * 100;
  const utilizationPercent = Math.round(ratio * 10) / 10;

  let utilizationColor: 'green' | 'yellow' | 'red' = 'green';
  if (utilizationPercent > 60) {
    utilizationColor = 'red';
  } else if (utilizationPercent >= 30) {
    utilizationColor = 'yellow';
  }

  return {
    utilizationPercent,
    utilizationColor,
  };
}
