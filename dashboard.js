dashboard.js
---------------
    document.addEventListener('DOMContentLoaded', () => {
    // Initialize ag-Grid
    new agGrid.Grid(document.querySelector('#allDataGrid'), gridOptions);
    
    // Set today's date as default for the date filter input
    const today = getCurrentDate();
    console.log("Setting initial date filter input to today:", today);
    document.getElementById("date-filter").value = today;
    
    // Initially filter the grid by today's date
    filterByDate(today);
    
    // Show the main data section
    showAllDataSection();
});

let allDataGridApi;
let savedData = [];

const columnDefs = [
    {
        headerName: 'Actions',
        field: 'actions',
        sortable: false,
        filter: false,
        resizable: false,
        width: 100,
        cellRenderer: function(params) {
            return `
                <div class="action-icons">
                    <a href="/edit/${params.data.logId}" class="edit-log"><i class="fa-solid fa-pen-to-square"></i></a>
                    <a href="/delete_log/${params.data.logId}" onclick="return confirm('Are you sure?')" class="delete-log"><i class="fa-solid fa-trash"></i></a>
                </div>`;
        },
        cellStyle: {
            display: 'flex',
            alignItems: 'center'
        }
    },
    {
        headerName: 'Date',
        field: 'date',
        filter: 'agDateColumnFilter',
        filterParams: {
            comparator: dateComparator
        },
        sortable: true,
        resizable: true,
        valueFormatter: formatDate,
        cellClass: 'ag-cell-content'
    },
    {
        headerName: 'Employee Name',
        field: 'employeeName',
        sortable: true,
        resizable: true,
        cellClass: 'ag-cell-content'
    },
    {
        headerName: 'Task Description',
        field: 'taskDescription',
        sortable: true,
        resizable: true,
        cellClass: 'ag-cell-content'
    },
    {
        headerName: 'Planned Hours',
        field: 'plannedHours',
        sortable: true,
        resizable: true,
        valueFormatter: formatTime,
        cellClass: 'ag-cell-content'
    },
    {
        headerName: 'Actual Hours',
        field: 'actualHours',
        sortable: true,
        resizable: true,
        valueFormatter: formatTime,
        cellClass: 'ag-cell-content'
    },
    {
        headerName: 'Code Review Status',
        field: 'codeReviewStatus',
        sortable: true,
        resizable: true,
        cellClass: 'ag-cell-content'
    },
    {
        headerName: 'Productivity Rating',
        field: 'productivityRating',
        sortable: true,
        resizable: true,
        cellClass: 'ag-cell-content'
    },
    {
        headerName: 'Quality Testing',
        field: 'qualityRating',
        sortable: true,
        resizable: true,
        cellClass: 'ag-cell-content'
    },
    {
        headerName: 'Status',
        field: 'status',
        sortable: true,
        resizable: true,
        cellClass: 'ag-cell-content'
    }
];

function formatDate(params) {
    if (!params.value) return '';
    
    let dateStr = params.value;
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
    }
    
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr; // Return original if invalid
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Date formatting error:", e);
        return dateStr; // Return original if there's an error
    }
}

function dateComparator(filterLocalDateAtMidnight, cellValue) {
    if (!cellValue) return -1;
    
    let cellDateStr = cellValue;
    if (typeof cellValue === 'string' && cellValue.includes('T')) {
        cellDateStr = cellValue.split('T')[0];
    }
    
    try {
        const cellDate = new Date(cellDateStr);
        cellDate.setHours(0, 0, 0, 0);
        
        if (isNaN(cellDate.getTime())) return 0; // Skip comparison if invalid date
        
        if (cellDate < filterLocalDateAtMidnight) return -1;
        if (cellDate > filterLocalDateAtMidnight) return 1;
        return 0;
    } catch (e) {
        console.error("Date comparison error:", e);
        return 0;
    }
}

function formatTime(params) {
    const value = params.value;
    if (!value && value !== 0) return '';
    
    try {
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (e) {
        console.error("Time formatting error:", e);
        return '00:00';
    }
}

const gridOptions = {
    columnDefs: columnDefs,
    rowData: [],
    onGridReady: params => {
        allDataGridApi = params.api;
        
        // Log that grid is ready
        console.log("AG Grid is ready, fetching logs...");
        
        // Fetch logs when grid is ready
        fetchLogs();
    },
    pagination: true,
    paginationPageSize: 10,
    domLayout: 'normal',
    onCellClicked: function(event) {
        // Handle clicks on edit or delete links
        if (event.column.colId === 'actions') {
            const clickedElement = event.event.target;
            
            const isEditIcon = clickedElement.classList.contains('fa-pen-to-square') ||
                (clickedElement.parentElement && clickedElement.parentElement.classList.contains('edit-log'));
            
            const isDeleteIcon = clickedElement.classList.contains('fa-trash') ||
                (clickedElement.parentElement && clickedElement.parentElement.classList.contains('delete-log'));
            
            if (isEditIcon) {
                event.event.preventDefault();
                window.location.href = `/edit_log/${event.data.logId}`;
                console.log("Edit clicked for log ID:", event.data.logId);
            } else if (isDeleteIcon) {
                console.log("Delete clicked for log ID:", event.data.logId);
            }
        }
    },
    onRowDataUpdated: function() {
        console.log("Grid row data updated");
    }
};

function getCurrentDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
}

function showTable() {
    document.getElementById('table-section').style.display = 'block';
    document.getElementById('all-data-section').style.display = 'none';
    document.getElementById('button-container').style.display = 'flex'; // Show the buttons
    
    // Add a row if the table is empty
    if (document.querySelector('#student-table tbody').children.length === 0) {
        addRow();
    }
}

function hideTable() {
    document.getElementById('table-section').style.display = 'none';
    document.getElementById('all-data-section').style.display = 'block';
    document.getElementById('button-container').style.display = 'none'; // Hide buttons
}

function showAllDataSection() {
    document.getElementById('table-section').style.display = 'none';
    document.getElementById('all-data-section').style.display = 'block';
    document.getElementById('button-container').style.display = 'none'; // Hide buttons initially
}

// Function to add a new row
function addRow() {
    const tableBody = document.querySelector('#student-table tbody');
    const newRow = tableBody.insertRow();
    newRow.innerHTML = `
        <td><input type="date" class="clean-input" name="date" /></td>
        <td>
            <select class="clean-input" name="employeeName">
                <option value="">Select</option>
                {% for user in user_profiles %}
                <option value="{{ user.userName }}">{{ user.userName }}</option>
                {% endfor %}
            </select>
        </td>
        <td><input type="text" class="clean-input" name="taskDescription" /></td>
        <td><input type="time" class="clean-input" name="plannedHours" value="00:00" step="300" /></td>
        <td><input type="time" class="clean-input" name="actualHours" value="00:00" step="300" /></td>
        <td>
            <select class="clean-input" name="codeReviewStatus">
                <option value="">Select</option>
                <option value="Done">Done</option>
                <option value="Working">Working</option>
                <option value="Not Yet Started">Not Yet Started</option>
            </select>
        </td>
        <td><input type="number" min="1" max="10" value="0" class="clean-input" name="productivityRating" /></td>
        <td><input type="number" min="1" max="10" value="0" class="clean-input" name="qualityRating" /></td>
        <td><input type="text" class="clean-input" name="status" /></td>
    `;
}

// Function to save logs
function saveLogs() {
    const form = document.getElementById('add-log-form');
    const formData = new FormData(form);
    const logEntries = [];
    const rows = document.querySelectorAll('#student-table tbody tr');
    
    rows.forEach(row => {
        const dateInput = row.querySelector('input[name="date"]');
        const employeeNameSelect = row.querySelector('select[name="employeeName"]');
        const taskDescriptionInput = row.querySelector('input[name="taskDescription"]');
        const plannedHoursInput = row.querySelector('input[name="plannedHours"]');
        const actualHoursInput = row.querySelector('input[name="actualHours"]');
        const codeReviewStatusSelect = row.querySelector('select[name="codeReviewStatus"]');
        const productivityRatingInput = row.querySelector('input[name="productivityRating"]');
        const qualityRatingInput = row.querySelector('input[name="qualityRating"]');
        const statusInput = row.querySelector('input[name="status"]');
        
        if (employeeNameSelect.value) {
            const plannedTimeParts = plannedHoursInput.value.split(':');
            const actualTimeParts = actualHoursInput.value.split(':');
            
            logEntries.push({
                date: dateInput.value,
                employeeName: employeeNameSelect.value,
                taskDescription: taskDescriptionInput.value,
                plannedHours: (parseInt(plannedTimeParts[0]) * 60) + parseInt(plannedTimeParts[1]),
                actualHours: (parseInt(actualTimeParts[0]) * 60) + parseInt(actualTimeParts[1]),
                codeReviewStatus: codeReviewStatusSelect.value,
                productivityRating: productivityRatingInput.value ? parseInt(productivityRatingInput.value) : null,
                qualityRating: qualityRatingInput.value ? parseInt(qualityRatingInput.value) : null,
                status: statusInput.value,
            });
        }
    });
    
    if (logEntries.length === 0) {
        alert('Please fill in at least one row with employee data.');
        return;
    }
    
    fetch('/save_logs/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': '{{ csrf_token }}',
        },
        body: JSON.stringify({
            logs: logEntries
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Logs saved successfully!');
            hideTable();
            fetchLogs(); // Reload data and update grid
        } else {
            alert('Failed to save logs. ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while saving.');
    });
}

// Function to filter by date
function filterByDate(date) {
    console.log("Filtering by date:", date);
    
    if (date) {
        console.log("Filtering ag-Grid to specific date:", date);
        if (allDataGridApi) {
            const dateFilterComponent = allDataGridApi.getFilterInstance('date');
            if (dateFilterComponent) {
                try {
                    // Create a Date object from the input value
                    const selectedDate = new Date(date);
                    selectedDate.setHours(0, 0, 0, 0); // Ensure time is at midnight for comparison
                    
                    dateFilterComponent.setModel({
                        type: 'equals',
                        dateFrom: selectedDate,
                        dateTo: null // Ensure no 'to' date is set for equals filter
                    });
                    
                    allDataGridApi.onFilterChanged();
                } catch (error) {
                    console.error("Error applying date filter:", error);
                }
            } else {
                console.log("Date filter component not found in ag-Grid.");
            }
        }
        
        // Update the filtered data table
        filterDataByDate(date);
    } else {
        // Default to current date if no date is specified
        const today = getCurrentDate();
        console.log("No date specified, defaulting to today:", today);
        
        // Apply the default date filter input
        document.getElementById("date-filter").value = today;
        filterByDate(today); // Apply the filter for today
    }
}

// Function to fetch all logs
function fetchLogs() {
    fetch('/get_logs/')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            processAndDisplayLogs(data.logs);
            
            // Apply today's date as default filter after loading data
            const today = getCurrentDate();
            console.log("Setting default date filter to today after fetch:", today);
            document.getElementById("date-filter").value = today;
            filterByDate(today); // Apply the filter for today after data is loaded
        } else {
            console.error("Failed to fetch logs:", data.message);
            // alert("Failed to fetch logs: " + data.message);
        }
    })
    .catch(error => {
        console.error('Error fetching logs:', error);
        alert("Error fetching logs: " + error.message);
    });
}

function processAndDisplayLogs(logs) {
    // Process logs from the API response
    const formattedLogs = logs.map(log => {
        // Handle Django serialized format (with model, pk, fields structure)
        if (log.model && log.pk && log.fields) {
            // Extract data from the fields property
            const fields = log.fields;
            
            // Convert time values to minutes
            let plannedHours = 0;
            let actualHours = 0;
            
            if (fields.plannedHours) {
                plannedHours = parseInt(fields.plannedHours);
            }
            
            if (fields.actualHours) {
                actualHours = parseInt(fields.actualHours);
            }
            
            // Format the date
            let formattedDate = fields.date;
            if (typeof fields.date === 'string' && fields.date.includes('T')) {
                formattedDate = fields.date.split('T')[0]; // Extract just the date part
            }
            
            // Create a properly structured object
            return {
                logId: log.pk,
                date: formattedDate,
                employeeName: fields.employeeName || '',
                taskDescription: fields.taskDescription || '',
                plannedHours: plannedHours,
                actualHours: actualHours,
                codeReviewStatus: fields.codeReviewStatus || '',
                productivityRating: fields.productivityRating || '',
                qualityRating: fields.qualityRating || '',
                status: fields.status || '',
                planned_hours_display: formatTimeString(plannedHours),
                actual_hours_display: formatTimeString(actualHours)
            };
        } else {
            // If data is already in the expected format
            const plannedHours = parseInt(log.plannedHours) || 0;
            const actualHours = parseInt(log.actualHours) || 0;
            
            // Format the date
            let formattedDate = log.date;
            if (typeof log.date === 'string' && log.date.includes('T')) {
                formattedDate = log.date.split('T')[0];
            }
            
            return {
                ...log,
                date: formattedDate,
                plannedHours: plannedHours,
                actualHours: actualHours,
                planned_hours_display: formatTimeString(plannedHours),
                actual_hours_display: formatTimeString(actualHours)
            };
        }
    });
    
    // Log processed data for debugging
    console.log("Processed data:", formattedLogs);
    
    // Store the data for filtering
    savedData = formattedLogs;
    
    // Update the ag-Grid
    if (allDataGridApi) {
        allDataGridApi.setRowData(formattedLogs);
    }
}

// Filter data by specific date and update the UI
function filterDataByDate(date) {
    console.log("filterDataByDate called with date:", date);
    
    if (!savedData || savedData.length === 0) {
        console.log("No data available for filtering");
        const tableBody = document.querySelector('#filtered-table tbody');
        tableBody.innerHTML = '<tr><td colspan="10">No data available.</td></tr>';
        return;
    }
    
    // Filter data for the specific date
    const filteredData = savedData.filter(item => {
        // Normalize both dates to YYYY-MM-DD format for comparison
        const itemDate = typeof item.date === 'string' ? item.date.split('T')[0] : item.date;
        const result = itemDate === date;
        return result;
    });
    console.log(`Found ${filteredData.length} records for date ${date}`);
    
    // Update the filtered table
    const tableBody = document.querySelector('#filtered-table tbody');
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="10">No data available </td>`;
        tableBody.appendChild(row);
        return;
    }
    
    // Create table rows for each filtered item
    filteredData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="action-icons">
                <a href="/edit/${item.logId}"><i class="fa-solid fa-pen-to-square"></i></a>
                <a href="/delete_log/${item.logId}" onclick="return confirm('Are you sure you want to delete this log entry?')"><i class="fa-solid fa-trash"></i></a>
            </td>
            <td>${item.date || ''}</td>
            <td>${item.employeeName || ''}</td>
            <td>${item.taskDescription || ''}</td>
            <td>${item.planned_hours_display || '0:00'}</td>
            <td>${item.actual_hours_display || '0:00'}</td>
            <td>${item.codeReviewStatus || ''}</td>
            <td>${item.productivityRating || ''}</td>
            <td>${item.qualityRating || ''}</td>
            <td>${item.status || ''}</td>
        `;
        tableBody.appendChild(row);
    });
    
    console.log("Filtered table updated with date:", date);
}

// Helper function to format time
function formatTimeString(minutes) {
    if (minutes === undefined || minutes === null) return '00:00';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
}


// Global variable to track if we're in edit mode





let isEditMode = false;
let currentEditLogId = null;

// Function to open the edit form with populated data
function openEditModal(logId, date, employeeName, taskDescription, plannedHours, actualHours, codeReviewStatus, productivityRating, qualityRating, status) {
    // Instead of using the modal, we'll use the same add form
    isEditMode = true;
    currentEditLogId = logId;
    
    // Show the form section
    document.getElementById('table-section').style.display = 'flex';
    document.getElementById('all-data-section').style.display = 'none';
    document.getElementById('button-container').style.display = 'flex';
    
    // Clear any existing rows
    const tableBody = document.querySelector('#student-table tbody');
    tableBody.innerHTML = '';
    
    // Add a row with the data for editing
    const newRow = tableBody.insertRow();
    newRow.innerHTML = `
        <td><input type="date" class="clean-input" name="date" value="${date}" /></td>
        <td>
            <select class="clean-input" name="employeeName">
                <option value="${employeeName}" selected>${employeeName}</option>
            </select>
        </td>
        <td><input type="text" class="clean-input" name="taskDescription" value="${taskDescription}" /></td>
        <td><input type="time" class="clean-input" name="plannedHours" value="${formatTimeForInput(plannedHours)}" step="300" /></td>
        <td><input type="time" class="clean-input" name="actualHours" value="${formatTimeForInput(actualHours)}" step="300" /></td>
        <td>
            <select class="clean-input" name="codeReviewStatus">
                <option value="">Select</option>
                <option value="Done" ${codeReviewStatus === 'Done' ? 'selected' : ''}>Done</option>
                <option value="Working" ${codeReviewStatus === 'Working' ? 'selected' : ''}>Working</option>
                <option value="Not Yet Started" ${codeReviewStatus === 'Not Yet Started' ? 'selected' : ''}>Not Yet Started</option>
            </select>
        </td>
        <td><input type="number" min="1" max="10" value="${productivityRating || 0}" class="clean-input" name="productivityRating" /></td>
        <td><input type="number" min="1" max="10" value="${qualityRating || 0}" class="clean-input" name="qualityRating" /></td>
        <td><input type="text" class="clean-input" name="status" value="${status}" /></td>
    `;
    
    // Change the save button text to 'Update'
    document.querySelector('.save-btn').textContent = 'Update';
    document.querySelector('.save-btn').onclick = function() {
        updateLog();
    };
    
    // Set the heading to reflect we're editing
    document.querySelector('#table-section h2').textContent = 'Edit Log Details';
}

// Helper function to format time from string to input value
function formatTimeForInput(timeStr) {
    // Handle different time formats (could be HH:MM or minutes as number)
    if (!timeStr) return '00:00';
    
    if (typeof timeStr === 'string' && timeStr.includes(':')) {
        return timeStr; // Already in HH:MM format
    }
    
    // Convert from minutes to HH:MM
    const minutes = parseInt(timeStr);
    if (isNaN(minutes)) return '00:00';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Function to update the log
function updateLog() {
    const form = document.getElementById('add-log-form');
    const row = document.querySelector('#student-table tbody tr');
    
    // Get values from the form
    const dateInput = row.querySelector('input[name="date"]');
    const employeeNameSelect = row.querySelector('select[name="employeeName"]');
    const taskDescriptionInput = row.querySelector('input[name="taskDescription"]');
    const plannedHoursInput = row.querySelector('input[name="plannedHours"]');
    const actualHoursInput = row.querySelector('input[name="actualHours"]');
    const codeReviewStatusSelect = row.querySelector('select[name="codeReviewStatus"]');
    const productivityRatingInput = row.querySelector('input[name="productivityRating"]');
    const qualityRatingInput = row.querySelector('input[name="qualityRating"]');
    const statusInput = row.querySelector('input[name="status"]');
    
    // Validate fields
    if (!employeeNameSelect.value) {
        alert('Employee name is required.');
        return;
    }
    
    // Convert time values to minutes
    const plannedTimeParts = plannedHoursInput.value.split(':');
    const actualTimeParts = actualHoursInput.value.split(':');
    
    const plannedMinutes = (parseInt(plannedTimeParts[0]) * 60) + parseInt(plannedTimeParts[1]);
    const actualMinutes = (parseInt(actualTimeParts[0]) * 60) + parseInt(actualTimeParts[1]);
    
    // Prepare data for the update
    const logData = {
        logId: currentEditLogId,
        date: dateInput.value,
        employeeName: employeeNameSelect.value,
        taskDescription: taskDescriptionInput.value,
        plannedHours: plannedMinutes,
        actualHours: actualMinutes,
        codeReviewStatus: codeReviewStatusSelect.value,
        productivityRating: productivityRatingInput.value ? parseInt(productivityRatingInput.value) : null,
        qualityRating: qualityRatingInput.value ? parseInt(qualityRatingInput.value) : null,
        status: statusInput.value
    };
    
    // Send update request
    fetch('/update_log/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
        },
        body: JSON.stringify(logData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Log updated successfully!');
            resetForm();
            fetchLogs(); // Reload data and update grid
        } else {
            alert('Failed to update log. ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the log.');
    });
}

// Function to reset the form to add mode
function resetForm() {
    isEditMode = false;
    currentEditLogId = null;
    
    // Hide the form section
    hideTable();
    
    // Reset the save button text and function
    const saveBtn = document.querySelector('.save-btn');
    saveBtn.textContent = 'Save';
    saveBtn.onclick = function() {
        saveLogs();
    };
    
    // Reset the heading
    document.querySelector('#table-section h2').textContent = 'Add Log Details';
}

// Modify the existing hideTable function to also reset the form
function hideTable() {
    document.getElementById('table-section').style.display = 'none';
    document.getElementById('all-data-section').style.display = 'block';
    document.getElementById('button-container').style.display = 'none'; // Hide buttons
    
    // If we were in edit mode, reset to add mode
    if (isEditMode) {
        resetForm();
    }
}

// Format time string for display
function formatTimeString(minutes) {
    if (minutes === null || minutes === undefined) return '00:00';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Modify the existing saveLogs function to check for edit mode
function saveLogs() {
    // If we're in edit mode, call updateLog instead
    if (isEditMode) {
        updateLog();
        return;
    }
    
    const form = document.getElementById('add-log-form');
    const formData = new FormData(form);
    const logEntries = [];
    const rows = document.querySelectorAll('#student-table tbody tr');
    
    rows.forEach(row => {
        const dateInput = row.querySelector('input[name="date"]');
        const employeeNameSelect = row.querySelector('select[name="employeeName"]');
        const taskDescriptionInput = row.querySelector('input[name="taskDescription"]');
        const plannedHoursInput = row.querySelector('input[name="plannedHours"]');
        const actualHoursInput = row.querySelector('input[name="actualHours"]');
        const codeReviewStatusSelect = row.querySelector('select[name="codeReviewStatus"]');
        const productivityRatingInput = row.querySelector('input[name="productivityRating"]');
        const qualityRatingInput = row.querySelector('input[name="qualityRating"]');
        const statusInput = row.querySelector('input[name="status"]');
        
        if (employeeNameSelect.value) {
            const plannedTimeParts = plannedHoursInput.value.split(':');
            const actualTimeParts = actualHoursInput.value.split(':');
            
            logEntries.push({
                date: dateInput.value,
                employeeName: employeeNameSelect.value,
                taskDescription: taskDescriptionInput.value,
                plannedHours: (parseInt(plannedTimeParts[0]) * 60) + parseInt(plannedTimeParts[1]),
                actualHours: (parseInt(actualTimeParts[0]) * 60) + parseInt(actualTimeParts[1]),
                codeReviewStatus: codeReviewStatusSelect.value,
                productivityRating: productivityRatingInput.value ? parseInt(productivityRatingInput.value) : null,
                qualityRating: qualityRatingInput.value ? parseInt(qualityRatingInput.value) : null,
                status: statusInput.value,
            });
        }
    });
    
    if (logEntries.length === 0) {
        alert('Please fill in at least one row with employee data.');
        return;
    }
    
    fetch('/save_logs/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
        },
        body: JSON.stringify({
            logs: logEntries
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Logs saved successfully!');
            hideTable();
            fetchLogs(); // Reload data and update grid
        } else {
            alert('Failed to save logs. ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while saving.');
    });
}

// Update the click handler for edit icons in AG Grid
function initGridEventListeners() {
    // Add event listener for AG Grid cell clicks
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        // Check if the clicked element is an edit icon from AG Grid
        if (target.closest && target.closest('.edit-log')) {
            event.preventDefault();
            
            // Get the log ID from the data attribute
            const logId = target.closest('.edit-log').getAttribute('data-log-id');
            if (!logId) return;
            
            // Find the log in savedData
            const logToEdit = savedData.find(log => log.logId == logId);
            if (!logToEdit) return;
            
            // Open the edit form with this data
            openEditModal(
                logId, 
                logToEdit.date, 
                logToEdit.employeeName, 
                logToEdit.taskDescription, 
                logToEdit.plannedHours, 
                logToEdit.actualHours, 
                logToEdit.codeReviewStatus, 
                logToEdit.productivityRating, 
                logToEdit.qualityRating, 
                logToEdit.status
            );
        }
    });
}

// Function to save or update logs based on current mode
function saveOrUpdateLogs() {
    if (isEditMode) {
        updateLog();
    } else {
        saveLogs();
    }
}
    
    // Initialize ag-Grid
    new agGrid.Grid(document.querySelector('#allDataGrid'), gridOptions);
    
    // Set today's date as default for the date filter input
    const today = getCurrentDate();
    console.log("Setting initial date filter input to today:", today);
    document.getElementById("date-filter").value = today;
    
    // Initially filter the grid by today's date
    filterByDate(today);
    
    // Show the main data section
    showAllDataSection();
                                                                                                                                                                                      
                                                                                                                                                                                      
                                                                                                                                                                                      
                                                                                                                                                                                      
                                                                                                                                                                                   
