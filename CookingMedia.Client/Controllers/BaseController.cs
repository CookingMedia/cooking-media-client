using System.Text;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace CookingMedia.Client.Controllers;

public class BaseController : Controller
{
    private readonly HttpClient _httpClient;

    public BaseController(IHttpClientFactory factory)
    {
        _httpClient = factory.CreateClient("gateway");
    }

    public async Task<HttpResponseMessage> PostAsync(string uri, object payloadObj)
    {
        AddJwtToken();
        var payload = JsonConvert.SerializeObject(payloadObj);
        var content = new StringContent(payload, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(uri, content);
        return response;
    }

    public async Task<(HttpResponseMessage, T?)> PostAsync<T>(string uri, object payloadObj)
    {
        AddJwtToken();
        var payload = JsonConvert.SerializeObject(payloadObj);
        var content = new StringContent(payload, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(uri, content);
        T? resultContent = default;
        if (response.IsSuccessStatusCode)
        {
            resultContent = JsonConvert.DeserializeObject<T>(
                response.Content.ReadAsStringAsync().Result
            );
        }
        return (response, resultContent);
    }

    public async Task<HttpResponseMessage> DeleteAsync(string uri)
    {
        AddJwtToken();
        var response = await _httpClient.DeleteAsync(uri);
        return response;
    }

    public async Task<HttpResponseMessage> PutAsync(string uri, object payloadObj)
    {
        AddJwtToken();
        var payload = JsonConvert.SerializeObject(payloadObj);
        var content = new StringContent(payload, Encoding.UTF8, "application/json");
        var response = await _httpClient.PutAsync(uri, content);
        return response;
    }

    public async Task<(HttpResponseMessage, T?)> GetAsync<T>(
        string uriStr,
        Dictionary<string, object?>? parameters = default
    )
    {
        AddJwtToken();

        var response = await _httpClient.GetAsync(uriStr + "?" + BuildQuery(parameters));
        T? content = default;
        if (response.IsSuccessStatusCode)
        {
            content = JsonConvert.DeserializeObject<T>(response.Content.ReadAsStringAsync().Result);
        }
        return (response, content);
    }

    private static string BuildQuery(Dictionary<string, object?>? parameters)
    {
        if (parameters == null)
        {
            return "";
        }
        var queryBuilder = new StringBuilder();
        foreach (var (key, value) in parameters)
        {
            if (queryBuilder.Length > 0)
            {
                queryBuilder.Append($"&{key}={value}");
            }
            else
            {
                queryBuilder.Append($"{key}={value}");
            }
        }

        return queryBuilder.ToString();
    }

    private void AddJwtToken()
    {
        var jwtToken = HttpContext.Session.GetString(Constants.JwtToken);
        if (jwtToken == null)
            return;
        _httpClient.DefaultRequestHeaders.Add(Constants.JwtToken, jwtToken);
    }
}
