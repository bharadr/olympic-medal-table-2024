function makeTableSortable(tableId) {
    const table = document.getElementById(tableId);
    const headers = table.querySelectorAll('th');
    
    function updateRanks(sortedRows, ascending) {
        sortedRows.forEach((row, index) => {
            const rankCell = row.cells[0];
            rankCell.textContent = ascending ? index + 1 : sortedRows.length - index;
        });
    }

    headers.forEach(header => {
        if (header.textContent === 'Rank' || header.textContent === 'Country') {
            return;
        }
        header.addEventListener('click', () => {
            const column = header.cellIndex;
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            
            const sortedRows = rows.sort((a, b) => {
                const aValue = a.cells[column].textContent.trim();
                const bValue = b.cells[column].textContent.trim();
                
                // Check if the values are numbers
                if (!isNaN(aValue) && !isNaN(bValue)) {
                    return Number(aValue) - Number(bValue);
                } else {
                    return aValue.localeCompare(bValue);
                }
            });
            
            // Toggle sort direction
            if (header.classList.contains('asc')) {
                sortedRows.reverse();
                header.classList.remove('asc');
                header.classList.add('desc');
            } else {
                header.classList.remove('desc');
                header.classList.add('asc');
            }
            
            // Clear existing sort indicators
            headers.forEach(h => {
                if (h !== header) {
                    h.classList.remove('asc', 'desc');
                }
            });
            
            // Reorder the rows in the table
            const tbody = table.querySelector('tbody');
            sortedRows.forEach(row => tbody.appendChild(row));
            updateRanks(sortedRows, ascending);
        });
    });
    updateRanks(Array.from(table.querySelectorAll('tbody tr')), true);
}



document.addEventListener('DOMContentLoaded', async () => {
    const endpointUrl = 'https://olympic-scraping-server.vercel.app/api/scrape'
    let rows = [];
    try {
        // Fetch data from the URL
        const response = await fetch(endpointUrl, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Decode the JSON response
        resp = await response.json();
        rows = resp['data'];
    } catch (error) {
        console.log(error);
    }

    const headers =  ['Rank', 'Country', 'Gold', 'Silver', 'Bronze', 'Total', 'Score'];
    const tableBody = document.querySelector('#medal-table tbody');

    const contestantNations = ['Poland', 'Nigeria', 'Italy', 'New Zealand', 'Switzerland', 'South Africa', 'China', 'France', 'Thailand', 'United States', 'Afghanistan', 'Ethiopia'];
    // Append rows
    rows.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header.toLowerCase()];
            if (header === "Country" && contestantNations.includes(row[header.toLowerCase()])) {
                td.style.backgroundColor = "rgb(122, 156, 210)";
            }
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
    // Call this function after populating your table
    makeTableSortable('medal-table');
});
