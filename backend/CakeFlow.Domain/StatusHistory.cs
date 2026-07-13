namespace CakeFlow.Domain;

public class StatusHistory
{
    public int StatusHistoryId { get; set; }
    public int OrderId { get; set; }
    public Order? Order { get; set; }

    public string Status { get; set; } = string.Empty;
    public string ChangedBy { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}