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
    const url = 'https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/wiki/2024_Summer_Olympics_medal_table';
    
    // Fetch the page content
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        // Parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Find the table with the title "2024 Summer Olympics medal table"
        const table = doc.querySelector('table.wikitable');
        const headers =  ['Rank', 'Country', 'Gold', 'Silver', 'Bronze', 'Total', 'Score'];
        const rows = [];
        // Extract table rows
        table.querySelectorAll('tbody tr').forEach((element, index) => {
            const row = {};
            if (index === 0) {
                return;
            }
            let foundFirstTh = false;
            let headerIdx = 1;
            let badRow = false;
            element.querySelectorAll('td, th').forEach((el) => {
                if (el.tagName.toLowerCase() === 'th') {
                    foundFirstTh = true;
                }
                if (foundFirstTh) {
                    let value = el.textContent.trim();
                    if (headerIdx === 1) {
                        if (value.includes('Totals')) {
                            badRow = true;
                        } else if (value.includes('France')) {
                            value = 'France';
                        }
                    }
                    if (!isNaN(value)) {
                        value = Number(value);
                    }
                    row[headers[headerIdx]] = value;
                    headerIdx += 1;
                }
            });
            row['Score'] = 3 * Number(row['Gold']) + 2 * Number(row['Silver']) + 1 * Number(row['Bronze']);
            if (!badRow) {
                rows.push(row);
            }
            console.log(row);
        });
        const tableBody = document.querySelector('#medal-table tbody');

        // Append rows
        rows.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(header => {
                console.log(header);
                const td = document.createElement('td');
                td.textContent = row[header];
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
        // Call this function after populating your table
        makeTableSortable('medal-table');
    } catch (error) {
        console.error('Error fetching the page:', error);
    }

});
