namespace CakeFlow.Domain;

public class OrderItem
{
    public int OrderItemId { get; set; }
    public int OrderId { get; set; }
    public Order? Order { get; set; }

    public string CakeType { get; set; } = string.Empty;
    public string Flavour { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? Notes { get; set; }
}