using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CakeFlow.Infrastructure;
using CakeFlow.Domain;
namespace CakeFlow.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly CakeFlowDbContext _context;
    private readonly IConfiguration _config;
    private static readonly string[] AllowedRoles = { "Owner", "Baker", "Decorator", "FrontDesk" };

    public AuthController(CakeFlowDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }
    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public int CompanyId { get; set; }
    }
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Name, email and password are required.");

        if (!AllowedRoles.Contains(request.Role))
            return BadRequest($"Role must be one of: {string.Join(", ", AllowedRoles)}");

        var companyExists = await _context.Companies.AnyAsync(c => c.CompanyId == request.CompanyId);
        if (!companyExists)
            return BadRequest($"No company found with CompanyId {request.CompanyId}.");

        var emailTaken = await _context.Users.AnyAsync(u => u.Email == request.Email);
        if (emailTaken)
            return Conflict("A user with this email already exists.");

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            Branch = request.Branch,
            CompanyId = request.CompanyId
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            user.UserId,
            user.Name,
            user.Email,
            user.Role,
            user.Branch,
            user.CompanyId
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized("Invalid email or password.");
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("Branch", user.Branch),
            new Claim("CompanyId", user.CompanyId.ToString())
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );
        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            user.UserId,
            user.Name,
            user.Role,
            user.Branch
        });
    }
}