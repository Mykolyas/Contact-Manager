$(document).ready(function () {
    let currentSort = { column: '', direction: 'asc' };
    let originalData = [];

    // Initialize data
    function initializeData() {
        originalData = [];
        $('#contactsTable tbody tr').each(function () {
            const row = $(this);
            const contact = {
                id: row.data('id'),
                name: row.find('[data-field="name"]').text().trim(),
                dateOfBirth: row.find('[data-field="dateOfBirth"]').text().trim(),
                married: row.find('[data-field="married"]').find('.fa-check').length > 0,
                phone: row.find('[data-field="phone"]').text().trim(),
                salary: parseFloat(row.find('[data-field="salary"]').text().replace(/[$,]/g, ''))
            };
            originalData.push(contact);
        });
    }

    // Search functionality
    $('#searchInput').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        filterTable(searchTerm);
    });

    // Sort functionality
    $('#sortSelect, #orderSelect').on('change', function () {
        const sortColumn = $('#sortSelect').val();
        const sortDirection = $('#orderSelect').val();
        sortTable(sortColumn, sortDirection);
    });

    // Clear filters
    $('#clearFilters').on('click', function () {
        $('#searchInput').val('');
        $('#sortSelect').val('name');
        $('#orderSelect').val('asc');
        displayData(originalData);
    });

    // Filter table
    function filterTable(searchTerm) {
        const filteredData = originalData.filter(contact => {
            return contact.name.toLowerCase().includes(searchTerm) ||
                contact.phone.toLowerCase().includes(searchTerm) ||
                contact.dateOfBirth.includes(searchTerm) ||
                contact.salary.toString().includes(searchTerm);
        });
        displayData(filteredData);
    }

    // Sort table
    function sortTable(column, direction) {
        const sortedData = [...originalData].sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            if (column === 'dateOfBirth') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else if (column === 'salary') {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            } else if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
        displayData(sortedData);
    }

    // Display data in table
    function displayData(data) {
        const tbody = $('#contactsTable tbody');
        tbody.empty();

        data.forEach(contact => {
            const row = `
                <tr data-id="${contact.id}">
                    <td>
                        <span class="editable" data-field="name">${contact.name}</span>
                    </td>
                    <td>
                        <span class="editable" data-field="dateOfBirth" data-type="date">${contact.dateOfBirth}</span>
                    </td>
                    <td>
                        <span class="editable" data-field="married" data-type="checkbox">
                            ${contact.married ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>'}
                        </span>
                    </td>
                    <td>
                        <span class="editable" data-field="phone">${contact.phone}</span>
                    </td>
                    <td>
                        <span class="editable" data-field="salary" data-type="number">$${contact.salary.toLocaleString()}</span>
                    </td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-danger delete-btn" data-id="${contact.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });

        // Re-attach event handlers
        attachEventHandlers();
    }

    // Inline editing functionality
    $(document).on('click', '.editable', function () {
        const element = $(this);
        const field = element.data('field');
        const type = element.data('type');
        const currentValue = element.text().trim();

        if (element.hasClass('editing')) return;

        element.addClass('editing');
        const originalContent = element.html();

        let inputElement;
        switch (type) {
            case 'date':
                inputElement = `<input type="date" value="${currentValue}" class="form-control form-control-sm">`;
                break;
            case 'number':
                const numValue = currentValue.replace(/[$,]/g, '');
                inputElement = `<input type="number" step="0.01" value="${numValue}" class="form-control form-control-sm">`;
                break;
            case 'checkbox':
                const isChecked = element.find('.fa-check').length > 0;
                inputElement = `<select class="form-select form-select-sm">
                    <option value="true" ${isChecked ? 'selected' : ''}>Yes</option>
                    <option value="false" ${!isChecked ? 'selected' : ''}>No</option>
                </select>`;
                break;
            default:
                inputElement = `<input type="text" value="${currentValue}" class="form-control form-control-sm">`;
        }

        element.html(inputElement);
        element.find('input, select').focus();

        // Handle save on blur or enter
        element.find('input, select').on('blur keypress', function (e) {
            if (e.type === 'blur' || (e.type === 'keypress' && e.which === 13)) {
                saveEdit(element, field, originalContent);
            }
        });
    });

    // Save inline edit
    function saveEdit(element, field, originalContent) {
        const row = element.closest('tr');
        const contactId = row.data('id');
        const input = element.find('input, select');
        let newValue = input.val();

        // ===== VALIDATION =====
        if (field === 'name') {
            if (!newValue || newValue.trim().length < 2) {
                showAlert('Name must contain at least 2 characters', 'danger');
                element.html(originalContent).removeClass('editing');
                return;
            }
        }

        if (field === 'phone') {
            const phoneRegex = /^[0-9+\-\s()]+$/;
            if (!newValue || !phoneRegex.test(newValue)) {
                showAlert('Invalid phone number format', 'danger');
                element.html(originalContent).removeClass('editing');
                return;
            }
        }

        if (field === 'dateOfBirth' && newValue) {
            const date = new Date(newValue);
            if (isNaN(date.getTime())) {
                showAlert('Invalid date format', 'danger');
                element.html(originalContent).removeClass('editing');
                return;
            }
            const today = new Date();
            if (date > today) {
                showAlert('Date of birth cannot be in the future', 'danger');
                element.html(originalContent).removeClass('editing');
                return;
            }
        }

        if (field === 'salary' && newValue) {
            if (isNaN(parseFloat(newValue)) || parseFloat(newValue) < 0) {
                showAlert('Invalid salary value', 'danger');
                element.html(originalContent).removeClass('editing');
                return;
            }
            newValue = parseFloat(newValue);
        }

        if (field === 'married') {
            newValue = newValue === 'true';
        }

        // ===== Prepare data for update =====
        const formData = {
            Id: contactId,
            Name: field === 'name' ? newValue : row.find('[data-field="name"]').text().trim(),
            DateOfBirth: field === 'dateOfBirth' ? newValue : row.find('[data-field="dateOfBirth"]').text().trim(),
            Married: field === 'married' ? newValue : (row.find('[data-field="married"]').find('.fa-check').length > 0),
            Phone: field === 'phone' ? newValue : row.find('[data-field="phone"]').text().trim(),
            Salary: field === 'salary' ? newValue : parseFloat(row.find('[data-field="salary"]').text().replace(/[$,]/g, ''))
        };

        // Send update request
        $.ajax({
            url: '/Contacts/Edit/' + contactId,
            type: 'POST',
            data: formData,
            headers: {
                'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
            },
            success: function (response) {
                if (response.success) {
                    updateDisplayValue(element, field, newValue);
                    showAlert(response.message, 'success');
                    initializeData();
                } else {
                    showAlert(response.errors ? response.errors.join(', ') : 'Update failed', 'danger');
                    element.html(originalContent);
                }
            },
            error: function () {
                showAlert('Error updating contact', 'danger');
                element.html(originalContent);
            },
            complete: function () {
                element.removeClass('editing');
            }
        });
    }


    // Update display value after successful edit
    function updateDisplayValue(element, field, value) {
        switch (field) {
            case 'dateOfBirth':
                element.text(value);
                break;
            case 'salary':
                element.text('$' + parseFloat(value).toLocaleString());
                break;
            case 'married':
                element.html(value ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>');
                break;
            default:
                element.text(value);
        }
    }

    // Delete functionality
    $(document).on('click', '.delete-btn', function () {
        const contactId = $(this).data('id');
        const contactName = $(this).closest('tr').find('[data-field="name"]').text().trim();

        if (confirm(`Are you sure you want to delete "${contactName}"?`)) {
            $.ajax({
                url: '/Contacts/Delete/' + contactId,
                type: 'POST',
                headers: {
                    'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
                },
                success: function (response) {
                    if (response.success) {
                        $(`tr[data-id="${contactId}"]`).fadeOut(300, function () {
                            $(this).remove();
                            initializeData();
                        });
                        showAlert(response.message, 'success');
                    } else {
                        showAlert(response.message, 'danger');
                    }
                },
                error: function () {
                    showAlert('Error deleting contact', 'danger');
                }
            });
        }
    });

    // Show alert message
    function showAlert(message, type) {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        $('.container main').prepend(alertHtml);

        // Auto-hide after 3 seconds
        setTimeout(function () {
            $('.alert').fadeOut('slow');
        }, 3000);
    }

    // Initialize on page load
    initializeData();
});
