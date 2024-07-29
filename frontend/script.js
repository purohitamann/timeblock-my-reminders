document.getElementById('reminderForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const taskName = document.getElementById('taskName').value;
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    // Create reminder item
    const reminderItem = document.createElement('li');
    reminderItem.innerHTML = `
        <strong>${taskName}</strong><br>
        ${description}<br>
        Location: ${location}<br>
        Start Time: ${new Date(startTime).toLocaleString()}<br>
        End Time: ${new Date(endTime).toLocaleString()}
    `;

    // Add reminder item to list
    document.getElementById('reminderList').appendChild(reminderItem);

    // Clear form
    document.getElementById('reminderForm').reset();
});
