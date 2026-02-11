using HanwhaOcean.Workfront.Core.Entities;
using HanwhaOcean.Workfront.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaOcean.Workfront.Web.Controllers;

public class DashboardController : Controller
{
    private readonly IRepository<Project> _projectRepo;
    private readonly IRepository<WorkOrder> _workOrderRepo;

    public DashboardController(
        IRepository<Project> projectRepo,
        IRepository<WorkOrder> workOrderRepo)
    {
        _projectRepo = projectRepo;
        _workOrderRepo = workOrderRepo;
    }

    public IActionResult Index()
    {
        return View();
    }

    /// <summary>
    /// 호선별 진척률 차트 데이터
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProjectProgress()
    {
        var projects = await _projectRepo.GetAllAsync();
        var data = projects.Select(p => new
        {
            p.ProjectNo,
            p.ShipName,
            p.ShipType,
            p.ProgressRate,
            p.DeliveryDate
        });
        return Json(data);
    }

    /// <summary>
    /// 공정별 작업 현황 데이터
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetWorkOrderStatus()
    {
        var workOrders = await _workOrderRepo.GetAllAsync();
        var data = workOrders
            .GroupBy(w => w.ProcessType)
            .Select(g => new
            {
                ProcessType = g.Key.ToString(),
                Total = g.Count(),
                InProgress = g.Count(w => w.Status == Core.Enums.WorkOrderStatus.InProgress),
                Completed = g.Count(w => w.Status == Core.Enums.WorkOrderStatus.Completed)
            });
        return Json(data);
    }
}
