using HanwhaOcean.Workfront.Core.Entities;
using HanwhaOcean.Workfront.Core.Enums;
using HanwhaOcean.Workfront.Core.Interfaces;

namespace HanwhaOcean.Workfront.Core.Services;

public class WorkOrderService : IWorkOrderService
{
    private readonly IRepository<WorkOrder> _workOrderRepo;
    private readonly IRepository<Project> _projectRepo;

    public WorkOrderService(IRepository<WorkOrder> workOrderRepo, IRepository<Project> projectRepo)
    {
        _workOrderRepo = workOrderRepo;
        _projectRepo = projectRepo;
    }

    public async Task<WorkOrder?> GetByIdAsync(long id)
        => await _workOrderRepo.GetByIdAsync(id);

    public async Task<IEnumerable<WorkOrder>> GetByProjectAsync(long projectId)
        => await _workOrderRepo.FindAsync(w => w.ProjectId == projectId);

    public async Task<IEnumerable<WorkOrder>> GetByStatusAsync(WorkOrderStatus status)
        => await _workOrderRepo.FindAsync(w => w.Status == status);

    public async Task<WorkOrder> CreateAsync(WorkOrder workOrder)
    {
        workOrder.Status = WorkOrderStatus.Draft;
        return await _workOrderRepo.AddAsync(workOrder);
    }

    public async Task UpdateAsync(WorkOrder workOrder)
    {
        workOrder.UpdatedAt = DateTime.UtcNow;
        await _workOrderRepo.UpdateAsync(workOrder);
    }

    public async Task UpdateStatusAsync(long id, WorkOrderStatus status)
    {
        var workOrder = await _workOrderRepo.GetByIdAsync(id)
            ?? throw new InvalidOperationException($"작업지시서를 찾을 수 없습니다. ID: {id}");

        workOrder.Status = status;

        if (status == WorkOrderStatus.InProgress && workOrder.ActualStartDate == null)
            workOrder.ActualStartDate = DateTime.UtcNow;

        if (status == WorkOrderStatus.Completed)
            workOrder.ActualEndDate = DateTime.UtcNow;

        await _workOrderRepo.UpdateAsync(workOrder);
    }

    public async Task<IEnumerable<WorkOrder>> SearchAsync(
        string? projectNo, string? blockNo,
        ProcessType? processType, WorkOrderStatus? status,
        DateTime? fromDate, DateTime? toDate)
    {
        var query = _workOrderRepo.Query();

        if (!string.IsNullOrEmpty(projectNo))
            query = query.Where(w => w.Project.ProjectNo.Contains(projectNo));

        if (!string.IsNullOrEmpty(blockNo))
            query = query.Where(w => w.Block != null && w.Block.BlockNo.Contains(blockNo));

        if (processType.HasValue)
            query = query.Where(w => w.ProcessType == processType.Value);

        if (status.HasValue)
            query = query.Where(w => w.Status == status.Value);

        if (fromDate.HasValue)
            query = query.Where(w => w.PlanStartDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(w => w.PlanEndDate <= toDate.Value);

        return await Task.FromResult(query.ToList());
    }
}
