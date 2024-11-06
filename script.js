
const carModels = {
    toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Land Cruiser'],
    honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V'],
    bmw: ['3 Series', '5 Series', 'X3', 'X5', '7 Series'],
    mercedes: ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
    volkswagen: ['Golf', 'Passat', 'Tiguan', 'Atlas', 'Jetta']
};

const agentFees = {
    companyA: 500,
    companyB: 450,
    companyC: 550
};

// Update car models based on selected make
function updateCarModels() {
    const carMake = document.getElementById('carMake').value;
    const carModelSelect = document.getElementById('carModel');
    
    carModelSelect.innerHTML = '<option value="">Select Car Model</option>';
    
    if (carMake) {
        carModels[carMake].forEach(model => {
            const option = document.createElement('option');
            option.value = model.toLowerCase();
            option.textContent = model;
            carModelSelect.appendChild(option);
        });
    }
}

// Toggle custom agent fee input
function toggleCustomAgentFee() {
    const agentCompany = document.getElementById('agentCompany').value;
    const customAgentFeeInput = document.getElementById('customAgentFee');
    
    customAgentFeeInput.style.display = agentCompany === 'custom' ? 'block' : 'none';
    customAgentFeeInput.required = agentCompany === 'custom';
}

// Calculate import costs
function calculateImport() {
    const carType = document.querySelector('input[name="carType"]:checked')?.value;
    const carValue = parseFloat(document.getElementById('carValue').value) || 0;
    const engineSize = parseInt(document.getElementById('engineSize').value) || 0;
    const fuelType = document.getElementById('fuelType').value;
    const importLocation = document.getElementById('importLocation').value;
    const destinationCountry = document.getElementById('destinationCountry').value;
    const shippingMethod = document.getElementById('shippingMethod').value;
    const agentCompany = document.getElementById('agentCompany').value;

    if (!validateInputs()) {
        alert('Please fill in all required fields');
        return;
    }

    // Calculate CIF (Cost, Insurance, and Freight)
    let cifValue = calculateCIF(carValue, importLocation);

    // Calculate Import Duty (25% of CIF)
    let importDuty = cifValue * 0.25;

    // Calculate VAT (16% of CIF + Import Duty
    let vat = (cifValue + importDuty) * 0.16;
    let exciseDuty = calculateExciseDuty(engineSize, carType, cifValue);
    let shippingCost = calculateShippingCost(shippingMethod, importLocation, destinationCountry);
    let agentFee = calculateAgentFee(agentCompany);
    let additionalCosts = calculateAdditionalCosts(fuelType, carType);
    let totalCost = cifValue + importDuty + vat + exciseDuty + shippingCost + agentFee + additionalCosts;

    displayResults({
        cifValue,
        importDuty,
        vat,
        exciseDuty,
        shippingCost,
        agentFee,
        additionalCosts,
        totalCost
    });

    saveCalculation({
        carMake: document.getElementById('carMake').value,
        model: document.getElementById('carModel').value,
        cifValue: cifValue,
        totalCost: totalCost,
        date: new Date().toLocaleDateString()
    });
}

// Validation
function validateInputs() {
    const requiredInputs = document.querySelectorAll('[required]');
    for (let input of requiredInputs) {
        if (!input.value) {
            return false;
        }
    }
    return true;
}

// Calculate CIF based on car value and import location
function calculateCIF(carValue, importLocation) {
    const insuranceRate = 0.02; //in percentage
    const freightCosts = {
        usa: 2000,
        uk: 1500,
        japan: 1800,
        dubai: 1200
    };
    return carValue + (carValue * insuranceRate) + freightCosts[importLocation];
}

// Calculate Excise Duty based on engine size and car type
function calculateExciseDuty(engineSize, carType, cifValue) {
    let rate;
    if (carType === 'new') {
        rate = engineSize <= 1500 ? 0.20 : engineSize <= 2500 ? 0.25 : 0.30;
    } else {
        rate = engineSize <= 1500 ? 0.25 : engineSize <= 2500 ? 0.30 : 0.35;
    }
    return cifValue * rate;
}

// Shipping Cost
function calculateShippingCost(shippingMethod, importLocation, destinationCountry) {
    const baseCosts = {
        container20: 2000,
        container40: 3500,
        roro: 1500
    };
    const locationMultipliers = {
        usa: 1.2,
        uk: 1.1,
        japan: 1.15,
        dubai: 1.0
    };
    return baseCosts[shippingMethod] * locationMultipliers[importLocation];
}

// Agent Fee
function calculateAgentFee(agentCompany) {
    if (agentCompany === 'custom') {
        return parseFloat(document.getElementById('customAgentFee').value) || 0;
    }
    return agentFees[agentCompany] || 0;
}

// Additional Costs
function calculateAdditionalCosts(fuelType, carType) {
    let costs = 0;
    if (fuelType === 'diesel') costs += 200;
    if (fuelType === 'hybrid') costs += 300;
    if (fuelType === 'electric') costs += 400;
    if (carType === 'used') costs += 250;
    return costs;
}

// Display Results
function displayResults(results) {
    for (let key in results) {
        document.getElementById(key).textContent = formatCurrency(results[key]);
    }
    document.getElementById('results').style.display = 'block';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// Storage functions
function saveCalculation(calculationData) {
    let history = JSON.parse(localStorage.getItem('calculationHistory') || '[]');
    calculationData.id = Date.now();
    history.push(calculationData);
    localStorage.setItem('calculationHistory', JSON.stringify(history));
    displayHistory();
}

function getHistory() {
    return JSON.parse(localStorage.getItem('calculationHistory') || '[]');
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        localStorage.removeItem('calculationHistory');
        displayHistory();
    }
}

function deleteCalculation(id) {
    let history = getHistory();
    history = history.filter(calc => calc.id !== id);
    localStorage.setItem('calculationHistory', JSON.stringify(history));
    displayHistory();
}

// Display function
function displayHistory() {
    const historyList = document.getElementById('history-list');
    const history = getHistory();

    if (history.length === 0) {
        historyList.innerHTML = '<p>No calculations saved yet.</p>';
        return;
    }

    historyList.innerHTML = history.map(calc => `
        <div class="history-item">
            <button class="delete-btn" onclick="deleteCalculation(${calc.id})">×</button>
            <h3>${calc.carMake} ${calc.model}</h3>
            <p>CIF Value: ${formatCurrency(calc.cifValue)}</p>
            <p>Total Cost: ${formatCurrency(calc.totalCost)}</p>
            <p>Date: ${calc.date}</p>
        </div>
    `).join('');
}

// Export function
function exportToCSV() {
    const history = getHistory();
    if (history.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = Object.keys(history[0]).join(',');
    const rows = history.map(calc => Object.values(calc).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import_calculations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('carMake').addEventListener('change', updateCarModels);
    document.getElementById('agentCompany').addEventListener('change', toggleCustomAgentFee);
    document.getElementById('calculateButton').addEventListener('click', calculateImport);
    updateCarModels();
    toggleCustomAgentFee();
    displayHistory();
});