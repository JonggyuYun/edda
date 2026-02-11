namespace HanwhaOcean.Workfront.Core.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummary> GetSummaryAsync();
    Task<IEnumerable<ProjectProgress>> GetProjectProgressAsync();
    Task<IEnumerable<ProcessStatusSummary>> GetProcessStatusAsync(long projectId);
    Task<IEnumerable<DailyWorkSummary>> GetDailyWorkSummaryAsync(DateTime from, DateTime to);
}

public record DashboardSummary(
    int TotalProjects,
    int ActiveWorkOrders,
    decimal AverageProgressRate,
    int TodayWorkerCount,
    int QualityIssueCount,
    int PendingMaterialRequests
);

public record ProjectProgress(
    string ProjectNo,
    string ShipName,
    string ShipType,
    decimal ProgressRate,
    DateTime DeliveryDate
);

public record ProcessStatusSummary(
    string ProcessName,
    int PlannedCount,
    int InProgressCount,
    int CompletedCount,
    decimal ProgressRate
);

public record DailyWorkSummary(
    DateTime WorkDate,
    int WorkOrderCount,
    int WorkerCount,
    decimal TotalManHours,
    decimal ProgressIncrement
);
