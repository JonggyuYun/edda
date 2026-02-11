using HanwhaOcean.Workfront.Core.Entities;
using HanwhaOcean.Workfront.Core.Enums;
using HanwhaOcean.Workfront.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaOcean.Workfront.Web.Controllers.Api;

/// <summary>
/// DevExtreme 모바일용 REST API
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class WorkOrderApiController : ControllerBase
{
    private readonly IWorkOrderService _workOrderService;

    public WorkOrderApiController(IWorkOrderService workOrderService)
    {
        _workOrderService = workOrderService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] long? projectId, [FromQuery] WorkOrderStatus? status)
    {
        if (projectId.HasValue)
        {
            var byProject = await _workOrderService.GetByProjectAsync(projectId.Value);
            return Ok(byProject);
        }

        if (status.HasValue)
        {
            var byStatus = await _workOrderService.GetByStatusAsync(status.Value);
            return Ok(byStatus);
        }

        var all = await _workOrderService.SearchAsync(null, null, null, null, null, null);
        return Ok(all);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(long id)
    {
        var workOrder = await _workOrderService.GetByIdAsync(id);
        if (workOrder == null) return NotFound();
        return Ok(workOrder);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] WorkOrder workOrder)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var created = await _workOrderService.CreateAsync(workOrder);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(long id, [FromBody] WorkOrderStatus status)
    {
        await _workOrderService.UpdateStatusAsync(id, status);
        return NoContent();
    }
}
