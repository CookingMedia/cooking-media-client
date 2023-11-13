using System.Net;
using CookingMedia.Client.Models;
using Microsoft.AspNetCore.Mvc;

namespace CookingMedia.Client.Controllers;

public class AuthController : Controller
{
    public IActionResult Login()
    {
        return View();
    }
}
