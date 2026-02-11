namespace HanwhaOcean.Workfront.Core.Entities;

/// <summary>
/// 프로젝트 (호선)
/// </summary>
public class Project : BaseEntity
{
    public string ProjectNo { get; set; } = string.Empty;       // 호선번호
    public string ShipName { get; set; } = string.Empty;        // 선명
    public string ShipType { get; set; } = string.Empty;        // 선종 (LNG, Container, Tanker 등)
    public string ShipOwner { get; set; } = string.Empty;       // 선주
    public DateTime ContractDate { get; set; }                   // 계약일
    public DateTime DeliveryDate { get; set; }                   // 인도일
    public DateTime? SteelCuttingDate { get; set; }              // 강재절단일
    public DateTime? KeelLayingDate { get; set; }                // 용골거치일
    public DateTime? LaunchingDate { get; set; }                 // 진수일
    public decimal ProgressRate { get; set; }                    // 진척률 (%)
    public string Status { get; set; } = "계획";                 // 상태
    public string? Remark { get; set; }

    // Navigation
    public ICollection<Block> Blocks { get; set; } = new List<Block>();
    public ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
}
