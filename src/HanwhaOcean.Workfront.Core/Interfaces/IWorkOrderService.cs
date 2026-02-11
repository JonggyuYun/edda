using HanwhaOcean.Workfront.Core.Entities;
using HanwhaOcean.Workfront.Core.Enums;

namespace HanwhaOcean.Workfront.Core.Interfaces;

public interface IWorkOrderService
{
    Task<WorkOrder?> GetByIdAsync(long id);
    Task<IEnumerable<WorkOrder>> GetByProjectAsync(long projectId);
    Task<IEnumerable<WorkOrder>> GetByStatusAsync(WorkOrderStatus status);
    Task<WorkOrder> CreateAsync(WorkOrder workOrder);
    Task UpdateAsync(WorkOrder workOrder);
    Task UpdateStatusAsync(long id, WorkOrderStatus status);
    Task<IEnumerable<WorkOrder>> SearchAsync(string? projectNo, string? blockNo,
        ProcessType? processType, WorkOrderStatus? status,
        DateTime? fromDate, DateTime? toDate);
}
