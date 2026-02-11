namespace HanwhaOcean.Workfront.Core.Enums;

/// <summary>
/// 작업지시 상태
/// </summary>
public enum WorkOrderStatus
{
    Draft = 0,        // 초안
    Planned = 1,      // 계획됨
    InProgress = 2,   // 진행중
    OnHold = 3,       // 보류
    Completed = 4,    // 완료
    Cancelled = 5     // 취소
}

/// <summary>
/// 공정 유형
/// </summary>
public enum ProcessType
{
    Cutting = 1,         // 절단
    SubAssembly = 2,     // 소조립
    Assembly = 3,        // 중조립
    GrandAssembly = 4,   // 대조립
    PreErection = 5,     // P/E (선행탑재)
    Erection = 6,        // 탑재
    Outfitting = 7,      // 의장
    Painting = 8,        // 도장
    Testing = 9          // 시운전
}

/// <summary>
/// 품질 검사 결과
/// </summary>
public enum QualityResult
{
    Pending = 0,    // 대기
    Pass = 1,       // 합격
    Fail = 2,       // 불합격
    Rework = 3      // 재작업
}

/// <summary>
/// 자재 상태
/// </summary>
public enum MaterialStatus
{
    Requested = 0,    // 요청
    Ordered = 1,      // 발주
    Received = 2,     // 입고
    Issued = 3,       // 출고
    Returned = 4      // 반납
}
