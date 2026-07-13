namespace CakeFlow.Domain;

public class Order
{
    public int OrderId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientContact { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public DateTime DispatchTime { get; set; }
    public string Status { get; set; } = "Pending";
    public string Branch { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<OrderItem> OrderItems { get; set; } = new();
    public DesignInstruction? DesignInstruction { get; set; }
    public List<StatusHistory> StatusHistory { get; set; } = new();
}