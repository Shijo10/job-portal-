// Get worker info from URL
const urlParams = new URLSearchParams(window.location.search);
const workerId = urlParams.get('workerId');
const workerName = urlParams.get('workerName');
const hourlyRate = parseFloat(urlParams.get('hourlyRate')) || 500;

if (!workerId || !workerName) {
    window.location.href = '/browse-workers';
}

// Payment data
let paymentData = {};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Display worker info
    const initials = workerName.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('worker-avatar').textContent = initials;
    document.getElementById('worker-name').textContent = workerName;
    document.getElementById('hourly-rate').textContent = hourlyRate.toLocaleString('en-IN');
    document.getElementById('summary-rate').textContent = hourlyRate.toLocaleString('en-IN');
    
    // Set minimum start date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').setAttribute('min', today);
    document.getElementById('start-date').value = today;
    
    // Setup event listeners
    setupEventListeners();
    
    // Calculate initial total
    calculateTotal();
});

// Setup event listeners
function setupEventListeners() {
    // Update total when hours change
    document.getElementById('estimated-hours').addEventListener('input', calculateTotal);
    
    // Payment method selection
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Hide all payment details
            document.querySelectorAll('.payment-details').forEach(el => {
                el.style.display = 'none';
            });
            
            // Show selected payment details
            const method = e.target.value;
            const detailsEl = document.getElementById(`${method}-details`);
            if (detailsEl) {
                detailsEl.style.display = 'block';
            }
        });
    });
    
    // Form submission
    document.getElementById('payment-form').addEventListener('submit', handlePayment);
    
    // Download receipt button
    document.getElementById('download-receipt-btn').addEventListener('click', generatePDF);
}

// Calculate total amount
function calculateTotal() {
    const hours = parseInt(document.getElementById('estimated-hours').value) || 4;
    document.getElementById('summary-hours').textContent = hours;
    
    const subtotal = hourlyRate * hours;
    const platformFee = subtotal * 0.05; // 5% platform fee
    const gst = (subtotal + platformFee) * 0.18; // 18% GST
    const total = subtotal + platformFee + gst;
    
    document.getElementById('summary-subtotal').textContent = Math.round(subtotal).toLocaleString('en-IN');
    document.getElementById('summary-fee').textContent = Math.round(platformFee).toLocaleString('en-IN');
    document.getElementById('summary-gst').textContent = Math.round(gst).toLocaleString('en-IN');
    document.getElementById('summary-total').textContent = Math.round(total).toLocaleString('en-IN');
    document.getElementById('total-amount').textContent = Math.round(total).toLocaleString('en-IN');
}

// Handle payment
async function handlePayment(e) {
    e.preventDefault();
    
    // Get form data
    const jobTitle = document.getElementById('job-title').value;
    const jobDescription = document.getElementById('job-description').value;
    const estimatedHours = parseInt(document.getElementById('estimated-hours').value);
    const startDate = document.getElementById('start-date').value;
    const workLocation = document.getElementById('work-location').value;
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    // Calculate amounts
    const subtotal = hourlyRate * estimatedHours;
    const platformFee = subtotal * 0.05;
    const gst = (subtotal + platformFee) * 0.18;
    const total = subtotal + platformFee + gst;
    
    // Store payment data
    paymentData = {
        receiptId: 'RCP-' + Date.now(),
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN'),
        workerName,
        workerId,
        jobTitle,
        jobDescription,
        estimatedHours,
        startDate,
        workLocation,
        paymentMethod,
        hourlyRate,
        subtotal: Math.round(subtotal),
        platformFee: Math.round(platformFee),
        gst: Math.round(gst),
        total: Math.round(total),
        customerName: sessionStorage.getItem('customerName') || 'Customer',
        customerId: sessionStorage.getItem('customerId') || 'N/A'
    };
    
    // Simulate payment processing
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
    
    setTimeout(() => {
        // Show success modal
        document.getElementById('receipt-id').textContent = paymentData.receiptId;
        document.getElementById('success-modal').classList.add('show');
        
        // Reset button
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-lock"></i> Pay ₹<span id="total-amount">' +
                        Math.round(total).toLocaleString('en-IN') + '</span>';
    }, 2000);
}

// Generate PDF Receipt
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Colors
    const primaryColor = [5, 150, 105]; // #059669
    const textColor = [31, 41, 55]; // #1f2937
    const grayColor = [107, 114, 128]; // #6b7280

    // Header with gradient effect
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, 210, 40, 'F');

    // Company Logo/Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('JobConnect', 20, 20);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Professional Worker Hiring Platform', 20, 28);

    // Receipt Title
    doc.setTextColor(...textColor);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('PAYMENT RECEIPT', 20, 55);

    // Receipt ID and Date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...grayColor);
    doc.text(`Receipt ID: ${paymentData.receiptId}`, 20, 65);
    doc.text(`Date: ${paymentData.date} ${paymentData.time}`, 20, 72);

    // Divider
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 78, 190, 78);

    // Customer Details
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...textColor);
    doc.text('Customer Details', 20, 90);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...grayColor);
    doc.text(`Name: ${paymentData.customerName}`, 20, 98);
    doc.text(`Customer ID: ${paymentData.customerId}`, 20, 105);

    // Worker Details
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...textColor);
    doc.text('Worker Details', 20, 120);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...grayColor);
    doc.text(`Name: ${paymentData.workerName}`, 20, 128);
    doc.text(`Worker ID: ${paymentData.workerId}`, 20, 135);

    // Job Details
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...textColor);
    doc.text('Job Details', 20, 150);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...grayColor);
    doc.text(`Job Title: ${paymentData.jobTitle}`, 20, 158);

    // Job description with text wrapping
    const descLines = doc.splitTextToSize(`Description: ${paymentData.jobDescription}`, 170);
    doc.text(descLines, 20, 165);

    const descHeight = descLines.length * 7;
    let currentY = 165 + descHeight;

    doc.text(`Location: ${paymentData.workLocation}`, 20, currentY);
    currentY += 7;
    doc.text(`Start Date: ${new Date(paymentData.startDate).toLocaleDateString('en-IN')}`, 20, currentY);
    currentY += 7;
    doc.text(`Estimated Hours: ${paymentData.estimatedHours} hours`, 20, currentY);
    currentY += 15;

    // Payment Breakdown
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...textColor);
    doc.text('Payment Breakdown', 20, currentY);
    currentY += 10;

    // Table
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...grayColor);

    const tableData = [
        ['Worker Rate', `₹${paymentData.hourlyRate}/hour x ${paymentData.estimatedHours} hours`, `₹${paymentData.subtotal.toLocaleString('en-IN')}`],
        ['Platform Fee (5%)', '', `₹${paymentData.platformFee.toLocaleString('en-IN')}`],
        ['GST (18%)', '', `₹${paymentData.gst.toLocaleString('en-IN')}`]
    ];

    tableData.forEach((row, index) => {
        doc.text(row[0], 20, currentY);
        doc.text(row[1], 80, currentY);
        doc.text(row[2], 160, currentY, { align: 'right' });
        currentY += 7;
    });

    // Divider
    currentY += 3;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, currentY, 190, currentY);
    currentY += 10;

    // Total
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Total Amount Paid', 20, currentY);
    doc.text(`₹${paymentData.total.toLocaleString('en-IN')}`, 190, currentY, { align: 'right' });
    currentY += 10;

    // Payment Method
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...grayColor);
    doc.text(`Payment Method: ${paymentData.paymentMethod.toUpperCase()}`, 20, currentY);
    currentY += 15;

    // Footer
    doc.setDrawColor(229, 231, 235);
    doc.line(20, currentY, 190, currentY);
    currentY += 10;

    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('Thank you for using JobConnect!', 105, currentY, { align: 'center' });
    currentY += 5;
    doc.text('For support, contact: support@jobconnect.com | +91 1800-123-4567', 105, currentY, { align: 'center' });

    // Save PDF
    doc.save(`JobConnect_Receipt_${paymentData.receiptId}.pdf`);
}

