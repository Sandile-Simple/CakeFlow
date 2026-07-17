namespace CakeFlow.Domain;

public class User
{
    public int CompanyId { get; set; }
    public Company? Company { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // Owner, Baker, Decorator, FrontDesk
    public string Branch { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
}