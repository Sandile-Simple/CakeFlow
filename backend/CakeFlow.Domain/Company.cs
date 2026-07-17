namespace CakeFlow.Domain;

public class Company
{
    public int CompanyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BusinessRegNumber { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public bool IsVerified { get; set; } = false;
    public string? VerificationToken { get; set; }
    public DateTime? VerificationTokenExpiry { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<User> Users { get; set; } = new();
    public List<Order> Orders { get; set; } = new();
}