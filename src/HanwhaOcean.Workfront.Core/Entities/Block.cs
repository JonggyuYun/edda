namespace HanwhaOcean.Workfront.Core.Entities;

/// <summary>
/// 블록
/// </summary>
public class Block : BaseEntity
{
    public long ProjectId { get; set; }
    public string BlockNo { get; set; } = string.Empty;         // 블록번호
    public string BlockName { get; set; } = string.Empty;       // 블록명
    public string Zone { get; set; } = string.Empty;            // 존 (기관실, 화물창 등)
    public decimal Weight { get; set; }                          // 중량 (톤)
    public DateTime? PlanStartDate { get; set; }                 // 계획 착수일
    public DateTime? PlanEndDate { get; set; }                   // 계획 완료일
    public DateTime? ActualStartDate { get; set; }               // 실적 착수일
    public DateTime? ActualEndDate { get; set; }                 // 실적 완료일
    public decimal ProgressRate { get; set; }                    // 진척률 (%)

    // Navigation
    public Project Project { get; set; } = null!;
    public ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
}
