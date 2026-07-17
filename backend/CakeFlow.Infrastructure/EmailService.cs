using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace CakeFlow.Infrastructure;

public class EmailService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;

    public EmailService(string apiKey)
    {
        _apiKey = apiKey;
        _http = new HttpClient { BaseAddress = new Uri("https://api.resend.com/") };
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public async Task SendAsync(string to, string subject, string htmlBody)
    {
        var payload = new
        {
            from = "CakeFlow <onboarding@resend.dev>",
            to = new[] { to },
            subject,
            html = htmlBody
        };

        var response = await _http.PostAsJsonAsync("emails", payload);
        response.EnsureSuccessStatusCode();
    }
}