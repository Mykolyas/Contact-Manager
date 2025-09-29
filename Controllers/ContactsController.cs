using ContactManager.Models;
using ContactManager.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ContactManager.Controllers
{
    public class ContactsController : Controller
    {
        private readonly ContactDbContext _context;
        private readonly ICsvService _csvService;
        private readonly ILogger<ContactsController> _logger;

        public ContactsController(ContactDbContext context, ICsvService csvService, ILogger<ContactsController> logger)
        {
            _context = context;
            _csvService = csvService;
            _logger = logger;
        }

        // GET: Contacts
        public async Task<IActionResult> Index()
        {
            var contacts = await _context.Contacts.OrderByDescending(c => c.CreatedAt).ToListAsync();
            return View(contacts);
        }

        // GET: Contacts/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Contacts/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Name,DateOfBirth,Married,Phone,Salary")] Contact contact)
        {
            if (ModelState.IsValid)
            {
                contact.CreatedAt = DateTime.Now;
                _context.Add(contact);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Contact created successfully.";
                return RedirectToAction(nameof(Index));
            }
            return View(contact);
        }

        // POST: Contacts/UploadCsv
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UploadCsv(IFormFile csvFile)
        {
            try
            {
                if (csvFile == null || csvFile.Length == 0)
                {
                    TempData["Error"] = "Please select a CSV file.";
                    return RedirectToAction(nameof(Index));
                }

                if (!csvFile.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                {
                    TempData["Error"] = "Please upload a valid CSV file.";
                    return RedirectToAction(nameof(Index));
                }

                var contacts = await _csvService.ProcessCsvFileAsync(csvFile);

                if (contacts.Any())
                {
                    _context.Contacts.AddRange(contacts);
                    await _context.SaveChangesAsync();
                    TempData["Success"] = $"Successfully uploaded {contacts.Count} contacts from CSV file.";
                }
                else
                {
                    TempData["Warning"] = "No valid contacts found in the CSV file.";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading CSV file");
                TempData["Error"] = "Error processing CSV file. Please check the file format and try again.";
            }

            return RedirectToAction(nameof(Index));
        }

        // POST: Contacts/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Name,DateOfBirth,Married,Phone,Salary")] Contact contact)
        {
            if (id != contact.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    var existingContact = await _context.Contacts.FindAsync(id);
                    if (existingContact == null)
                    {
                        return NotFound();
                    }

                    existingContact.Name = contact.Name;
                    existingContact.DateOfBirth = contact.DateOfBirth;
                    existingContact.Married = contact.Married;
                    existingContact.Phone = contact.Phone;
                    existingContact.Salary = contact.Salary;
                    existingContact.UpdatedAt = DateTime.Now;

                    _context.Update(existingContact);
                    await _context.SaveChangesAsync();

                    return Json(new { success = true, message = "Contact updated successfully." });
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!ContactExists(contact.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
            }

            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return Json(new { success = false, errors = errors });
        }

        // POST: Contacts/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var contact = await _context.Contacts.FindAsync(id);
            if (contact != null)
            {
                _context.Contacts.Remove(contact);
                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Contact deleted successfully." });
            }

            return Json(new { success = false, message = "Contact not found." });
        }

        private bool ContactExists(int id)
        {
            return _context.Contacts.Any(e => e.Id == id);
        }
    }
}
