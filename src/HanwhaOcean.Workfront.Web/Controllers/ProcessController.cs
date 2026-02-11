using HanwhaOcean.Workfront.Core.Entities;
using HanwhaOcean.Workfront.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaOcean.Workfront.Web.Controllers;

/// <summary>
/// 공정관리
/// </summary>
public class ProcessController : Controller
{
    private readonly IRepository<Project> _projectRepo;
    private readonly IRepository<Block> _blockRepo;
    private readonly IRepository<WorkOrder> _workOrderRepo;

    public ProcessController(
        IRepository<Project> projectRepo,
        IRepository<Block> blockRepo,
        IRepository<WorkOrder> workOrderRepo)
    {
        _projectRepo = projectRepo;
        _blockRepo = blockRepo;
        _workOrderRepo = workOrderRepo;
    }

    public IActionResult Index()
    {
        return View();
    }

    /// <summary>
    /// 공정 현황 Gantt Chart 데이터
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetGanttData(long projectId)
    {
        var blocks = await _blockRepo.FindAsync(b => b.ProjectId == projectId);
        var data = blocks.Select(b => new
        {
            b.Id,
            b.BlockNo,
            b.BlockName,
            StartDate = b.PlanStartDate,
            EndDate = b.PlanEndDate,
            b.ProgressRate,
            ActualStart = b.ActualStartDate,
            ActualEnd = b.ActualEndDate
        });
        return Json(data);
    }

    /// <summary>
    /// 블록 목록 조회
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetBlocks(long projectId)
    {
        var blocks = await _blockRepo.FindAsync(b => b.ProjectId == projectId);
        return Json(blocks.Select(b => new
        {
            b.Id,
            b.BlockNo,
            b.BlockName,
            b.Zone,
            b.Weight,
            b.ProgressRate,
            b.PlanStartDate,
            b.PlanEndDate
        }));
    }
}
