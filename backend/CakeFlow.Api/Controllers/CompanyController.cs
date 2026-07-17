using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using CakeFlow.Infrastructure;
using CakeFlow.Domain;

namespace CakeFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompanyController : ControllerBase
{
    private readonly CakeFlowDbContext _context;
    private readonly EmailService _email;
    private readonly IConfiguration _config;

    public CompanyController(CakeFlowDbContext context, EmailService email, IConfiguration config)
    {
        _context = context;
        _email = email;
        _config = config;
    }

    public class RegisterCompanyRequest
    {
        public string CompanyName { get; set; } = string.Empty;
        public string BusinessRegNumber { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string OwnerEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
    }

    public class InviteStaffRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // Baker, Decorator, FrontDesk, Owner
        public string Branch { get; set; } = string.Empty;
    }

    private static string GenerateToken()
    {
        return Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    }

    private static string GenerateTempPassword()
    {
        return "CF-" + Convert.ToHexString(RandomNumberGenerator.GetBytes(4));
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> RegisterCompany(RegisterCompanyRequest request)
    {
        if (await _context.Companies.AnyAsync(c => c.OwnerEmail == request.OwnerEmail))
            return BadRequest("A company is already registered with this email.");
        if (await _context.Users.AnyAsync(u => u.Email == request.OwnerEmail))
            return BadRequest("A user with this email already exists.");

        var token = GenerateToken();

        var company = new Company
        {
            Name = request.CompanyName,
            BusinessRegNumber = request.BusinessRegNumber,
            OwnerEmail = request.OwnerEmail,
            IsVerified = false,
            VerificationToken = token,
            VerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
        };
        _context.Companies.Add(company);
        await _context.SaveChangesAsync();

        var owner = new User
        {
            Name = request.OwnerName,
            Email = request.OwnerEmail,
            Role = "Owner",
            Branch = request.Branch,
            CompanyId = company.CompanyId,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };
        _context.Users.Add(owner);
        await _context.SaveChangesAsync();

        var frontendUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";
        var verifyLink = $"{frontendUrl}/verify-email?token={token}";

        await _email.SendAsync(
            request.OwnerEmail,
            "Verify your CakeFlow company account",
            $"<p>Hi {request.OwnerName},</p>" +
            $"<p>Thanks for registering <strong>{request.CompanyName}</strong> on CakeFlow.</p>" +
            $"<p><a href=\"{verifyLink}\">Click here to verify your email and activate your account</a></p>" +
            $"<p>This link expires in 24 hours.</p>"
        );

        return Ok(new { message = "Company registered. Please check your email to verify your account." });
    }

    [AllowAnonymous]
    [HttpGet("verify")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.VerificationToken == token);
        if (company == null) return BadRequest("Invalid or expired verification link.");
        if (company.VerificationTokenExpiry < DateTime.UtcNow) return BadRequest("This verification link has expired.");

        company.IsVerified = true;
        company.VerificationToken = null;
        company.VerificationTokenExpiry = null;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Email verified! You can now log in." });
    }

    [Authorize(Roles = "Owner")]
    [HttpPost("invite-staff")]
    public async Task<IActionResult> InviteStaff(InviteStaffRequest request)
    {
        var companyIdClaim = User.FindFirst("CompanyId")?.Value;
        if (companyIdClaim == null || !int.TryParse(companyIdClaim, out var companyId))
            return Unauthorized();

        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest("A user with this email already exists.");

        var tempPassword = GenerateTempPassword();

        var newUser = new User
        {
            Name = request.Name,
            Email = request.Email,
            Role = request.Role,
            Branch = request.Branch,
            CompanyId = companyId,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword)
        };
        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        var frontendUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";

        await _email.SendAsync(
            request.Email,
            "You've been invited to CakeFlow",
            $"<p>Hi {request.Name},</p>" +
            $"<p>You've been added as a <strong>{request.Role}</strong> on CakeFlow.</p>" +
            $"<p>Login: <a href=\"{frontendUrl}/login\">{frontendUrl}/login</a></p>" +
            $"<p>Email: {request.Email}<br/>Temporary password: <strong>{tempPassword}</strong></p>" +
            $"<p>Please log in and change your password as soon as possible.</p>"
        );

        return Ok(new { message = $"Invitation sent to {request.Email}." });
    }
}