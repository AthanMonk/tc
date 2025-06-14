// Data structure to store CSV information
let blackInkData = [];
let fullColorData = [];

// Function to parse CSV content
function parseCSV(csvContent) {
    try {
        const lines = csvContent.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('//'));
        
        const header = lines.shift();
        if (!header) {
            throw new Error('CSV file is missing header row');
        }

        return lines.map(line => {
            try {
                const values = line.split(',').map(val => val.trim());
                
                return {
                    productType: values[0] || '',
                    size: values[1] || '',
                    paperColor: values[2] || '',
                    parts: parseInt(values[3]) || 2,
                    sides: values[4] || '',
                    inkColor: values[5] || '',
                    quantity: parseInt(values[6]) || 0,
                    price: parseFloat(values[7]) || 0
                };
            } catch (error) {
                console.warn('Error parsing CSV line:', error);
                return null;
            }
        }).filter(entry => entry !== null);
    } catch (error) {
        console.error('Error parsing CSV content:', error);
        return [];
    }
}

// Function to update dropdowns based on selected ink color and product type
function updateDropdowns(inkColor, productType) {
    const qtyDropdown = document.getElementById('qtyDropdown');
    const sizeDropdown = document.getElementById('sizeDropdown');
    const data = inkColor === 'black' ? blackInkData : fullColorData;

    // Filter data for current product type
    const filteredData = data.filter(item => 
        item.productType === 'Carbonless Form'
    );

    // Get unique quantities and sizes
    const quantities = [...new Set(filteredData.map(item => item.quantity))]
        .sort((a, b) => a - b);
    const sizes = [...new Set(filteredData.map(item => item.size))];

    // Update quantity dropdown
    qtyDropdown.innerHTML = '<option value="" disabled selected>Quantity</option>';
    quantities.forEach(qty => {
        qtyDropdown.innerHTML += `<option value="${qty}">${qty.toLocaleString()}</option>`;
    });

    // Update size dropdown
    sizeDropdown.innerHTML = '<option value="" disabled selected>Size</option>';
    sizes.forEach(size => {
        sizeDropdown.innerHTML += `<option value="${size}">${size}</option>`;
    });
}

// Function to display price
function displayPrice(price) {
    const priceDisplay = document.getElementById('priceDisplay');
    if (price !== null) {
        priceDisplay.textContent = `$${price.toFixed(2)}`;
        priceDisplay.classList.remove('hidden');
        priceDisplay.classList.add('show');
    } else {
        priceDisplay.classList.remove('show');
        priceDisplay.classList.add('hidden');
    }
}

// Function to get price for selected combination
function getPrice(inkColor, productType, size, quantity) {
    const data = inkColor === 'black' ? blackInkData : fullColorData;
    const priceInfo = data.find(item => 
        item.productType === productType &&
        item.size === size && 
        item.quantity === parseInt(quantity)
    );
    return priceInfo ? priceInfo.price : null;
}

// Load CSV files
async function loadCSVFiles() {
    try {
        const blackUrl = 'https://raw.githubusercontent.com/AthanMonk/tc/refs/heads/main/1-Carbonless-Forms-Black.csv';
        const fullColorUrl = 'https://raw.githubusercontent.com/AthanMonk/tc/refs/heads/main/2-Carbonless-Forms-Full-Color.csv';

        const [blackResponse, fullColorResponse] = await Promise.all([
            fetch(blackUrl),
            fetch(fullColorUrl)
        ]);

        if (!blackResponse.ok || !fullColorResponse.ok) {
            throw new Error('Failed to fetch CSV files');
        }

        const [blackText, fullColorText] = await Promise.all([
            blackResponse.text(),
            fullColorResponse.text()
        ]);

        blackInkData = parseCSV(blackText);
        fullColorData = parseCSV(fullColorText);
        
        return true;
    } catch (error) {
        console.error('Error loading CSV files:', error);
        return false;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    const productDropdown = document.getElementById('productDropdown');
    const inkButtons = document.getElementById('inkButtons');
    const subDropdowns = document.getElementById('subDropdowns');
    let selectedInkButton = null;

    // Load CSV data
    const dataLoaded = await loadCSVFiles();
    if (!dataLoaded) {
        console.error('Failed to load CSV data');
        return;
    }

    // Product dropdown change handler
    productDropdown.addEventListener('change', function() {
        inkButtons.classList.remove('hidden');
        setTimeout(() => inkButtons.classList.add('show'), 10);

        if (selectedInkButton) {
            selectedInkButton.classList.remove('selected');
            selectedInkButton = null;
        }

        subDropdowns.classList.remove('show');
        setTimeout(() => subDropdowns.classList.add('hidden'), 300);
    });

    // Ink button click handlers
    document.querySelectorAll('.ink-button').forEach(button => {
        button.addEventListener('click', function() {
            if (selectedInkButton) {
                selectedInkButton.classList.remove('selected');
            }
            this.classList.add('selected');
            selectedInkButton = this;

            const inkColor = this.dataset.value;
            const productType = productDropdown.value;

            subDropdowns.classList.remove('hidden');
            setTimeout(() => {
                subDropdowns.classList.add('show');
                updateDropdowns(inkColor, productType);
            }, 10);
        });
    });

    // Sub-dropdown change handlers
    ['qtyDropdown', 'sizeDropdown'].forEach(id => {
        const dropdown = document.getElementById(id);
        dropdown.addEventListener('change', function() {
            const inkColor = selectedInkButton?.dataset.value;
            const productType = productDropdown.value === 'carbonless' ? 'Carbonless Form' : productDropdown.value;
            const size = document.getElementById('sizeDropdown').value;
            const quantity = document.getElementById('qtyDropdown').value;

            if (inkColor && productType && size && quantity) {
                const price = getPrice(inkColor, productType, size, quantity);
                displayPrice(price);
            }
        });
    });
});
