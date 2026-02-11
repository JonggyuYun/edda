using DevExpress.AspNetCore;
using HanwhaOcean.Workfront.Core.Entities;
using HanwhaOcean.Workfront.Core.Enums;
using HanwhaOcean.Workfront.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaOcean.Workfront.Web.Controllers;

public class WorkOrderController : Controller
{
    private readonly IWorkOrderService _workOrderService;
    private readonly IRepository<Project> _projectRepo;

    public WorkOrderController(
        IWorkOrderService workOrderService,
        IRepository<Project> projectRepo)
    {
        _workOrderService = workOrderService;
        _projectRepo = projectRepo;
    }

    public IActionResult Index()
    {
        return View();
    }

    public async Task<IActionResult> Detail(long id)
    {
        var workOrder = await _workOrderService.GetByIdAsync(id);
        if (workOrder == null) return NotFound();
        return View(workOrder);
    }

    public IActionResult Create()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(WorkOrder workOrder)
    {
        if (!ModelState.IsValid) return View(workOrder);

        await _workOrderService.CreateAsync(workOrder);
        return RedirectToAction(nameof(Index));
    }

    /// <summary>
    /// DevExpress DataGrid 데이터 소스 (서버사이드)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetWorkOrders(
        string? projectNo, string? blockNo,
        ProcessType? processType, WorkOrderStatus? status,
        DateTime? fromDate, DateTime? toDate)
    {
        var workOrders = await _workOrderService.SearchAsync(
            projectNo, blockNo, processType, status, fromDate, toDate);

        var result = workOrders.Select(w => new
        {
            w.Id,
            w.WorkOrderNo,
            ProjectNo = w.Project?.ProjectNo,
            BlockNo = w.Block?.BlockNo,
            ProcessType = w.ProcessType.ToString(),
            w.WorkArea,
            w.Description,
            Status = w.Status.ToString(),
            w.PlanStartDate,
            w.PlanEndDate,
            w.ActualStartDate,
            w.ActualEndDate,
            w.PlanManHours,
            w.ActualManHours,
            w.ProgressRate
        });

        return Json(result);
    }

    /// <summary>
    /// 작업지시 상태 변경
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> UpdateStatus(long id, WorkOrderStatus status)
    {
        await _workOrderService.UpdateStatusAsync(id, status);
        return Ok();
    }
}
